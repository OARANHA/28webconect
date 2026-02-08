import { NotificationType, NotificationChannel, Notification } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * Retorna o emoji/ícone apropriado para cada tipo de notificação
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    NOVO_BRIEFING: '📋',
    PROJETO_ATUALIZADO: '📊',
    NOVA_MENSAGEM: '💬',
    ARQUIVO_SOLICITADO: '📁',
    PROJETO_CONCLUIDO: '✅',
    BRIEFING_APROVADO: '🎉',
    BRIEFING_REJEITADO: '⚠️',
    MILESTONE_CONCLUIDA: '🎯',
    SISTEMA: '🔔',
  };

  return icons[type] || '🔔';
}

/**
 * Retorna a cor Tailwind para badges de notificação
 */
export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    NOVO_BRIEFING: 'blue',
    PROJETO_ATUALIZADO: 'purple',
    NOVA_MENSAGEM: 'cyan',
    ARQUIVO_SOLICITADO: 'orange',
    PROJETO_CONCLUIDO: 'green',
    BRIEFING_APROVADO: 'green',
    BRIEFING_REJEITADO: 'red',
    MILESTONE_CONCLUIDA: 'emerald',
    SISTEMA: 'gray',
  };

  return colors[type] || 'gray';
}

/**
 * Retorna a classe CSS de cor de fundo Tailwind
 */
export function getNotificationBgColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    NOVO_BRIEFING: 'bg-blue-500/10 text-blue-400',
    PROJETO_ATUALIZADO: 'bg-purple-500/10 text-purple-400',
    NOVA_MENSAGEM: 'bg-cyan-500/10 text-cyan-400',
    ARQUIVO_SOLICITADO: 'bg-orange-500/10 text-orange-400',
    PROJETO_CONCLUIDO: 'bg-green-500/10 text-green-400',
    BRIEFING_APROVADO: 'bg-green-500/10 text-green-400',
    BRIEFING_REJEITADO: 'bg-red-500/10 text-red-400',
    MILESTONE_CONCLUIDA: 'bg-emerald-500/10 text-emerald-400',
    SISTEMA: 'bg-gray-500/10 text-gray-400',
  };

  return colors[type] || 'bg-gray-500/10 text-gray-400';
}

/**
 * Formata mensagem de notificação com interpolação de metadata
 * Ex: "Seu projeto {projectName} foi atualizado"
 */
export function formatNotificationMessage(notification: Notification): string {
  let message = notification.message;

  if (notification.metadata && typeof notification.metadata === 'object') {
    const metadata = notification.metadata as Record<string, string>;
    Object.entries(metadata).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });
  }

  return message;
}

/**
 * Retorna descrição legível do tipo de notificação
 */
export function getNotificationTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    NOVO_BRIEFING: 'Novo Briefing',
    PROJETO_ATUALIZADO: 'Projeto Atualizado',
    NOVA_MENSAGEM: 'Nova Mensagem',
    ARQUIVO_SOLICITADO: 'Arquivo Solicitado',
    PROJETO_CONCLUIDO: 'Projeto Concluído',
    BRIEFING_APROVADO: 'Briefing Aprovado',
    BRIEFING_REJEITADO: 'Briefing Rejeitado',
    MILESTONE_CONCLUIDA: 'Milestone Concluída',
    SISTEMA: 'Sistema',
  };

  return labels[type] || type;
}

/**
 * Retorna descrição legível do canal de notificação
 */
export function getChannelLabel(channel: NotificationChannel): string {
  const labels: Record<NotificationChannel, string> = {
    IN_APP: 'No aplicativo',
    EMAIL: 'Email',
    PUSH: 'Push',
  };

  return labels[channel] || channel;
}

/**
 * Cache em memória para preferências de usuário
 * Melhora performance em verificações frequentes
 * Chave: `${userId}:${type}:${channel}` -> Valor: boolean
 */
const preferencesCache = new Map<string, boolean>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const cacheTimestamps = new Map<string, number>();

/**
 * Verifica se deve enviar notificação baseado nas preferências do usuário
 * Usa cache para performance
 */
