'use server';

import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import { auth } from '@/lib/auth';
import {
  BriefingFilters,
  BriefingListItem,
  BriefingWithRelations,
  BriefingStats,
  BriefingActionResponse,
  ApproveBriefingResult,
} from '@/types/admin-briefing';
import {
  rejectBriefingSchema,
  briefingFiltersSchema,
  updateBriefingStatusSchema,
} from '@/lib/validations/admin-briefing';
import { BriefingStatus, ServiceType, ProjectStatus, Prisma } from '@prisma/client';
import { z } from 'zod';

/**
 * Busca todos os briefings com filtros opcionais
 * Inclui estatísticas e dados do usuário
 */
export async function getAllBriefings(
  filters?: BriefingFilters
): Promise<BriefingActionResponse<{ briefings: BriefingListItem[]; stats: BriefingStats }>> {
  try {
    // Validar filtros se fornecidos
    if (filters) {
      const validation = briefingFiltersSchema.safeParse(filters);
      if (!validation.success) {
        return {
          success: false,
          error: 'Filtros inválidos',
        };
      }
    }

    // Construir where clause baseado nos filtros
    const where: Prisma.BriefingWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.serviceType) {
      where.serviceType = filters.serviceType;
    }

    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      where.OR = [
        { companyName: { contains: searchTerm, mode: 'insensitive' } },
        { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
        { user: { company: { contains: searchTerm, mode: 'insensitive' } } },
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

    // Buscar briefings com relacionamentos
    const briefings = await prisma.briefing.findMany({
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
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular estatísticas
    const [total, enviados, emAnalise, aprovados, rejeitados, rascunhos] = await Promise.all([
      prisma.briefing.count(),
      prisma.briefing.count({ where: { status: 'ENVIADO' } }),
      prisma.briefing.count({ where: { status: 'EM_ANALISE' } }),
      prisma.briefing.count({ where: { status: 'APROVADO' } }),
      prisma.briefing.count({ where: { status: 'REJEITADO' } }),
      prisma.briefing.count({ where: { status: 'RASCUNHO' } }),
    ]);

    const stats: BriefingStats = {
      total,
      enviados,
      emAnalise,
      aprovados,
      rejeitados,
      rascunhos,
    };

    return {
      success: true,
      data: {
        briefings: briefings as BriefingListItem[],
        stats,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar briefings:', error);
    return {
      success: false,
      error: 'Erro ao buscar briefings. Tente novamente.',
    };
  }
}

/**
 * Busca um briefing específico por ID com todas as relações
 */
export async function getBriefingById(
  briefingId: string
): Promise<BriefingActionResponse<BriefingWithRelations>> {
  try {
    // Validar ID
    const idValidation = z.string().cuid().safeParse(briefingId);
    if (!idValidation.success) {
      return {
        success: false,
        error: 'ID de briefing inválido',
      };
    }

    const briefing = await prisma.briefing.findUnique({
      where: { id: briefingId },
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
        project: true,
      },
    });

    if (!briefing) {
      return {
        success: false,
        error: 'Briefing não encontrado',
      };
    }

    return {
      success: true,
      data: briefing as BriefingWithRelations,
    };
  } catch (error) {
    console.error('Erro ao buscar briefing:', error);
    return {
      success: false,
      error: 'Erro ao buscar briefing. Tente novamente.',
    };
  }
}

/**
 * Aprova um briefing e cria um projeto automaticamente
 * Usa transação Prisma para garantir atomicidade
 * O adminId é obtido automaticamente da sessão atual
 */
export async function approveBriefing(
  briefingId: string
): Promise<BriefingActionResponse<ApproveBriefingResult>> {
  try {
    // Obter adminId da sessão atual
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Não autenticado',
      };
    }
    const adminId = session.user.id;

    // Validar briefingId
    const idValidation = z.string().cuid().safeParse(briefingId);
    if (!idValidation.success) {
      return {
        success: false,
        error: 'ID de briefing inválido',
      };
    }

    // Buscar briefing
    const briefing = await prisma.briefing.findUnique({
      where: { id: briefingId },
      include: { user: true },
    });

    if (!briefing) {
      return {
        success: false,
        error: 'Briefing não encontrado',
      };
    }

    // Verificar se briefing pode ser aprovado
    if (briefing.status !== 'ENVIADO' && briefing.status !== 'EM_ANALISE') {
      return {
        success: false,
        error: 'Este briefing não pode ser aprovado. Status atual: ' + briefing.status,
      };
    }

    // Verificar se já existe projeto vinculado
    if (briefing.projectId) {
      return {
        success: false,
        error: 'Este briefing já possui um projeto vinculado',
      };
    }

    // Executar transação: atualizar briefing + criar projeto + milestones
    const result = await prisma.$transaction(async (tx) => {
      // Atualizar status do briefing
      await tx.briefing.update({
        where: { id: briefingId },
        data: {
          status: 'APROVADO',
          reviewedAt: new Date(),
        },
      });

      // Criar projeto a partir do briefing
      const project = await tx.project.create({
        data: {
          userId: briefing.userId,
          briefingId: briefing.id,
          name: briefing.companyName,
          description: briefing.objectives,
          status: ProjectStatus.AGUARDANDO_APROVACAO,
          progress: 0,
        },
      });

      // Criar 4 milestones padrão
      const milestones = [
        {
          name: 'Planejamento',
          description: 'Definição de escopo, requisitos e cronograma do projeto',
          order: 1,
        },
        {
          name: 'Desenvolvimento',
          description: 'Implementação das funcionalidades e integrações',
          order: 2,
        },
        {
          name: 'Testes',
          description: 'Testes de qualidade, correções e ajustes finais',
          order: 3,
        },
        {
          name: 'Entrega',
          description: 'Deploy, treinamento e entrega final do projeto',
          order: 4,
        },
      ];

      await tx.projectMilestone.createMany({
        data: milestones.map((m) => ({
          projectId: project.id,
          name: m.name,
          description: m.description,
          order: m.order,
          completed: false,
        })),
      });

      return project;
    });

    // Enviar notificação ao cliente (fora da transação)
    try {
      await createNotification({
        userId: briefing.userId,
        type: 'BRIEFING_APROVADO',
        title: 'Briefing Aprovado! 🎉',
        message: `Seu briefing para ${briefing.companyName} foi aprovado. Um projeto foi criado e nossa equipe já iniciará o trabalho.`,
        channels: ['IN_APP', 'EMAIL', 'PUSH'],
        metadata: {
          briefingId: briefing.id,
          projectId: result.id,
          companyName: briefing.companyName,
        },
      });
    } catch (notifyError) {
      console.error('Erro ao enviar notificação:', notifyError);
      // Não falha a operação se a notificação falhar
    }

    return {
      success: true,
      message: 'Briefing aprovado e projeto criado com sucesso!',
      data: { projectId: result.id },
    };
  } catch (error) {
    console.error('Erro ao aprovar briefing:', error);
    return {
      success: false,
      error: 'Erro ao aprovar briefing. Tente novamente.',
    };
  }
}

/**
 * Rejeita um briefing com motivo
 * O adminId é obtido automaticamente da sessão atual
 */
export async function rejectBriefing(
  briefingId: string,
  reason: string
): Promise<BriefingActionResponse> {
  try {
    // Obter adminId da sessão atual
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Não autenticado',
      };
    }
    const adminId = session.user.id;

    // Validar dados
    const validation = z
      .object({
        briefingId: z.string().cuid(),
        reason: z.string().min(10).max(500),
      })
      .safeParse({ briefingId, reason });

    if (!validation.success) {
      return {
        success: false,
        error: 'Dados inválidos. O motivo deve ter entre 10 e 500 caracteres.',
      };
    }

    // Buscar briefing
    const briefing = await prisma.briefing.findUnique({
      where: { id: briefingId },
      include: { user: true },
    });

    if (!briefing) {
      return {
        success: false,
        error: 'Briefing não encontrado',
      };
    }

    // Verificar se briefing pode ser rejeitado
    if (briefing.status !== 'ENVIADO' && briefing.status !== 'EM_ANALISE') {
      return {
        success: false,
        error: 'Este briefing não pode ser rejeitado. Status atual: ' + briefing.status,
      };
    }

    // Atualizar briefing
    await prisma.briefing.update({
      where: { id: briefingId },
      data: {
        status: 'REJEITADO',
        rejectionReason: reason,
        reviewedAt: new Date(),
      },
    });

    // Enviar notificação ao cliente
    try {
      await createNotification({
        userId: briefing.userId,
        type: 'BRIEFING_REJEITADO',
        title: 'Briefing Rejeitado',
        message: `Seu briefing para ${briefing.companyName} não pôde ser aprovado. Motivo: ${reason}`,
        channels: ['IN_APP', 'EMAIL', 'PUSH'],
        metadata: {
          briefingId: briefing.id,
          rejectionReason: reason,
          companyName: briefing.companyName,
        },
      });
    } catch (notifyError) {
      console.error('Erro ao enviar notificação:', notifyError);
    }

    return {
      success: true,
      message: 'Briefing rejeitado. Cliente foi notificado.',
    };
  } catch (error) {
    console.error('Erro ao rejeitar briefing:', error);
    return {
      success: false,
      error: 'Erro ao rejeitar briefing. Tente novamente.',
    };
  }
}

