'use server';

import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import {
  NotificationData,
  NotificationPreferenceData,
  CreateNotificationParams,
  PushSubscriptionData,
  NotificationResult,
  PushNotificationPayload,
} from '@/types/notifications';
import { NotificationType, NotificationChannel, Notification } from '@prisma/client';
import { getNotificationEmailTemplate } from '@/lib/email-templates/notification-email';
import webpush from 'web-push';
import { z } from 'zod';

// Schema de validação
const notificationSchema = z.object({
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

// Configurar web-push
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:noreply@28webconnect.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

/**
 * Cria uma notificação e envia pelos canais especificados
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<NotificationResult> {
  try {
    // Validar parâmetros
    const validation = notificationSchema.safeParse(params);
    if (!validation.success) {
      console.error('Validação falhou:', validation.error.errors);
      return { success: false, error: 'Dados de notificação inválidos' };
    }

    const { userId, type, title, message, metadata, channels } = params;

    // Buscar preferências do usuário
    const preferences = await getUserPreferences(userId);

    const results = await Promise.allSettled([
      // Canal IN_APP
      channels.includes('IN_APP') && shouldSendViaChannel(preferences, type, 'IN_APP')
        ? createInAppNotification({ userId, type, title, message, metadata })
        : Promise.resolve(),

      // Canal EMAIL
      channels.includes('EMAIL') && shouldSendViaChannel(preferences, type, 'EMAIL')
        ? sendNotificationEmail({ userId, type, title, message, metadata })
        : Promise.resolve(),

      // Canal PUSH
      channels.includes('PUSH') && shouldSendViaChannel(preferences, type, 'PUSH')
        ? sendPushNotificationToUser({ userId, type, title, message, metadata })
        : Promise.resolve(),
    ]);

    // Log de erros (não falha a operação)
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Erro no canal ${channels[index]}:`, result.reason);
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return { success: false, error: 'Erro ao processar notificação' };
  }
}

/**
 * Cria notificação in-app no banco de dados
 */
async function createInAppNotification(params: NotificationData): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: params.metadata || null,
      channel: 'IN_APP',
      read: false,
    },
  });
}

/**
 * Busca preferências de notificação do usuário
 */
async function getUserPreferences(
  userId: string
): Promise<Map<NotificationType, NotificationPreferenceData>> {
  const preferences = await prisma.notificationPreference.findMany({
    where: { userId },
  });

  const map = new Map<NotificationType, NotificationPreferenceData>();
  preferences.forEach((pref) => {
    map.set(pref.type, {
      type: pref.type,
      emailEnabled: pref.emailEnabled,
      pushEnabled: pref.pushEnabled,
      inAppEnabled: pref.inAppEnabled,
    });
  });

  return map;
}

/**
 * Verifica se deve enviar via canal baseado nas preferências
 */
function shouldSendViaChannel(
  preferences: Map<NotificationType, NotificationPreferenceData>,
  type: NotificationType,
  channel: NotificationChannel
): boolean {
  const pref = preferences.get(type);

  if (!pref) {
    // Sem preferências definidas, usar defaults
    return type !== 'SISTEMA' || channel === 'IN_APP';
  }

  switch (channel) {
    case 'EMAIL':
      return pref.emailEnabled;
    case 'PUSH':
      return pref.pushEnabled;
    case 'IN_APP':
      return pref.inAppEnabled;
    default:
      return true;
  }
}

/**
 * Envia notificação por email
 */
export async function sendNotificationEmail(
  notification: NotificationData
): Promise<NotificationResult> {
  try {
    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: notification.userId },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      return { success: false, error: 'Usuário não encontrado ou sem email' };
    }

    // Gerar template
    const { html, text, subject } = getNotificationEmailTemplate(
      notification,
      user.name || 'Usuário'
    );

    // Enviar email
    const result = await sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });

    return result;
  } catch (error) {
    console.error('Erro ao enviar email de notificação:', error);
    return { success: false, error: 'Erro ao enviar email' };
  }
}

/**
 * Envia push notification para todos os dispositivos do usuário
 */
async function sendPushNotificationToUser(notification: NotificationData): Promise<void> {
  // Buscar subscriptions do usuário
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: notification.userId },
  });

  if (subscriptions.length === 0) {
    return;
  }

  // Verificar se web-push está configurado
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys não configuradas, ignorando push notifications');
    return;
  }

  const payload: PushNotificationPayload = {
    title: notification.title,
    message: notification.message,
    icon: `${process.env.NEXTAUTH_URL}/assets/28connect.jpg`,
    badge: `${process.env.NEXTAUTH_URL}/assets/28connect.jpg`,
    data: {
      ...notification.metadata,
      type: notification.type,
      url: notification.metadata?.actionUrl || '/dashboard',
    },
  };

  // Enviar para todos os dispositivos
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        const pushSub = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        await webpush.sendNotification(pushSub, JSON.stringify(payload));
      } catch (error: any) {
        // Subscription expirada ou inválida
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
          console.log(`Subscription ${sub.id} removida (expirada)`);
        } else {
          console.error('Erro ao enviar push notification:', error);
        }
      }
    })
  );
}

/**
 * Envia push notification para uma subscription específica
 */
export async function sendPushNotification(
  notification: NotificationData,
  subscription: PushSubscriptionData
): Promise<NotificationResult> {
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return { success: false, error: 'VAPID keys não configuradas' };
    }

    const payload: PushNotificationPayload = {
      title: notification.title,
      message: notification.message,
      icon: `${process.env.NEXTAUTH_URL}/assets/28connect.jpg`,
      badge: `${process.env.NEXTAUTH_URL}/assets/28connect.jpg`,
      data: notification.metadata,
    };

    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao enviar push notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Marca uma notificação como lida
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<NotificationResult> {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: userId,
      },
      data: { read: true },
    });

    if (result.count === 0) {
      return { success: false, error: 'Notificação não encontrada' };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return { success: false, error: 'Erro ao atualizar notificação' };
  }
}

/**
 * Marca todas as notificações do usuário como lidas
 */
export async function markAllAsRead(userId: string): Promise<NotificationResult> {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: userId,
        read: false,
      },
      data: { read: true },
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    return { success: false, error: 'Erro ao atualizar notificações' };
  }
}

/**
 * Retorna preferências padrão para um tipo de notificação
 */
export async function getDefaultPreferences(
  type: NotificationType
): Promise<NotificationPreferenceData> {
  // Notificações de sistema são apenas in-app por padrão
  if (type === 'SISTEMA') {
    return {
      type,
      emailEnabled: false,
      pushEnabled: false,
      inAppEnabled: true,
    };
  }

  return {
    type,
    emailEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
  };
}
