'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { calculateProgress } from '@/lib/project-utils';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/types';
import {
  AdminProjectFilters,
  AdminProjectListItem,
  AdminProjectWithRelations,
  AdminProjectStats,
  AdminProjectActionResponse,
  ToggleMilestoneResult,
  UpdateProjectStatusResult,
} from '@/types/admin-project';
import {
  updateProjectStatusSchema,
  toggleMilestoneSchema,
  addProjectNoteSchema,
  adminProjectFiltersSchema,
} from '@/lib/validations/admin-projects';
import { ProjectStatus, Prisma } from '@prisma/client';
import { z } from 'zod';

/**
 * Helper para verificar se o usuário é admin
 * Retorna erro se não for autorizado
 */
async function checkAdminAccess(): Promise<{ userId: string } | { error: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Não autenticado' };
  }

  const userRole = session.user.role;
  if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
    return { error: 'Acesso negado. Apenas administradores podem executar esta ação.' };
  }

  return { userId: session.user.id };
}

/**
 * Busca todos os projetos com filtros opcionais
 * Inclui estatísticas e dados do usuário
 */
export async function getAllProjects(
  filters?: AdminProjectFilters
): Promise<
  AdminProjectActionResponse<{ projects: AdminProjectListItem[]; stats: AdminProjectStats }>
> {
  try {
    // Validar filtros se fornecidos
    if (filters) {
      const validation = adminProjectFiltersSchema.safeParse(filters);
      if (!validation.success) {
        return {
          success: false,
          error: 'Filtros inválidos',
        };
      }
    }

    // Construir where clause baseado nos filtros
    const where: Prisma.ProjectWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.serviceType && filters.serviceType) {
      where.briefing = {
        serviceType: filters.serviceType,
      };
    }

    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
        { user: { company: { contains: searchTerm, mode: 'insensitive' } } },
        { briefing: { companyName: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    // Buscar projetos com relacionamentos
    const projects = await prisma.project.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        briefing: {
          select: {
            id: true,
            serviceType: true,
            companyName: true,
          },
        },
        milestones: true,
        _count: {
          select: {
            files: true,
            comments: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Calcular estatísticas
    const [total, ativos, concluidos, pausados, cancelados, arquivados] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ATIVO' } }),
      prisma.project.count({ where: { status: 'CONCLUIDO' } }),
      prisma.project.count({ where: { status: 'PAUSADO' } }),
      prisma.project.count({ where: { status: 'CANCELADO' } }),
      prisma.project.count({ where: { status: 'ARQUIVADO' } }),
    ]);

    const stats: AdminProjectStats = {
      total,
      ativos,
      concluidos,
      pausados,
      cancelados,
      arquivados,
    };

    return {
      success: true,
      data: {
        projects: projects as AdminProjectListItem[],
        stats,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return {
      success: false,
      error: 'Erro ao buscar projetos. Tente novamente.',
    };
  }
}

/**
 * Busca um projeto específico por ID com todas as relações para admin
 */
export async function getProjectByIdAdmin(
  projectId: string
): Promise<AdminProjectActionResponse<AdminProjectWithRelations>> {
  try {
    // Validar ID
    const idValidation = z.string().cuid().safeParse(projectId);
    if (!idValidation.success) {
      return {
        success: false,
        error: 'ID de projeto inválido',
      };
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
          },
        },
        briefing: true,
        milestones: {
          orderBy: {
            order: 'asc',
          },
        },
        files: {
          orderBy: {
            uploadedAt: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        comments: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return {
        success: false,
        error: 'Projeto não encontrado',
      };
    }

    return {
      success: true,
      data: project as AdminProjectWithRelations,
    };
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    return {
      success: false,
      error: 'Erro ao buscar projeto. Tente novamente.',
    };
  }
}

/**
 * Atualiza o status de um projeto com validação de transições permitidas
 * Requer role ADMIN ou SUPER_ADMIN
 */
export async function updateProjectStatus(
  projectId: string,
  newStatus: ProjectStatus
): Promise<AdminProjectActionResponse<UpdateProjectStatusResult>> {
  try {
    // Verificar permissões de admin
    const authCheck = await checkAdminAccess();
    if ('error' in authCheck) {
      return {
        success: false,
        error: authCheck.error,
      };
    }

    // Validar dados
    const validation = updateProjectStatusSchema.safeParse({ projectId, newStatus });
    if (!validation.success) {
      return {
        success: false,
        error: 'Dados inválidos',
      };
    }

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return {
        success: false,
        error: 'Projeto não encontrado',
      };
    }

    const oldStatus = project.status;

    // Validar transições de status
    const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      AGUARDANDO_APROVACAO: ['ATIVO', 'CANCELADO'],
      ATIVO: ['PAUSADO', 'CONCLUIDO', 'CANCELADO'],
      PAUSADO: ['ATIVO', 'CANCELADO'],
      CONCLUIDO: ['ARQUIVADO'],
      CANCELADO: [],
      ARQUIVADO: [],
    };

    if (!validTransitions[oldStatus].includes(newStatus)) {
      return {
        success: false,
        error: `Transição de status inválida: ${oldStatus} -> ${newStatus}`,
      };
    }

    // Preparar dados de atualização
    const updateData: Prisma.ProjectUpdateInput = {
      status: newStatus,
      updatedAt: new Date(),
    };

    // Definir startedAt ao ativar projeto
    if (newStatus === 'ATIVO' && !project.startedAt) {
      updateData.startedAt = new Date();
    }

    // Definir completedAt ao concluir projeto
    if (newStatus === 'CONCLUIDO') {
      updateData.completedAt = new Date();
    }

    // Atualizar projeto
    await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });

    // Enviar notificação se concluído
    if (newStatus === 'CONCLUIDO') {
      try {
        await createNotification({
          userId: project.userId,
          type: 'PROJETO_CONCLUIDO',
          title: 'Projeto Concluído! 🚀',
          message: `Seu projeto "${project.name}" foi concluído com sucesso. Obrigado por confiar na 28Web Connect!`,
          channels: ['IN_APP', 'EMAIL', 'PUSH'],
          metadata: {
            projectId: project.id,
            projectName: project.name,
            completedAt: new Date().toISOString(),
            actionUrl: `/projetos/${project.id}`,
          },
        });
      } catch (notifyError) {
        console.error('Erro ao enviar notificação:', notifyError);
      }
    }

    return {
      success: true,
      message: `Status atualizado de ${oldStatus} para ${newStatus}`,
      data: {
        oldStatus,
        newStatus,
      },
    };
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return {
      success: false,
      error: 'Erro ao atualizar status. Tente novamente.',
    };
  }
}

