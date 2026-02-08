'use server';

import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import { auth } from '@/lib/auth';
import {
  AdminClientFilters,
  AdminClientListItem,
  AdminClientWithHistory,
  AdminClientStats,
  AdminClientActionResponse,
  AdminMetrics,
  LeadsByMonth,
  ConversionByService,
  ProjectsByStatus,
  ClientCSVData,
} from '@/types/admin-client';
import { adminClientFiltersSchema, clientIdSchema } from '@/lib/validations/admin-client';
import { UserRole, BriefingStatus, ProjectStatus, ServiceType, Prisma } from '@prisma/client';
import { z } from 'zod';

/**
 * Verifica se o usuário atual tem permissão de administrador
 * Retorna null se autorizado, ou um objeto de erro se não autorizado
 */
async function checkAdminAuthorization(): Promise<{ success: false; error: string } | null> {
  const session = await auth();

  if (
    !session?.user?.role ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')
  ) {
    return {
      success: false,
      error: 'Não autorizado',
    };
  }

  return null;
}

/**
 * Busca métricas agregadas para o dashboard administrativo
 * Inclui leads, conversões, projetos ativos e dados para gráficos
 */
export async function getMetrics(): Promise<AdminClientActionResponse<AdminMetrics>> {
  // Verificar autorização
  const authError = await checkAdminAuthorization();
  if (authError) return authError;

  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Períodos para comparação
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const startOfPreviousMonth = new Date(previousYear, previousMonth, 1);
    const endOfPreviousMonth = new Date(currentYear, currentMonth, 0);

    // Leads do mês atual (usuários CLIENTE criados neste mês)
    const currentLeads = await prisma.user.count({
      where: {
        role: UserRole.CLIENTE,
        createdAt: {
          gte: startOfCurrentMonth,
        },
      },
    });

    // Leads do mês anterior
    const previousLeads = await prisma.user.count({
      where: {
        role: UserRole.CLIENTE,
        createdAt: {
          gte: startOfPreviousMonth,
          lt: startOfCurrentMonth,
        },
      },
    });

    // Conversões do mês atual (briefings aprovados)
    const currentConversions = await prisma.briefing.count({
      where: {
        status: BriefingStatus.APROVADO,
        reviewedAt: {
          gte: startOfCurrentMonth,
        },
      },
    });

    // Conversões do mês anterior
    const previousConversions = await prisma.briefing.count({
      where: {
        status: BriefingStatus.APROVADO,
        reviewedAt: {
          gte: startOfPreviousMonth,
          lt: startOfCurrentMonth,
        },
      },
    });

    // Total de briefings do mês atual para calcular taxa
    const currentBriefings = await prisma.briefing.count({
      where: {
        createdAt: {
          gte: startOfCurrentMonth,
        },
      },
    });

    const previousBriefings = await prisma.briefing.count({
      where: {
        createdAt: {
          gte: startOfPreviousMonth,
          lt: startOfCurrentMonth,
        },
      },
    });

    // Taxa de conversão atual
    const currentConversionRate =
      currentBriefings > 0 ? (currentConversions / currentBriefings) * 100 : 0;

    const previousConversionRate =
      previousBriefings > 0 ? (previousConversions / previousBriefings) * 100 : 0;

    // Projetos ativos
    const currentActiveProjects = await prisma.project.count({
      where: {
        status: {
          in: [ProjectStatus.ATIVO, ProjectStatus.AGUARDANDO_APROVACAO],
        },
      },
    });

    // Projetos ativos no mês anterior (aproximação por projetos criados)
    const previousActiveProjects = await prisma.project.count({
      where: {
        status: {
          in: [ProjectStatus.ATIVO, ProjectStatus.AGUARDANDO_APROVACAO],
        },
        createdAt: {
          lt: startOfCurrentMonth,
        },
      },
    });

    // Receita estimada baseada em briefings aprovados e valores de serviços
    const serviceValues: Record<ServiceType, number> = {
      [ServiceType.ERP_BASICO]: 5000,
      [ServiceType.ERP_ECOMMERCE]: 8000,
      [ServiceType.ERP_PREMIUM]: 15000,
      [ServiceType.LANDING_IA]: 3000,
      [ServiceType.LANDING_IA_WHATSAPP]: 4500,
    };

    const approvedBriefings = await prisma.briefing.findMany({
      where: {
        status: BriefingStatus.APROVADO,
        reviewedAt: {
          gte: startOfCurrentMonth,
        },
      },
      select: {
        serviceType: true,
      },
    });

    const currentRevenue = approvedBriefings.reduce((acc, b) => {
      return acc + (serviceValues[b.serviceType] || 0);
    }, 0);

    const previousApprovedBriefings = await prisma.briefing.findMany({
      where: {
        status: BriefingStatus.APROVADO,
        reviewedAt: {
          gte: startOfPreviousMonth,
          lt: startOfCurrentMonth,
        },
      },
      select: {
        serviceType: true,
      },
    });

    const previousRevenue = previousApprovedBriefings.reduce((acc, b) => {
      return acc + (serviceValues[b.serviceType] || 0);
    }, 0);

    // Leads por mês (últimos 6 meses)
    const leadsByMonth: LeadsByMonth[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const monthEnd = new Date(currentYear, currentMonth - i + 1, 0);

      const count = await prisma.user.count({
        where: {
          role: UserRole.CLIENTE,
          createdAt: {
            gte: monthDate,
            lte: monthEnd,
          },
        },
      });

      const monthLabel = monthDate.toLocaleDateString('pt-BR', {
        month: 'short',
        year: '2-digit',
      });

      leadsByMonth.push({
        month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        count,
      });
    }

    // Conversão por tipo de serviço
    const serviceTypes = Object.values(ServiceType);
    const conversionByService: ConversionByService[] = await Promise.all(
      serviceTypes.map(async (serviceType) => {
        const totalBriefings = await prisma.briefing.count({
          where: { serviceType },
        });

        const aprovados = await prisma.briefing.count({
          where: {
            serviceType,
            status: BriefingStatus.APROVADO,
          },
        });

        const taxa = totalBriefings > 0 ? (aprovados / totalBriefings) * 100 : 0;

        return {
          serviceType: serviceType.replace(/_/g, ' '),
          briefings: totalBriefings,
          aprovados,
          taxa,
        };
      })
    );

    // Projetos por status
    const projectsByStatus: ProjectsByStatus[] = await Promise.all(
      Object.values(ProjectStatus).map(async (status) => {
        const count = await prisma.project.count({
          where: { status },
        });

        return { status, count };
      })
    );

    // Calcular variações percentuais
    const leadsVariation =
      previousLeads > 0 ? ((currentLeads - previousLeads) / previousLeads) * 100 : 0;

    const conversionsVariation =
      previousConversionRate > 0
        ? ((currentConversionRate - previousConversionRate) / previousConversionRate) * 100
        : 0;

    const projectsVariation =
      previousActiveProjects > 0
        ? ((currentActiveProjects - previousActiveProjects) / previousActiveProjects) * 100
        : 0;

    const revenueVariation =
      previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const metrics: AdminMetrics = {
      leads: {
        current: currentLeads,
        previous: previousLeads,
        variation: Number(leadsVariation.toFixed(1)),
      },
      conversions: {
        current: Number(currentConversionRate.toFixed(1)),
        previous: Number(previousConversionRate.toFixed(1)),
        variation: Number(conversionsVariation.toFixed(1)),
      },
      activeProjects: {
        current: currentActiveProjects,
        previous: previousActiveProjects,
        variation: Number(projectsVariation.toFixed(1)),
      },
      estimatedRevenue: {
        current: currentRevenue,
        previous: previousRevenue,
        variation: Number(revenueVariation.toFixed(1)),
      },
      leadsByMonth,
      conversionByService,
      projectsByStatus,
    };

    return {
      success: true,
      data: metrics,
    };
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return {
      success: false,
      error: 'Erro ao buscar métricas. Tente novamente.',
    };
  }
}

