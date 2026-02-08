'use server';

import { prisma } from '@/lib/prisma';
import { ProjectStatus, ProjectMilestone, Prisma } from '@prisma/client';
import { ProjectWithRelations, ProjectListItem } from '@/types/project';

// Interface de resposta padrão para actions
interface ActionResponse<T = unknown> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

/**
 * Busca projetos do usuário com suas relações
 * @param userId ID do usuário
 * @param status Filtro opcional por status
 * @returns Lista de projetos com relações
 */
export async function getProjectsByUserId(
  userId: string,
  status?: ProjectStatus
): Promise<ActionResponse<ProjectListItem[]>> {
  try {
    const projects = await prisma.project.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        briefing: {
          select: {
            id: true,
            serviceType: true,
            companyName: true,
          },
        },
        milestones: {
          orderBy: {
            order: 'asc',
          },
        },
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

    return {
      success: true,
      data: projects as ProjectListItem[],
    };
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        error: 'Erro ao buscar projetos. Tente novamente.',
      };
    }

    return {
      success: false,
      error: 'Erro ao buscar projetos. Tente novamente.',
    };
  }
}

/**
 * Busca um projeto específico com todas as relações
 * Valida que o projeto pertence ao usuário
 * @param projectId ID do projeto
 * @param userId ID do usuário
 * @returns Projeto completo com relações
 */
export async function getProjectById(
  projectId: string,
  userId: string
): Promise<ActionResponse<ProjectWithRelations>> {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        briefing: {
          select: {
            id: true,
            serviceType: true,
            companyName: true,
          },
        },
        milestones: {
          orderBy: {
            order: 'asc',
          },
        },
        files: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            files: true,
            comments: true,
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
      data: project as ProjectWithRelations,
    };
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        error: 'Erro ao buscar projeto. Tente novamente.',
      };
    }

    return {
      success: false,
      error: 'Erro ao buscar projeto. Tente novamente.',
    };
  }
}

/**
 * Retorna a contagem de projetos ativos do usuário
 * @param userId ID do usuário
 * @returns Número de projetos ativos
 */
export async function getActiveProjectsCount(userId: string): Promise<ActionResponse<number>> {
  try {
    const count = await prisma.project.count({
      where: {
        userId,
        status: ProjectStatus.ATIVO,
      },
    });

    return {
      success: true,
      data: count,
    };
  } catch (error) {
    console.error('Erro ao contar projetos ativos:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        error: 'Erro ao contar projetos. Tente novamente.',
      };
    }

    return {
      success: false,
      error: 'Erro ao contar projetos. Tente novamente.',
    };
  }
}

/**
 * Retorna estatísticas de projetos do usuário
 * @param userId ID do usuário
 * @returns Estatísticas de projetos
 */
export async function getProjectStats(userId: string): Promise<
  ActionResponse<{
    total: number;
    active: number;
    completed: number;
    archived: number;
  }>
> {
  try {
    const [total, active, completed, archived] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: ProjectStatus.ATIVO } }),
      prisma.project.count({ where: { userId, status: ProjectStatus.CONCLUIDO } }),
      prisma.project.count({ where: { userId, status: ProjectStatus.ARQUIVADO } }),
    ]);

    return {
      success: true,
      data: { total, active, completed, archived },
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);

    return {
      success: false,
      error: 'Erro ao buscar estatísticas.',
    };
  }
}