/**
 * Alterna o estado de conclusão de uma milestone
 * Recalcula o progresso do projeto e envia notificação
 * Requer role ADMIN ou SUPER_ADMIN
 */
export async function toggleMilestone(
  milestoneId: string,
  completed: boolean
): Promise<AdminProjectActionResponse<ToggleMilestoneResult>> {
  try {
    // Verificar permissões de admin
    const authCheck = await checkAdminAccess();
    if ('error' in authCheck) {
      return {
        success: false,
        error: authCheck.error,
      };
    }

    // Validar dados
    const validation = toggleMilestoneSchema.safeParse({ milestoneId, completed });
    if (!validation.success) {
      return {
        success: false,
        error: 'Dados inválidos',
      };
    }

    // Buscar milestone com projeto
    const milestone = await prisma.projectMilestone.findUnique({
      where: { id: milestoneId },
      include: {
        project: true,
      },
    });

    if (!milestone) {
      return {
        success: false,
        error: 'Milestone não encontrada',
      };
    }

    const projectId = milestone.projectId;

    // Executar transação: atualizar milestone + recalcular progresso
    const result = await prisma.$transaction(async (tx) => {
      // Atualizar milestone
      await tx.projectMilestone.update({
        where: { id: milestoneId },
        data: {
          completed,
          completedAt: completed ? new Date() : null,
          updatedAt: new Date(),
        },
      });

      // Buscar todas as milestones atualizadas do projeto
      const milestones = await tx.projectMilestone.findMany({
        where: { projectId },
      });

      // Calcular novo progresso
      const newProgress = calculateProgress(milestones);

      // Atualizar progresso do projeto
      await tx.project.update({
        where: { id: projectId },
        data: {
          progress: newProgress,
          updatedAt: new Date(),
        },
      });

      return { newProgress, milestones };
    });

    // Enviar notificação se concluída
    if (completed) {
      try {
        await createNotification({
          userId: milestone.project.userId,
          type: 'MILESTONE_CONCLUIDA',
          title: `Etapa "${milestone.name}" Concluída! 🎉`,
          message: `A etapa "${milestone.name}" do seu projeto "${milestone.project.name}" foi concluída. Progresso atual: ${result.newProgress}%`,
          channels: ['IN_APP', 'EMAIL', 'PUSH'],
          metadata: {
            projectId: milestone.project.id,
            milestoneId: milestone.id,
            milestoneName: milestone.name,
            progress: result.newProgress,
            actionUrl: `/projetos/${milestone.project.id}`,
          },
        });
      } catch (notifyError) {
        console.error('Erro ao enviar notificação:', notifyError);
      }
    }

    return {
      success: true,
      message: completed
        ? `Milestone "${milestone.name}" marcada como concluída`
        : `Milestone "${milestone.name}" desmarcada`,
      data: {
        progress: result.newProgress,
        milestoneCompleted: completed,
      },
    };
  } catch (error) {
    console.error('Erro ao atualizar milestone:', error);
    return {
      success: false,
      error: 'Erro ao atualizar milestone. Tente novamente.',
    };
  }
}

