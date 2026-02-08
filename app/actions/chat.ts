'use server';

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import {
  saveChatSessionSchema,
  getChatHistorySchema,
  deleteChatSessionSchema,
} from '@/lib/validations/chat';
import type { Message, ChatSession } from '@/types/chat';

interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Salva ou atualiza uma sessão de chat no banco
 * @param userId ID do usuário
 * @param messages Array de mensagens
 * @returns ID da sessão criada/atualizada
 */
export async function saveChatSession(
  userId: string,
  messages: Message[]
): Promise<ActionResponse<{ sessionId: string }>> {
  try {
    const validatedData = saveChatSessionSchema.parse({ userId, messages });

    // Buscar sessão existente mais recente (últimas 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const existingSession = await prisma.chatSession.findFirst({
      where: {
        userId: validatedData.userId,
        updatedAt: { gte: oneDayAgo },
      },
      orderBy: { updatedAt: 'desc' },
    });

    let session: ChatSession;

    if (existingSession) {
      // Atualizar sessão existente
      const updated = await prisma.chatSession.update({
        where: { id: existingSession.id },
        data: {
          messages: validatedData.messages as unknown as Prisma.InputJsonValue,
        },
      });
      session = updated as unknown as ChatSession;
    } else {
      // Criar nova sessão
      const created = await prisma.chatSession.create({
        data: {
          userId: validatedData.userId,
          messages: validatedData.messages as unknown as Prisma.InputJsonValue,
        },
      });
      session = created as unknown as ChatSession;
    }

    return {
      success: true,
      data: { sessionId: session.id },
    };
  } catch (error) {
    console.error('Erro ao salvar sessão de chat:', error);
    return {
      success: false,
      error: 'Erro ao salvar histórico do chat',
    };
  }
}

/**
 * Busca histórico de sessões de chat do usuário
 * @param userId ID do usuário
 * @param limit Número máximo de sessões (padrão: 10)
 * @returns Array de sessões ordenadas por data
 */
export async function getChatHistory(
  userId: string,
  limit: number = 10
): Promise<ActionResponse<{ sessions: ChatSession[] }>> {
  try {
    const validatedData = getChatHistorySchema.parse({ userId, limit });

    const sessions = await prisma.chatSession.findMany({
      where: { userId: validatedData.userId },
      orderBy: { updatedAt: 'desc' },
      take: validatedData.limit,
    });

    // Converter para formato esperado
    const formattedSessions: ChatSession[] = sessions.map((session) => ({
      id: session.id,
      userId: session.userId,
      messages: (session.messages as unknown as Message[]) || [],
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));

    return {
      success: true,
      data: { sessions: formattedSessions },
    };
  } catch (error) {
    console.error('Erro ao buscar histórico de chat:', error);
    return {
      success: false,
      error: 'Erro ao carregar histórico',
    };
  }
}

/**
 * Deleta uma sessão de chat
 * @param sessionId ID da sessão
 * @param userId ID do usuário (para validação de propriedade)
 * @returns Sucesso ou erro
 */
export async function deleteChatSession(
  sessionId: string,
  userId: string
): Promise<ActionResponse> {
  try {
    const validatedData = deleteChatSessionSchema.parse({ sessionId, userId });

    // Validar que a sessão pertence ao usuário
    const session = await prisma.chatSession.findFirst({
      where: {
        id: validatedData.sessionId,
        userId: validatedData.userId,
      },
    });

    if (!session) {
      return {
        success: false,
        error: 'Sessão não encontrada ou acesso negado',
      };
    }

    await prisma.chatSession.delete({
      where: { id: validatedData.sessionId },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erro ao deletar sessão de chat:', error);
    return {
      success: false,
      error: 'Erro ao deletar sessão',
    };
  }
}

/**
 * Carrega uma sessão específica do usuário
 * @param sessionId ID da sessão
 * @param userId ID do usuário
 * @returns Sessão com mensagens
 */
export async function loadChatSession(
  sessionId: string,
  userId: string
): Promise<ActionResponse<{ session: ChatSession }>> {
  try {
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      return {
        success: false,
        error: 'Sessão não encontrada',
      };
    }

    const formattedSession: ChatSession = {
      id: session.id,
      userId: session.userId,
      messages: (session.messages as unknown as Message[]) || [],
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };

    return {
      success: true,
      data: { session: formattedSession },
    };
  } catch (error) {
    console.error('Erro ao carregar sessão de chat:', error);
    return {
      success: false,
      error: 'Erro ao carregar sessão',
    };
  }
}