/**
 * Busca todos os clientes com filtros opcionais e estatísticas
 */
export async function getClients(
  filters?: AdminClientFilters
): Promise<AdminClientActionResponse<{ clients: AdminClientListItem[]; stats: AdminClientStats }>> {
  // Verificar autorização
  const authError = await checkAdminAuthorization();
  if (authError) return authError;

  try {
    // Validar filtros se fornecidos
    if (filters) {
      const validation = adminClientFiltersSchema.safeParse(filters);
      if (!validation.success) {
        return {
          success: false,
          error: 'Filtros inválidos',
        };
      }
    }

    // Construir where clause baseado nos filtros
    const where: Prisma.UserWhereInput = {
      role: UserRole.CLIENTE,
    };

    // Filtro por status (ativo/inativo)
    if (filters?.status) {
      if (filters.status === 'active') {
        where.emailVerified = { not: null };
      } else {
        where.emailVerified = null;
      }
    }

    // Filtro por termo de busca
    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { company: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Filtro por data
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    // Buscar clientes com counts
    const clients = await prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            briefings: true,
            projects: true,
          },
        },
        projects: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular estatísticas
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [total, active, inactive, newThisMonth] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.CLIENTE } }),
      prisma.user.count({
        where: {
          role: UserRole.CLIENTE,
          lastLoginAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.user.count({
        where: {
          role: UserRole.CLIENTE,
          OR: [{ lastLoginAt: null }, { lastLoginAt: { lt: thirtyDaysAgo } }],
        },
      }),
      prisma.user.count({
        where: {
          role: UserRole.CLIENTE,
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
    ]);

    const stats: AdminClientStats = {
      total,
      active,
      inactive,
      newThisMonth,
    };

    return {
      success: true,
      data: {
        clients: clients as AdminClientListItem[],
        stats,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return {
      success: false,
      error: 'Erro ao buscar clientes. Tente novamente.',
    };
  }
}

/**
 * Busca um cliente específico por ID com histórico completo
 */
export async function getClientById(
  clientId: string
): Promise<AdminClientActionResponse<AdminClientWithHistory>> {
  // Verificar autorização
  const authError = await checkAdminAuthorization();
  if (authError) return authError;

  try {
    // Validar ID
    const idValidation = clientIdSchema.safeParse(clientId);
    if (!idValidation.success) {
      return {
        success: false,
        error: 'ID de cliente inválido',
      };
    }

    const client = await prisma.user.findUnique({
      where: {
        id: clientId,
        role: UserRole.CLIENTE,
      },
      include: {
        briefings: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 50,
        },
        projects: {
          include: {
            milestones: {
              select: {
                id: true,
                name: true,
                completed: true,
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
            createdAt: 'desc',
          },
          take: 50,
        },
        projectComments: {
          include: {
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
          take: 10,
        },
        projectFiles: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            uploadedAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!client) {
      return {
        success: false,
        error: 'Cliente não encontrado',
      };
    }

    return {
      success: true,
      data: client as unknown as AdminClientWithHistory,
    };
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return {
      success: false,
      error: 'Erro ao buscar cliente. Tente novamente.',
    };
  }
}

/**
 * Desativa um cliente (bloqueia login)
 * Não permite desativação se cliente tiver projetos ativos
 */
export async function deactivateClient(clientId: string): Promise<AdminClientActionResponse> {
  // Verificar autorização
  const authError = await checkAdminAuthorization();
  if (authError) return authError;

  try {
    // Validar ID
    const idValidation = clientIdSchema.safeParse(clientId);
    if (!idValidation.success) {
      return {
        success: false,
        error: 'ID de cliente inválido',
      };
    }

    // Verificar se cliente existe
    const client = await prisma.user.findUnique({
      where: {
        id: clientId,
        role: UserRole.CLIENTE,
      },
      include: {
        projects: {
          where: {
            status: {
              in: [ProjectStatus.ATIVO, ProjectStatus.AGUARDANDO_APROVACAO],
            },
          },
        },
      },
    });

    if (!client) {
      return {
        success: false,
        error: 'Cliente não encontrado',
      };
    }

    // Verificar se cliente já está desativado
    if (client.emailVerified === null) {
      return {
        success: false,
        error: 'Cliente já está desativado',
      };
    }

    // Verificar se cliente tem projetos ativos
    if (client.projects.length > 0) {
      return {
        success: false,
        error: `Cliente possui ${client.projects.length} projeto(s) ativo(s). Conclua ou cancele os projetos antes de desativar.`,
      };
    }

    // Desativar cliente (remover emailVerified)
    await prisma.user.update({
      where: { id: clientId },
      data: {
        emailVerified: null,
      },
    });

    // Criar notificação para o cliente
    try {
      await createNotification({
        userId: clientId,
        type: 'SISTEMA',
        title: 'Conta Desativada',
        message:
          'Sua conta foi desativada pelo administrador. Entre em contato para mais informações.',
        channels: ['IN_APP', 'EMAIL'],
      });
    } catch (notifyError) {
      console.error('Erro ao enviar notificação:', notifyError);
    }

    return {
      success: true,
      message: 'Cliente desativado com sucesso',
    };
  } catch (error) {
    console.error('Erro ao desativar cliente:', error);
    return {
      success: false,
      error: 'Erro ao desativar cliente. Tente novamente.',
    };
  }
}

/**
 * Busca dados para exportação CSV de clientes
 */
export async function exportClientsCSV(
  filters?: AdminClientFilters
): Promise<AdminClientActionResponse<ClientCSVData[]>> {
  // Verificar autorização
  const authError = await checkAdminAuthorization();
  if (authError) return authError;

  try {
    const result = await getClients(filters);

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Erro ao buscar dados para exportação',
      };
    }

    const csvData: ClientCSVData[] = result.data.clients.map((client) => {
      const projetosAtivos =
        client.projects?.filter((p) => p.status === 'ATIVO' || p.status === 'AGUARDANDO_APROVACAO')
          .length || 0;

      return {
        nome: client.name || 'N/A',
        email: client.email,
        empresa: client.company || 'N/A',
        telefone: client.phone || 'N/A',
        dataCadastro: client.createdAt.toLocaleDateString('pt-BR'),
        ultimoLogin: client.lastLoginAt ? client.lastLoginAt.toLocaleDateString('pt-BR') : 'Nunca',
        totalBriefings: client._count.briefings,
        projetosAtivos,
      };
    });

    return {
      success: true,
      data: csvData,
    };
  } catch (error) {
    console.error('Erro ao exportar clientes:', error);
    return {
      success: false,
      error: 'Erro ao exportar clientes. Tente novamente.',
    };
  }
}
