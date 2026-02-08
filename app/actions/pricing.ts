'use server';

import { prisma } from '@/lib/prisma';
import {
  updatePlanSchema,
  createPlanSchema,
  reorderPlansSchema,
  UpdatePlanData,
  CreatePlanData,
} from '@/lib/validations/pricing';
import { ServiceType, BriefingStatus, PricingPlan } from '@prisma/client';
import { z } from 'zod';

// Tipo de resposta padrão para actions
interface ActionResponse {
  success: boolean;
  error?: string;
  message?: string;
  planId?: string;
}

/**
 * Busca todos os planos ativos ordenados por campo `order`
 * Usado na página pública de preços para clientes
 * @returns Array de planos ativos ordenados
 */
export async function getPricingPlans(): Promise<PricingPlan[]> {
  try {
    const plans = await prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return plans;
  } catch (error) {
    console.error('Erro ao buscar planos de preços:', error);
    return [];
  }
}

/**
 * Busca todos os planos (ativos e inativos) para gestão administrativa
 * Ordenados por campo `order`
 * @returns Array de todos os planos ordenados
 */
export async function getAllPricingPlans(): Promise<PricingPlan[]> {
  try {
    const plans = await prisma.pricingPlan.findMany({
      orderBy: { order: 'asc' },
    });
    return plans;
  } catch (error) {
    console.error('Erro ao buscar todos os planos:', error);
    return [];
  }
}

/**
 * Verifica se existem clientes ativos usando um determinado tipo de serviço
 * Busca briefings com status APROVADO para o serviceType informado
 * @param serviceType - Tipo de serviço a verificar
 * @returns true se houver pelo menos 1 cliente ativo
 */
export async function hasActiveClients(serviceType: ServiceType): Promise<boolean> {
  try {
    const count = await prisma.briefing.count({
      where: {
        serviceType,
        status: BriefingStatus.APROVADO,
      },
    });
    return count > 0;
  } catch (error) {
    console.error('Erro ao verificar clientes ativos:', error);
    return false;
  }
}

/**
 * Conta o número de clientes ativos usando um determinado tipo de serviço
 * @param serviceType - Tipo de serviço a verificar
 * @returns Número de clientes ativos
 */
export async function countActiveClients(serviceType: ServiceType): Promise<number> {
  try {
    const count = await prisma.briefing.count({
      where: {
        serviceType,
        status: BriefingStatus.APROVADO,
      },
    });
    return count;
  } catch (error) {
    console.error('Erro ao contar clientes ativos:', error);
    return 0;
  }
}

/**
 * Atualiza um plano existente
 * Valida dados com Zod schema antes de atualizar
 * @param planId - ID do plano a atualizar
 * @param data - Dados atualizados do plano
 * @returns Resultado da operação
 */
export async function updatePlan(planId: string, data: UpdatePlanData): Promise<ActionResponse> {
  try {
    // Validar dados com schema
    const validatedData = updatePlanSchema.parse(data);

    // Verificar se o plano existe
    const existingPlan = await prisma.pricingPlan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return {
        success: false,
        error: 'Plano não encontrado',
      };
    }

    // Atualizar plano
    await prisma.pricingPlan.update({
      where: { id: planId },
      data: {
        name: validatedData.name,
        price: validatedData.price,
        features: validatedData.features,
        storageLimit: validatedData.storageLimit,
      },
    });

    return {
      success: true,
      message: 'Plano atualizado com sucesso',
    };
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);

    // Tratamento de erros de validação do Zod
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message || 'Dados inválidos',
      };
    }

    return {
      success: false,
      error: 'Erro ao atualizar plano. Tente novamente.',
    };
  }
}

/**
 * Cria um novo plano de preços
 * Verifica se serviceType já existe (unique constraint)
 * Define order como maior valor atual + 1
 * @param data - Dados do novo plano
 * @returns Resultado da operação com planId em caso de sucesso
 */
export async function createPlan(data: CreatePlanData): Promise<ActionResponse> {
  try {
    // Validar dados com schema
    const validatedData = createPlanSchema.parse(data);

    // Verificar se já existe plano com este serviceType
    const existingPlan = await prisma.pricingPlan.findUnique({
      where: { serviceType: validatedData.serviceType as ServiceType },
    });

    if (existingPlan) {
      return {
        success: false,
        error: 'Já existe um plano para este tipo de serviço',
      };
    }

    // Buscar maior order atual
    const lastPlan = await prisma.pricingPlan.findFirst({
      orderBy: { order: 'desc' },
    });
    const newOrder = (lastPlan?.order ?? 0) + 1;

    // Criar novo plano
    const newPlan = await prisma.pricingPlan.create({
      data: {
        name: validatedData.name,
        serviceType: validatedData.serviceType as ServiceType,
        price: validatedData.price,
        features: validatedData.features,
        storageLimit: validatedData.storageLimit,
        order: newOrder,
        isActive: true,
      },
    });

    return {
      success: true,
      message: 'Plano criado com sucesso',
      planId: newPlan.id,
    };
  } catch (error) {
    console.error('Erro ao criar plano:', error);

    // Tratamento de erros de validação do Zod
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message || 'Dados inválidos',
      };
    }

    return {
      success: false,
      error: 'Erro ao criar plano. Tente novamente.',
    };
  }
}

/**
 * Alterna o status ativo/inativo de um plano
 * Se estiver ativo, verifica se há clientes usando este plano antes de desativar
 * @param planId - ID do plano a alternar
 * @returns Resultado da operação
 */
export async function togglePlanActive(planId: string): Promise<ActionResponse> {
  try {
    // Buscar plano
    const plan = await prisma.pricingPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return {
        success: false,
        error: 'Plano não encontrado',
      };
    }

    // Se estiver ativo, verificar clientes antes de desativar
    if (plan.isActive) {
      const activeClientsCount = await countActiveClients(plan.serviceType);

      if (activeClientsCount > 0) {
        return {
          success: false,
          error: `Não é possível desativar este plano. Existem ${activeClientsCount} cliente${activeClientsCount > 1 ? 's' : ''} ativo${activeClientsCount > 1 ? 's' : ''} utilizando-o.`,
        };
      }
    }

    // Alternar status
    await prisma.pricingPlan.update({
      where: { id: planId },
      data: { isActive: !plan.isActive },
    });

    return {
      success: true,
      message: plan.isActive ? 'Plano desativado' : 'Plano ativado',
    };
  } catch (error) {
    console.error('Erro ao alternar status do plano:', error);
    return {
      success: false,
      error: 'Erro ao alterar status do plano. Tente novamente.',
    };
  }
}

/**
 * Reordena os planos de acordo com a nova ordem de IDs
 * Atualiza o campo order de cada plano usando transaction
 * @param planIds - Array de IDs na nova ordem
 * @returns Resultado da operação
 */
export async function reorderPlans(planIds: string[]): Promise<ActionResponse> {
  try {
    // Validar dados
    reorderPlansSchema.parse({ planIds });

    // Atualizar ordem em transaction
    await prisma.$transaction(
      planIds.map((id, index) =>
        prisma.pricingPlan.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return {
      success: true,
      message: 'Ordem atualizada com sucesso',
    };
  } catch (error) {
    console.error('Erro ao reordenar planos:', error);

    // Tratamento de erros de validação do Zod
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message || 'Dados inválidos',
      };
    }

    return {
      success: false,
      error: 'Erro ao reordenar planos. Tente novamente.',
    };
  }
}
