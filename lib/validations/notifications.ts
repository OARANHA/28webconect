import { z } from 'zod';

/**
 * Enum de tipos de notificação
 */
export const notificationTypeEnum = z.enum([
  'NOVO_BRIEFING',
  'PROJETO_ATUALIZADO',
  'NOVA_MENSAGEM',
  'ARQUIVO_SOLICITADO',
  'PROJETO_CONCLUIDO',
  'BRIEFING_APROVADO',
  'BRIEFING_REJEITADO',
  'MILESTONE_CONCLUIDA',
  'SISTEMA',
] as const);

/**
 * Enum de canais de notificação
 */
export const notificationChannelEnum = z.enum(['IN_APP', 'EMAIL', 'PUSH'] as const);

/**
 * Schema para criação de notificação
 */
export const notificationSchema = z.object({
  type: notificationTypeEnum,
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  message: z.string().min(1, 'Mensagem é obrigatória').max(1000, 'Mensagem muito longa'),
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  metadata: z.record(z.any()).optional(),
});

/**
 * Schema para criação de notificação com canais
 */
export const createNotificationSchema = notificationSchema.extend({
  channels: z.array(notificationChannelEnum).min(1, 'Pelo menos um canal deve ser selecionado'),
});

/**
 * Schema para preferências de notificação
 */
export const notificationPreferenceSchema = z.object({
  type: notificationTypeEnum,
  emailEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
});

/**
 * Schema para atualização de preferências
 */
export const updatePreferencesSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  preferences: z
    .array(notificationPreferenceSchema)
    .min(1, 'Pelo menos uma preferência deve ser enviada'),
});

/**
 * Schema para busca de notificações
 */
export const getNotificationsSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  options: z
    .object({
      unreadOnly: z.boolean().optional(),
      limit: z.number().min(1).max(100).optional(),
    })
    .optional(),
});

/**
 * Schema para ID de notificação
 */
export const notificationIdSchema = z.object({
  notificationId: z.string().min(1, 'ID da notificação é obrigatório'),
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
});

/**
 * Schema para ID do usuário
 */
export const userIdSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
});

/**
 * Schema para push subscription
 */
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url('Endpoint deve ser uma URL válida'),
  keys: z.object({
    p256dh: z.string().min(1, 'Chave p256dh é obrigatória'),
    auth: z.string().min(1, 'Chave auth é obrigatória'),
  }),
});

/**
 * Schema para salvar push subscription
 */
export const savePushSubscriptionSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  subscription: pushSubscriptionSchema,
});

/**
 * Schema para envio de email de notificação
 */
export const sendNotificationEmailSchema = notificationSchema;

// Tipos inferidos
export type NotificationSchema = z.infer<typeof notificationSchema>;
export type CreateNotificationSchema = z.infer<typeof createNotificationSchema>;
export type NotificationPreferenceSchema = z.infer<typeof notificationPreferenceSchema>;
export type UpdatePreferencesSchema = z.infer<typeof updatePreferencesSchema>;
export type GetNotificationsSchema = z.infer<typeof getNotificationsSchema>;
export type NotificationIdSchema = z.infer<typeof notificationIdSchema>;
export type UserIdSchema = z.infer<typeof userIdSchema>;
export type PushSubscriptionSchema = z.infer<typeof pushSubscriptionSchema>;
export type SavePushSubscriptionSchema = z.infer<typeof savePushSubscriptionSchema>;
