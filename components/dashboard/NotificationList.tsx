'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import type { Notification } from '@/types/notifications';
import {
  getNotificationIcon,
  getNotificationBgColor,
  formatNotificationTime,
  formatNotificationMessage,
  groupNotificationsByDate,
} from '@/lib/notification-helpers';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Componente de item individual de notificação
 */
function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const icon = getNotificationIcon(notification.type);
  const bgColorClass = getNotificationBgColor(notification.type);
  const formattedMessage = formatNotificationMessage(notification);
  const timeAgo = formatNotificationTime(notification.createdAt);

  const handleClick = useCallback(() => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // Navegar para URL de ação se existir
    const metadata = notification.metadata as Record<string, string> | null;
    if (metadata?.actionUrl) {
      router.push(metadata.actionUrl);
    }
  }, [notification, onMarkAsRead, router]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(notification.id);
    },
    [notification.id, onDelete]
  );

  return (
    <div
      onClick={handleClick}
      className={`
        flex gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200
        hover:bg-neutral-gray/5 group relative
        ${notification.read ? 'opacity-60' : 'opacity-100'}
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      {/* Ícone do tipo de notificação */}
      <div
        className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          text-lg ${bgColorClass}
        `}
      >
        {icon}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 pr-6">
        <h4
          className={`
            text-sm font-medium text-neutral-white leading-tight
            ${notification.read ? 'font-normal' : 'font-semibold'}
          `}
        >
          {notification.title}
        </h4>
        <p className="text-sm text-neutral-gray mt-0.5 line-clamp-2">{formattedMessage}</p>
        <span className="text-xs text-neutral-gray/60 mt-1 block">{timeAgo}</span>
      </div>

      {/* Indicador de não lida */}
      {!notification.read && (
        <div className="absolute top-3 right-9 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      {/* Botão de deletar */}
      <button
        onClick={handleDelete}
        className="
          absolute top-3 right-3 p-1 rounded opacity-0 group-hover:opacity-100
          text-neutral-gray hover:text-red-400 hover:bg-red-500/10
          transition-all duration-200
        "
        aria-label="Remover notificação"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/**
 * Componente de lista de notificações agrupadas por data
 */
export function NotificationList({ notifications, onMarkAsRead, onDelete }: NotificationListProps) {
  const groupedNotifications = groupNotificationsByDate(notifications);

  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-4xl mb-3">🔔</div>
        <p className="text-neutral-gray text-sm">Nenhuma notificação</p>
        <p className="text-neutral-gray/60 text-xs mt-1">
          Você receberá notificações sobre atualizações importantes aqui
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-neutral-gray/20 scrollbar-track-transparent">
      {groupedNotifications.map(({ date, notifications: groupNotifications }) => (
        <div key={date} className="py-2">
          {/* Header do grupo de data */}
          <div className="px-3 py-1.5 sticky top-0 bg-dark-bg-secondary/95 backdrop-blur-sm z-10">
            <span className="text-xs font-medium text-neutral-gray/70 uppercase tracking-wider">
              {date}
            </span>
          </div>

          {/* Lista de notificações do grupo */}
          <div className="px-2 space-y-1">
            {groupNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader para notificações
 */
export function NotificationListSkeleton() {
  return (
    <div className="p-3 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-neutral-gray/20" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-gray/20 rounded w-3/4" />
            <div className="h-3 bg-neutral-gray/10 rounded w-full" />
            <div className="h-3 bg-neutral-gray/10 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default NotificationList;
