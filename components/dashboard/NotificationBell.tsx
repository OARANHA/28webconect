'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationList, NotificationListSkeleton } from './NotificationList';

interface NotificationBellProps {
  className?: string;
}

/**
 * Componente de sino de notificações com dropdown
 */
export function NotificationBell({ className = '' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();

  /**
   * Fecha dropdown ao clicar fora
   */
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  // Setup click outside listener
  useEffect(() => {
    if (!isOpen) return;

    // Debounce de 100ms
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  // Fechar dropdown ao pressionar Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  /**
   * Toggle do dropdown
   */
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Marca todas como lidas
   */
  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  return (
    <div className={`relative ${className}`}>
      {/* Botão do sino */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`
          relative p-2 rounded-lg transition-all duration-200
          text-neutral-gray hover:text-neutral-white hover:bg-neutral-gray/10
          ${isOpen ? 'bg-neutral-gray/10 text-neutral-white' : ''}
        `}
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" />

        {/* Badge de contagem */}
        {unreadCount > 0 && (
          <span
            className={`
              absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5
              bg-red-500 text-white text-xs font-bold rounded-full
              flex items-center justify-center
              animate-in fade-in zoom-in duration-200
            `}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute right-0 mt-2 w-80 md:w-96
            bg-dark-bg-secondary border border-neutral-gray/10
            rounded-lg shadow-lg z-50
            animate-in fade-in slide-in-from-top-2 duration-200
          `}
          role="menu"
          aria-label="Menu de notificações"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-gray/10">
            <h3 className="text-sm font-semibold text-neutral-white">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="
                  text-xs text-accent-primary hover:text-accent-primary/80
                  transition-colors font-medium
                "
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista de notificações */}
          <div className="py-1">
            {isLoading ? (
              <NotificationListSkeleton />
            ) : (
              <NotificationList
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            )}
          </div>

          {/* Footer - Ver todas */}
          {notifications.length > 0 && (
            <div className="border-t border-neutral-gray/10 px-4 py-2">
              <Link
                href="/dashboard/notificacoes"
                onClick={() => setIsOpen(false)}
                className="
                  block text-center text-sm text-neutral-gray
                  hover:text-accent-primary transition-colors
                "
              >
                Ver todas as notificações
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Overlay para mobile - fecha ao clicar fora */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default NotificationBell;
