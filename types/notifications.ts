import type {
  Notification,
  NotificationPreference,
  NotificationType,
  NotificationChannel,
} from '@prisma/client';

// Re-exportar tipos do Prisma
export type { Notification, NotificationPreference, NotificationType, NotificationChannel };

/**
 * Dados para criar uma notificação
 */
export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  metadata?: Record<string, any>;
}

/**
 * Dados para preferências de notificação
 */
export interface NotificationPreferenceData {
  type: NotificationType;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

/**
 * Parâmetros para criar notificação multi-canal
 */
export interface CreateNotificationParams extends NotificationData {
  channels: NotificationChannel[];
}

/**
 * Subscription de push notification
 */
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Resultado de operação de notificação
 */
export interface NotificationResult {
  success: boolean;
  error?: string;
  count?: number;
}

/**
 * Resultado com dados de notificação
 */
export interface NotificationDataResult {
  success: boolean;
  data?: Notification[];
  count?: number;
  error?: string;
}

/**
 * Resultado com preferências
 */
export interface PreferenceResult {
  success: boolean;
  data?: NotificationPreference[];
  error?: string;
}

/**
 * Payload de notificação push
 */
export interface PushNotificationPayload {
  title: string;
  message: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

/**
 * Opções para buscar notificações
 */
export interface GetNotificationsOptions {
  unreadOnly?: boolean;
  limit?: number;
}
