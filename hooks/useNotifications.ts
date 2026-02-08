'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import type { Notification } from '@/types/notifications';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/app/actions/notifications';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const POLLING_INTERVAL = 30000; // 30 segundos
const SOUND_ENABLED_KEY = 'notification-sound-enabled';

/**
 * Toca som de notificação
 */
function playNotificationSound(): void {
  if (typeof window === 'undefined') return;

  const soundEnabled = localStorage.getItem(SOUND_ENABLED_KEY) !== 'false';
  if (!soundEnabled) return;

  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignorar erro se autoplay for bloqueado
    });
  } catch {
    // Ignorar erros de áudio
  }
}

/**
 * Hook customizado para gerenciar notificações
 * Implementa polling automático a cada 30 segundos
 */
export function useNotifications(): UseNotificationsReturn {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs para debounce e controle de estado anterior
  const prevUnreadCountRef = useRef(0);
  const isFetchingRef = useRef(false);

  /**
   * Busca notificações do usuário
   */
  const fetchNotifications = useCallback(async () => {
    if (!userId || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('[Notifications] Buscando notificações...');
      const result = await getNotifications(userId, { limit: 50 });

      if (result.success && result.data) {
        setNotifications(result.data);
        const count = result.data.filter((n) => !n.read).length;

        // Tocar som se houver novas notificações
        if (count > prevUnreadCountRef.current && prevUnreadCountRef.current > 0) {
          playNotificationSound();
        }

        prevUnreadCountRef.current = count;
        setUnreadCount(count);
      } else {
        setError(result.error || 'Erro ao buscar notificações');
      }
    } catch (err) {
      console.error('[Notifications] Erro:', err);
      setError('Erro ao buscar notificações');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId]);

  /**
   * Atualiza apenas a contagem de não lidas
   */
  const fetchUnreadCount = useCallback(async () => {
    if (!userId || isFetchingRef.current) return;

    isFetchingRef.current = true;

    try {
      const result = await getUnreadCount(userId);

      if (result.success && typeof result.count === 'number') {
        // Tocar som se houver novas notificações
        if (result.count > prevUnreadCountRef.current && prevUnreadCountRef.current > 0) {
          playNotificationSound();
        }

        prevUnreadCountRef.current = result.count;
        setUnreadCount(result.count);
      }
    } catch (err) {
      console.error('[Notifications] Erro ao buscar contagem:', err);
    } finally {
      isFetchingRef.current = false;
    }
  }, [userId]);

  /**
   * Marca uma notificação como lida
   */
  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return;

      try {
        // Otimistic update
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        const result = await markNotificationAsRead(notificationId, userId);

        if (!result.success) {
          // Reverter em caso de erro
          setNotifications((prev) =>
            prev.map((n) => (n.id === notificationId ? { ...n, read: false } : n))
          );
          setUnreadCount((prev) => prev + 1);
          console.error('[Notifications] Erro ao marcar como lida:', result.error);
        }
      } catch (err) {
        console.error('[Notifications] Erro:', err);
      }
    },
    [userId]
  );

  /**
   * Marca todas as notificações como lidas
   */
  const handleMarkAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      // Otimistic update
      const previousNotifications = notifications;
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);

      const result = await markAllNotificationsAsRead(userId);

      if (!result.success) {
        // Reverter em caso de erro
        setNotifications(previousNotifications);
        setUnreadCount(previousNotifications.filter((n) => !n.read).length);
        console.error('[Notifications] Erro ao marcar todas:', result.error);
      }
    } catch (err) {
      console.error('[Notifications] Erro:', err);
    }
  }, [userId, notifications]);

  /**
   * Deleta uma notificação
   */
  const handleDeleteNotification = useCallback(
    async (notificationId: string) => {
      if (!userId) return;

      try {
        // Otimistic update
        const notification = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        const result = await deleteNotification(notificationId, userId);

        if (!result.success) {
          // Reverter em caso de erro
          setNotifications((prev) =>
            [...prev, notification!].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          );
          if (notification && !notification.read) {
            setUnreadCount((prev) => prev + 1);
          }
          console.error('[Notifications] Erro ao deletar:', result.error);
        }
      } catch (err) {
        console.error('[Notifications] Erro:', err);
      }
    },
    [userId, notifications]
  );

  /**
   * Refresh manual de notificações
   */
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Efeito inicial e polling
  useEffect(() => {
    if (!userId) return;

    // Busca inicial
    fetchNotifications();

    // Polling a cada 30 segundos - busca notificações completas para atualizar dropdown/lista
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, POLLING_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [userId, fetchNotifications, fetchUnreadCount]);

  // Atualizar ref quando unreadCount mudar
  useEffect(() => {
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refreshNotifications,
    deleteNotification: handleDeleteNotification,
  };
}
