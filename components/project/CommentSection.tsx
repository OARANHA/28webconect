'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole, type ProjectMilestone } from '@prisma/client';
import type { CommentWithUser, CommentsPaginatedResponse } from '@/types/project';
import Card from '@/components/ui/Card';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { getCommentsByProject, deleteComment } from '@/app/actions/comments';
import { toast } from 'sonner';

interface CommentSectionProps {
  projectId: string;
  milestones: ProjectMilestone[];
  initialComments?: CommentWithUser[];
  userId: string;
  userRole: UserRole;
}

interface CommentTab {
  id: string | null;
  label: string;
  count: number;
}

/**
 * Componente principal de seção de comentários
 * Gerencia tabs por milestone, paginação e estado dos comentários
 */
export default function CommentSection({
  projectId,
  milestones,
  initialComments = [],
  userId,
  userRole,
}: CommentSectionProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentWithUser[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;

  // Preparar tabs
  const tabs: CommentTab[] = [
    { id: null, label: 'Geral', count: 0 }, // Count será calculado dinamicamente
    ...milestones.map((m) => ({ id: m.id, label: m.name, count: 0 })),
  ];

  // Carregar comentários quando milestone muda
  const loadComments = useCallback(
    async (milestoneId: string | null, reset: boolean = true) => {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        // Para a aba "Geral", não enviar milestoneId para trazer todos os comentários
        const result = await getCommentsByProject(
          {
            projectId,
            // undefined para aba Geral (todos), ou milestoneId específico
            ...(milestoneId ? { milestoneId } : {}),
            cursor: reset ? undefined : cursor,
            limit: 10,
          },
          userId
        );

        if (result.success && result.data) {
          const data = result.data as CommentsPaginatedResponse;

          if (reset) {
            setComments(data.comments);
          } else {
            setComments((prev) => [...prev, ...data.comments]);
          }

          setHasMore(data.hasMore);
          setCursor(data.nextCursor);
        } else {
          toast.error(result.error || 'Erro ao carregar comentários');
        }
      } catch (error) {
        toast.error('Erro inesperado ao carregar comentários');
        console.error(error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [projectId, userId, cursor]
  );

  // Carregar comentários iniciais quando milestone muda
  useEffect(() => {
    // Sempre carregar do backend para garantir hasMore e cursor corretos
    loadComments(selectedMilestone, true);
  }, [selectedMilestone]);

  // Handler para novo comentário adicionado
  const handleCommentAdded = useCallback((newComment: CommentWithUser) => {
    setComments((prev) => [newComment, ...prev]);
  }, []);

  // Handler para deletar comentário
  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      try {
        const result = await deleteComment({ commentId }, userId);

        if (result.success) {
          toast.success('Comentário removido com sucesso');
          setComments((prev) => prev.filter((c) => c.id !== commentId));
        } else {
          toast.error(result.error || 'Erro ao remover comentário');
        }
      } catch (error) {
        toast.error('Erro inesperado ao remover comentário');
        console.error(error);
      }
    },
    [userId]
  );

  // Carregar mais comentários
  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) return;
    loadComments(selectedMilestone, false);
  };

  // Verificar se usuário pode deletar comentário
  const canDeleteComment = (comment: CommentWithUser): boolean => {
    return comment.userId === userId || isAdmin;
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent-primary" />
            Comentários e Comunicação
          </h3>
        </div>

        {/* Tabs de milestones */}
        {milestones.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id ?? 'general'}
                onClick={() => setSelectedMilestone(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                  selectedMilestone === tab.id
                    ? 'bg-accent-primary text-neutral-white'
                    : 'bg-dark-bg-primary text-neutral-gray hover:text-neutral-white hover:bg-neutral-gray/10'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Formulário de comentário */}
        <CommentForm
          projectId={projectId}
          milestoneId={selectedMilestone}
          userId={userId}
          onCommentAdded={handleCommentAdded}
        />

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
            <span className="ml-2 text-neutral-gray">Carregando comentários...</span>
          </div>
        )}

        {/* Lista de comentários */}
        {!isLoading && (
          <div className="space-y-4">
            {comments.length === 0 ? (
              // Empty state
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-dark-bg-primary flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-neutral-gray/50" />
                </div>
                <p className="text-neutral-gray">
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </p>
              </div>
            ) : (
              <>
                {comments.map((comment, index) => (
                  <div
                    key={comment.id}
                    className={cn(
                      'animate-in fade-in slide-in-from-bottom-2',
                      index === 0 && 'duration-500'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CommentItem
                      comment={comment}
                      canDelete={canDeleteComment(comment)}
                      onDelete={handleDeleteComment}
                    />
                  </div>
                ))}

                {/* Botão carregar mais */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg',
                        'text-sm font-medium text-neutral-gray',
                        'hover:text-neutral-white hover:bg-dark-bg-primary',
                        'transition-colors disabled:opacity-50'
                      )}
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Carregar mais comentários
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