export async function shouldSendNotification(
  userId: string,
  type: NotificationType,
  channel: NotificationChannel
): Promise<boolean> {
  const cacheKey = `${userId}:${type}:${channel}`;
  const cached = preferencesCache.get(cacheKey);
  const timestamp = cacheTimestamps.get(cacheKey);

  // Retornar do cache se válido
  if (cached !== undefined && timestamp && Date.now() - timestamp < CACHE_TTL) {
    return cached;
  }

  try {
    const preference = await prisma.notificationPreference.findUnique({
      where: {
        userId_type: {
          userId,
          type,
        },
      },
    });

    let shouldSend = true;

    if (preference) {
      switch (channel) {
        case 'EMAIL':
          shouldSend = preference.emailEnabled;
          break;
        case 'PUSH':
          shouldSend = preference.pushEnabled;
          break;
        case 'IN_APP':
          shouldSend = preference.inAppEnabled;
          break;
      }
    } else {
      // Sem preferência definida, usar defaults
      // Notificações de sistema são apenas in-app por padrão
      if (type === 'SISTEMA' && channel !== 'IN_APP') {
        shouldSend = false;
      }
    }

    // Atualizar cache usando a mesma chave
    preferencesCache.set(cacheKey, shouldSend);
    cacheTimestamps.set(cacheKey, Date.now());

    return shouldSend;
  } catch (error) {
    console.error('Erro ao verificar preferências:', error);
    // Em caso de erro, permitir envio por segurança
    return true;
  }
}

/**
 * Limpa o cache de preferências de um usuário
 */
export function clearPreferencesCache(userId: string): void {
  // Limpar entradas do cache relacionadas ao usuário
  for (const key of preferencesCache.keys()) {
    if (key.startsWith(userId)) {
      preferencesCache.delete(key);
    }
  }
  // Limpar timestamps relacionados
  for (const key of cacheTimestamps.keys()) {
    if (key.startsWith(userId)) {
      cacheTimestamps.delete(key);
    }
  }
}

/**
 * Limpa todo o cache de preferências
 */
export function clearAllPreferencesCache(): void {
  preferencesCache.clear();
  cacheTimestamps.clear();
}

/**
 * Retorna a descrição de quando uma notificação é disparada
 */
export function getNotificationTriggerDescription(type: NotificationType): string {
  const descriptions: Record<NotificationType, string> = {
    NOVO_BRIEFING: 'Quando um novo briefing é recebido',
    PROJETO_ATUALIZADO: 'Quando há atualizações no projeto',
    NOVA_MENSAGEM: 'Quando você recebe uma nova mensagem',
    ARQUIVO_SOLICITADO: 'Quando um arquivo é solicitado',
    PROJETO_CONCLUIDO: 'Quando um projeto é finalizado',
    BRIEFING_APROVADO: 'Quando seu briefing é aprovado',
    BRIEFING_REJEITADO: 'Quando seu briefing é rejeitado',
    MILESTONE_CONCLUIDA: 'Quando uma milestone é concluída',
    SISTEMA: 'Notificações do sistema',
  };

  return descriptions[type] || '';
}

/**
 * Retorna os canais padrão para cada tipo de notificação
 */
export function getDefaultChannelsForType(type: NotificationType): NotificationChannel[] {
  if (type === 'SISTEMA') {
    return ['IN_APP'];
  }
  return ['IN_APP', 'EMAIL', 'PUSH'];
}

/**
 * Formata data de criação da notificação para exibição
 */
export function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'Agora mesmo';
  }
  if (diffMins < 60) {
    return `Há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
  }
  if (diffHours < 24) {
    return `Há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  }
  if (diffDays < 7) {
    return `Há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
  }

  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

/**
 * Agrupa notificações por data
 */
export function groupNotificationsByDate(
  notifications: Notification[]
): Array<{ date: string; notifications: Notification[] }> {
  const groups = new Map<string, Notification[]>();

  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey: string;

    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Ontem';
    } else {
      dateKey = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: today.getFullYear() !== date.getFullYear() ? 'numeric' : undefined,
      });
    }

    const existing = groups.get(dateKey) || [];
    existing.push(notification);
    groups.set(dateKey, existing);
  });

  return Array.from(groups.entries()).map(([date, notifications]) => ({
    date,
    notifications: notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  }));
}