/**
 * Adiciona um comentário administrativo ao projeto
 * Requer role ADMIN ou SUPER_ADMIN
 */
export async function addProjectNote(
  projectId: string,
  content: string
): Promise<AdminProjectActionResponse> {
  try {
    // Verificar permissões de admin
    const authCheck = await checkAdminAccess();
    if ('error' in authCheck) {
      return {
        success: false,
        error: authCheck.error,
      };
    }

    const adminId = authCheck.userId;

    // Validar dados
    const validation = addProjectNoteSchema.safeParse({ projectId, content });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Dados inválidos',
      };
    }

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return {
        success: false,
        error: 'Projeto não encontrado',
      };
    }

    // Criar comentário
    await prisma.projectComment.create({
      data: {
        projectId,
        userId: adminId,
        content,
      },
    });

    // Atualizar timestamp do projeto
    await prisma.project.update({
      where: { id: projectId },
      data: {
        updatedAt: new Date(),
      },
    });

    // Enviar notificação ao cliente
    try {
      await createNotification({
        userId: project.userId,
        type: 'NOVA_MENSAGEM',
        title: 'Nova Mensagem no Projeto',
        message: `Você recebeu uma nova mensagem no projeto "${project.name}".`,
        channels: ['IN_APP', 'EMAIL', 'PUSH'],
        metadata: {
          projectId: project.id,
          projectName: project.name,
          actionUrl: `/projetos/${project.id}`,
        },
      });
    } catch (notifyError) {
      console.error('Erro ao enviar notificação:', notifyError);
    }

    return {
      success: true,
      message: 'Nota adicionada com sucesso',
    };
  } catch (error) {
    console.error('Erro ao adicionar nota:', error);
    return {
      success: false,
      error: 'Erro ao adicionar nota. Tente novamente.',
    };
  }
}

/**
 * Retorna estatísticas globais para dashboard admin
 */
export async function getProjectStats(): Promise<
  AdminProjectActionResponse<{
    total: number;
    ativos: number;
    concluidosEsteMes: number;
    taxaConclusao: number;
    tempoMedioConclusao: number;
  }>
> {
  try {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, ativos, concluidosEsteMes, projetosConcluidos] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ATIVO' } }),
      prisma.project.count({
        where: {
          status: 'CONCLUIDO',
          completedAt: {
            gte: inicioMes,
          },
        },
      }),
      prisma.project.findMany({
        where: {
          status: 'CONCLUIDO',
          startedAt: { not: null },
          completedAt: { not: null },
        },
        select: {
          startedAt: true,
          completedAt: true,
        },
      }),
    ]);

    // Calcular tempo médio de conclusão (em dias)
    let tempoMedioConclusao = 0;
    if (projetosConcluidos.length > 0) {
      const totalDias = projetosConcluidos.reduce((acc, p) => {
        if (p.startedAt && p.completedAt) {
          const diff = p.completedAt.getTime() - p.startedAt.getTime();
          return acc + Math.ceil(diff / (1000 * 60 * 60 * 24));
        }
        return acc;
      }, 0);
      tempoMedioConclusao = Math.round(totalDias / projetosConcluidos.length);
    }

    // Calcular taxa de conclusão (% de projetos concluídos vs total)
    const taxaConclusao = total > 0 ? Math.round((projetosConcluidos.length / total) * 100) : 0;

    return {
      success: true,
      data: {
        total,
        ativos,
        concluidosEsteMes,
        taxaConclusao,
        tempoMedioConclusao,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      success: false,
      error: 'Erro ao buscar estatísticas. Tente novamente.',
    };
  }
}
