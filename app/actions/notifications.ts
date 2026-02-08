'use server';

import { prisma } from '@/lib/prisma';
import {
  createNotification,
  markAsRead,
  markAllAsRead,
  getDefaultPreferences,
} from '@/lib/notifications';
import {
  NotificationDataResult,
  NotificationResult,
  PreferenceResult,
  CreateNotificationParams,
  NotificationPreferenceData,
  GetNotificationsOptions,
} from '@/types/notifications';
import { NotificationType, NotificationChannel } from '@prisma/client';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Schemas de validação
const getNotificationsSchema = z.object({
  userId: z.string(),
  options: z
    .object({
      unreadOnly: z.boolean().optional(),
      limit: z.number().min(1).max(100).optional(),
    })
    .optional(),
});

const notificationIdSchema = z.object({
  notificationId: z.string(),
  userId: z.string(),
});

const userIdSchema = z.object({
  userId: z.string(),
});

const notificationPreferenceSchema = z.object({
  type: z.enum([
    'NOVO_BRIEFING',
    'PROJETO_ATUALIZADO',
    'NOVA_MENSAGEM',
    'ARQUIVO_SOLICITADO',
    'PROJETO_CONCLUIDO',
    'BRIEFING_APROVADO',
    'BRIEFING_REJEITADO',
    'MILESTONE_CONCLUIDA',
    'SISTEMA',
  ] as const),
  emailEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
});

const updatePreferencesSchema = z.object({
  userId: z.string(),
  preferences: z.array(notificationPreferenceSchema),
});

const createNotificationSchema = z.object({
  type: z.enum([
    'NOVO_BRIEFING',
    'PROJETO_ATUALIZADO',
    'NOVA_MENSAGEM',
    'ARQUIVO_SOLICITADO',
    'PROJETO_CONCLUIDO',
    'BRIEFING_APROVADO',
    'BRIEFING_REJEITADO',
    'MILESTONE_CONCLUIDA',
    'SISTEMA',
  ] as const),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  userId: z.string(),
  metadata: z.record(z.any()).optional(),
  channels: z
    .array(z.enum(['IN_APP', 'EMAIL', 'PUSH'] as const))
    .min(1, 'Pelo menos um canal deve ser selecionado'),
});

const savePushSubscriptionSchema = z.object({
  userId: z.string(),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});

/**
 * Busca notificações do usuário
 */
