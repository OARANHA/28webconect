'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationList } from '@/components/dashboard/NotificationList';
import Button from '@/components/ui/Button';
import { Bell, Trash2, CheckCheck, Filter, Search, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/types/notifications';
import { getNotificationTypeLabel } from '@/lib/notification-helpers';

type FilterType = 'all' | 'unread' | NotificationType;

/**
 * Página de todas as notificações - Client Component
 * Exibe histórico completo com filtros e busca
 */
export default function NotificacoesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  /**
   * Filtra notificações baseado no filtro atual e busca
   */
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Filtro por tipo/leitura
    switch (filter) {
      case 'unread':
        filtered = filtered.filter((n) => !n.read);
        break;
      case 'all':
        break;
      default:
        // Filtro por tipo específico
        filtered = filtered.filter((n) => n.type === filter);
    }

    // Filtro por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) => n.title.toLowerCase().includes(query) || n.message.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notifications, filter, searchQuery]);

  /**
   * Limpa notificações lidas antigas (mais de 30 dias)
   */
  const handleClearOld = useCallback(async () => {
    if (!userId) return;

    setIsClearing(true);
    try {
      // TODO: Implementar server action para limpar notificações antigas
      // const result = await clearOldNotifications(userId);
      // if (result.success) {
      //   refreshNotifications();
      // }

      // Por enquanto, apenas recarrega
      await refreshNotifications();
    } finally {
      setIsClearing(false);
    }
  }, [userId, refreshNotifications]);

  /**
   * Tipos de notificação disponíveis
   */
  const notificationTypes: NotificationType[] = [
    'NOVO_BRIEFING',
    'PROJETO_ATUALIZADO',
    'NOVA_MENSAGEM',
    'ARQUIVO_SOLICITADO',
    'PROJETO_CONCLUIDO',
    'BRIEFING_APROVADO',
    'BRIEFING_REJEITADO',
    'MILESTONE_CONCLUIDA',
    'SISTEMA',
  ];

  /**
   * Opções de filtro
   */
  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'unread', label: `Não lidas (${unreadCount})` },
    ...notificationTypes.map((type) => ({
      value: type as FilterType,
      label: getNotificationTypeLabel(type),
    })),
  ];

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-accent-primary" />
            Notificações
          </h1>
          <p className="text-neutral-gray mt-1">Gerencie suas notificações e preferências</p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="text-xs">
              <CheckCheck className="w-4 h-4 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearOld}
            disabled={isClearing || notifications.length === 0}
            className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {isClearing ? 'Limpando...' : 'Limpar antigas'}
          </Button>
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Barra de busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray" />
          <input
            type="text"
            placeholder="Buscar notificações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg',
              'bg-dark-bg-secondary border border-neutral-gray/20',
              'text-neutral-white placeholder-neutral-gray/50',
              'focus:outline-none focus:ring-2 focus:ring-accent-primary/50',
              'focus:border-accent-primary transition-colors'
            )}
          />
        </div>

        {/* Select de filtro */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className={cn(
              'pl-10 pr-8 py-2 rounded-lg appearance-none',
              'bg-dark-bg-secondary border border-neutral-gray/20',
              'text-neutral-white',
              'focus:outline-none focus:ring-2 focus:ring-accent-primary/50',
              'focus:border-accent-primary transition-colors',
              'cursor-pointer min-w-[160px]'
            )}
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-neutral-gray"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Lista de notificações */}
      <div className="bg-dark-bg-secondary border border-neutral-gray/10 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin mx-auto" />
            <p className="text-neutral-gray mt-2 text-sm">Carregando notificações...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-gray/10 flex items-center justify-center">
              <Inbox className="w-8 h-8 text-neutral-gray" />
            </div>
            <h3 className="text-lg font-medium text-neutral-white">
              {searchQuery
                ? 'Nenhuma notificação encontrada'
                : filter === 'unread'
                  ? 'Nenhuma notificação não lida'
                  : 'Nenhuma notificação'}
            </h3>
            <p className="text-neutral-gray text-sm mt-1">
              {searchQuery
                ? 'Tente buscar com outros termos'
                : filter === 'unread'
                  ? 'Você leu todas as suas notificações!'
                  : 'Você receberá notificações sobre atualizações importantes aqui'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            <NotificationList
              notifications={filteredNotifications}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      {!isLoading && filteredNotifications.length > 0 && (
        <p className="text-center text-sm text-neutral-gray">
          Mostrando {filteredNotifications.length} notificação
          {filteredNotifications.length !== 1 ? 's' : ''}
          {filter !== 'all' && ' (filtradas)'}
        </p>
      )}
    </div>
  );
}
