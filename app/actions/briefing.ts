'use server';

import { prisma } from '@/lib/prisma';
import {
  briefingSchema,
  briefingDraftSchema,
  BriefingFormData,
  BriefingDraftData,
} from '@/lib/validations/briefing';
import { Prisma, BriefingStatus, ServiceType } from '@prisma/client';
import { z } from 'zod';

// Tipo de resposta padrão para actions
interface ActionResponse {
  success: boolean;
  error?: string;
  message?: string;
  data?: BriefingDraftData | null;
}

/**
 * Salva ou atualiza um rascunho de briefing para o usuário
 * Permite campos incompletos (validação com briefingDraftSchema)
 * @param userId ID do usuário
 * @param data Dados parciais do formulário
 * @returns Resultado da operação
 */
export async function saveDraft(userId: string, data: BriefingDraftData): Promise<ActionResponse> {
  try {
    // Validar dados com schema de rascunho (permite campos incompletos)
    const validatedData = briefingDraftSchema.parse(data);

    // Buscar rascunho existente do usuário
    const existingDraft = await prisma.briefingDraft.findFirst({
      where: { userId },
    });

    // Definir data de expiração (30 dias a partir de agora)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (existingDraft) {
      // Atualizar rascunho existente
      await prisma.briefingDraft.update({
        where: { id: existingDraft.id },
        data: {
          data: validatedData as Prisma.JsonObject,
          expiresAt,
        },
      });
    } else {
      // Criar novo rascunho
      await prisma.briefingDraft.create({
        data: {
          userId,
          data: validatedData as Prisma.JsonObject,
          expiresAt,
        },
      });
    }

    return {
      success: true,
      message: 'Rascunho salvo',
    };
  } catch (error) {
    console.error('Erro ao salvar rascunho:', error);

    // Tratamento específico de erros do Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        error: 'Erro ao salvar rascunho. Tente novamente.',
      };
    }

    return {
      success: false,
      error: 'Erro ao salvar rascunho. Tente novamente.',
    };
  }
}

/**
 * Submete um briefing completo
 * Valida todos os campos obrigatórios e cria o briefing no banco
 * @param userId ID do usuário
 * @param data Dados completos do formulário
 * @returns Resultado da operação
 */
export async function submitBriefing(
  userId: string,
  data: BriefingDraftData
): Promise<ActionResponse> {
  try {
    // Validar dados com schema completo (todos os campos obrigatórios)
    const validatedData = briefingSchema.parse(data);

    // Preparar additionalInfo para o Prisma
    const additionalInfoValue =
      'additionalInfo' in validatedData && validatedData.additionalInfo
        ? (validatedData.additionalInfo as Prisma.JsonObject)
        : Prisma.JsonNull;

    // Criar briefing no banco
    await prisma.briefing.create({
      data: {
        userId,
        serviceType: validatedData.serviceType as ServiceType,
        companyName: validatedData.companyName,
        segment: validatedData.segment,
        objectives: validatedData.objectives,
        budget: validatedData.budget || null,
        deadline: validatedData.deadline || null,
        features: 'features' in validatedData ? validatedData.features || null : null,
        references: 'references' in validatedData ? validatedData.references || null : null,
        integrations: 'integrations' in validatedData ? validatedData.integrations || null : null,
        additionalInfo: additionalInfoValue,
        status: BriefingStatus.ENVIADO,
        submittedAt: new Date(),
      },
    });

    // Deletar rascunho existente após envio bem-sucedido
    await prisma.briefingDraft.deleteMany({
      where: { userId },
    });

    return {
      success: true,
      message: 'Briefing enviado com sucesso!',
    };
  } catch (error) {
    console.error('Erro ao enviar briefing:', error);

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
      error: 'Erro ao enviar briefing. Tente novamente.',
    };
  }
}

/**
 * Carrega o rascunho de briefing do usuário
 * Verifica se o rascunho não está expirado
 * @param userId ID do usuário
 * @returns Resultado da operação com os dados do rascunho
 */
export async function loadDraft(userId: string): Promise<ActionResponse> {
  try {
    // Buscar rascunho do usuário que não esteja expirado
    const draft = await prisma.briefingDraft.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: new Date(), // Apenas rascunhos que não expiraram
        },
      },
    });

    if (draft) {
      return {
        success: true,
        data: draft.data as BriefingDraftData,
      };
    }

    // Nenhum rascunho encontrado ou expirado
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error('Erro ao carregar rascunho:', error);

    return {
      success: false,
      error: 'Erro ao carregar rascunho',
    };
  }
}
