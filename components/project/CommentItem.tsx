'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, AlertCircle } from 'lucide-react';
import { cn, getInitials, getStringColor } from '@/lib/utils';
import { UserRole } from '@prisma/client';
import type { CommentWithUser } from '@/types/project';
import UserRoleBadge from './UserRoleBadge';
import MarkdownContent from './MarkdownContent';

interface CommentItemProps {
  comment: CommentWithUser;
  canDelete: boolean;
  onDelete?: (commentId: string) => void;
}

/**
 * Componente de item de comentário
 * Exibe avatar, nome, timestamp, conteúdo markdown e ações
 */
export default function CommentItem({ comment, canDelete, onDelete }: CommentItemProps) {
  const [relativeTime, setRelativeTime] = useState<string>('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin =
    comment.user.role === UserRole.ADMIN || comment.user.role === UserRole.SUPER_ADMIN;
  const userName = comment.user.name || 'Usuário';
  const initials = getInitials(userName);
  const avatarColor = getStringColor(comment.user.id);

  // Atualiza o timestamp relativo
  const updateRelativeTime = useCallback(() => {
    const time = formatDistanceToNow(new Date(comment.createdAt), {
      addSuffix: true,
      locale: ptBR,
    });
    setRelativeTime(time);
  }, [comment.createdAt]);

  useEffect(() => {
    updateRelativeTime();

    // Atualiza a cada minuto
    const interval = setInterval(updateRelativeTime, 60000);
    return () => clearInterval(interval);
  }, [updateRelativeTime]);

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-xl p-4 transition-all duration-300',
        isAdmin
          ? 'bg-accent-primary/5 border border-accent-primary/20'
          : 'bg-dark-bg-primary border border-neutral-gray/10'
      )}
    >
      {/* Header com avatar e informações */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm"
          style={{ backgroundColor: avatarColor }}
          title={userName}
        >
          {initials}
        </div>

        {/* Informações do usuário */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-neutral-white truncate">{userName}</span>
            <UserRoleBadge role={comment.user.role} />
          </div>
          <span
            className="text-xs text-neutral-gray"
            title={new Date(comment.createdAt).toLocaleString('pt-BR')}
          >
            {relativeTime}
          </span>
        </div>

        {/* Botão de deletar */}
        {canDelete && !showConfirmDelete && (
          <button
            onClick={() => setShowConfirmDelete(true)}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-neutral-gray hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            aria-label="Deletar comentário"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Confirmação de deleção */}
      {showConfirmDelete && (
        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-400">
                Tem certeza que deseja remover este comentário?
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Removendo...' : 'Sim, remover'}
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={isDeleting}
                  className="px-3 py-1.5 rounded-lg bg-neutral-gray/10 text-neutral-gray text-xs font-medium hover:bg-neutral-gray/20 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo do comentário */}
      <div className="mt-3">
        <MarkdownContent content={comment.content} />
      </div>
    </div>
  );
}