export async function getNotifications(
  userId: string,
  options?: GetNotificationsOptions
): Promise<NotificationDataResult> {
  try {
    const validation = getNotificationsSchema.safeParse({ userId, options });
    if (!validation.success) {
      return { success: false, error: 'Parâmetros inválidos' };
    }

    const limit = options?.limit || 50;

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(options?.unreadOnly && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return { success: false, error: 'Erro ao buscar notificações' };
  }
}

/**
 * Marca uma notificação como lida
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<NotificationResult> {
  try {
    const validation = notificationIdSchema.safeParse({ notificationId, userId });
    if (!validation.success) {
      return { success: false, error: 'Parâmetros inválidos' };
    }

    // Validar ownership
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      return { success: false, error: 'Notificação não encontrada' };
    }

    const result = await markAsRead(notificationId, userId);

    if (result.success) {
      revalidatePath('/dashboard/notificacoes');
    }

    return result;
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return { success: false, error: 'Erro ao atualizar notificação' };
  }
}

/**
 * Marca todas as notificações do usuário como lidas
 */
export async function markAllNotificationsAsRead(userId: string): Promise<NotificationResult> {
  try {
    const validation = userIdSchema.safeParse({ userId });
    if (!validation.success) {
      return { success: false, error: 'ID do usuário inválido' };
    }

    const result = await markAllAsRead(userId);

    if (result.success) {
      revalidatePath('/dashboard/notificacoes');
    }

    return result;
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    return { success: false, error: 'Erro ao atualizar notificações' };
  }
}

/**
 * Busca preferências de notificação do usuário
 */
export async function getNotificationPreferences(userId: string): Promise<PreferenceResult> {
  try {
    const validation = userIdSchema.safeParse({ userId });
    if (!validation.success) {
      return { success: false, error: 'ID do usuário inválido' };
    }

    const preferences = await prisma.notificationPreference.findMany({
      where: { userId },
    });

    // Completar com defaults para tipos que não existem
    const allTypes = Object.values(NotificationType);
    const existingTypes = new Set(preferences.map((p) => p.type));

    const completePreferences = [
      ...preferences,
      ...allTypes
        .filter((type) => !existingTypes.has(type))
        .map((type) => ({
          ...getDefaultPreferences(type),
          id: '',
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
    ];

    return { success: true, data: completePreferences };
  } catch (error) {
    console.error('Erro ao buscar preferências:', error);
    return { success: false, error: 'Erro ao buscar preferências' };
  }
}

/**
 * Atualiza preferências de notificação do usuário
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: NotificationPreferenceData[]
): Promise<NotificationResult> {
  try {
    const validation = updatePreferencesSchema.safeParse({ userId, preferences });
    if (!validation.success) {
      console.error('Validação falhou:', validation.error.errors);
      return { success: false, error: 'Dados de preferências inválidos' };
    }

    // Usar transação para atomicidade
    await prisma.$transaction(
      preferences.map((pref) =>
        prisma.notificationPreference.upsert({
          where: {
            userId_type: {
              userId,
              type: pref.type,
            },
          },
          update: {
            emailEnabled: pref.emailEnabled,
            pushEnabled: pref.pushEnabled,
            inAppEnabled: pref.inAppEnabled,
          },
          create: {
            userId,
            type: pref.type,
            emailEnabled: pref.emailEnabled,
            pushEnabled: pref.pushEnabled,
            inAppEnabled: pref.inAppEnabled,
          },
        })
      )
    );

    revalidatePath('/dashboard/notificacoes');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    return { success: false, error: 'Erro ao salvar preferências' };
  }
}

/**
 * Conta notificações não lidas do usuário
 */
export async function getUnreadCount(userId: string): Promise<NotificationResult> {
  try {
    const validation = userIdSchema.safeParse({ userId });
    if (!validation.success) {
      return { success: false, error: 'ID do usuário inválido' };
    }

    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return { success: true, count };
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    return { success: false, error: 'Erro ao contar notificações' };
  }
}

/**
 * Deleta uma notificação
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<NotificationResult> {
  try {
    const validation = notificationIdSchema.safeParse({ notificationId, userId });
    if (!validation.success) {
      return { success: false, error: 'Parâmetros inválidos' };
    }

    // Validar ownership
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      return { success: false, error: 'Notificação não encontrada' };
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    revalidatePath('/dashboard/notificacoes');
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    return { success: false, error: 'Erro ao deletar notificação' };
  }
}

/**
 * Cria uma notificação (usado por outros server actions)
 */
export async function createUserNotification(
  params: CreateNotificationParams
): Promise<NotificationResult> {
  try {
    const validation = createNotificationSchema.safeParse(params);
    if (!validation.success) {
      console.error('Validação falhou:', validation.error.errors);
      return { success: false, error: 'Dados de notificação inválidos' };
    }

    return await createNotification(params);
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return { success: false, error: 'Erro ao criar notificação' };
  }
}

/**
 * Salva subscription de push notification
 */
export async function savePushSubscription(
  userId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
): Promise<NotificationResult> {
  try {
    const validation = savePushSubscriptionSchema.safeParse({ userId, subscription });
    if (!validation.success) {
      return { success: false, error: 'Dados de subscription inválidos' };
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar push subscription:', error);
    return { success: false, error: 'Erro ao salvar subscription' };
  }
}

/**
 * Remove subscription de push notification
 */
export async function removePushSubscription(endpoint: string): Promise<NotificationResult> {
  try {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao remover push subscription:', error);
    return { success: false, error: 'Erro ao remover subscription' };
  }
}