/**
 * Atualiza o status de um briefing manualmente
 * Não permite mudança direta para APROVADO ou REJEITADO (use as actions específicas)
 */
export async function updateBriefingStatus(
  briefingId: string,
  newStatus: BriefingStatus
): Promise<BriefingActionResponse> {
  try {
    // Validar dados
    const validation = z
      .object({
        briefingId: z.string().cuid(),
        newStatus: z.nativeEnum(BriefingStatus),
      })
      .safeParse({ briefingId, newStatus });

    if (!validation.success) {
      return {
        success: false,
        error: 'Dados inválidos',
      };
    }

    // Não permitir mudança direta para APROVADO ou REJEITADO
    if (newStatus === 'APROVADO' || newStatus === 'REJEITADO') {
      return {
        success: false,
        error: 'Use as ações específicas de aprovar ou rejeitar briefing',
      };
    }

    // Buscar briefing
    const briefing = await prisma.briefing.findUnique({
      where: { id: briefingId },
    });

    if (!briefing) {
      return {
        success: false,
        error: 'Briefing não encontrado',
      };
    }

    // Validar transições de status
    const validTransitions: Record<BriefingStatus, BriefingStatus[]> = {
      RASCUNHO: ['ENVIADO'],
      ENVIADO: ['EM_ANALISE', 'RASCUNHO'],
      EM_ANALISE: ['ENVIADO'],
      APROVADO: [],
      REJEITADO: [],
    };

    if (!validTransitions[briefing.status].includes(newStatus)) {
      return {
        success: false,
        error: `Transição de status inválida: ${briefing.status} -> ${newStatus}`,
      };
    }

    // Atualizar status
    await prisma.briefing.update({
      where: { id: briefingId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
        // Se estiver voltando para rascunho, limpar submittedAt
        submittedAt: newStatus === 'RASCUNHO' ? null : briefing.submittedAt,
      },
    });

    return {
      success: true,
      message: `Status atualizado para ${newStatus}`,
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
 * Marca um briefing como "Em Análise"
 * Atalho para updateBriefingStatus(briefingId, 'EM_ANALISE')
 */
export async function markBriefingAsInAnalysis(
  briefingId: string
): Promise<BriefingActionResponse> {
  return updateBriefingStatus(briefingId, 'EM_ANALISE');
}
