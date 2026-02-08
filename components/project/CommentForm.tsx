'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bold, Italic, Code, Link, List, Eye, EyeOff, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addCommentSchema, type AddCommentInput } from '@/lib/validations/comments';
import type { CommentWithUser } from '@/types/project';
import MarkdownContent from './MarkdownContent';
import { addComment } from '@/app/actions/comments';
import { toast } from 'sonner';

interface CommentFormProps {
  projectId: string;
  milestoneId?: string | null;
  userId: string;
  onCommentAdded: (comment: CommentWithUser) => void;
}

/**
 * Componente de formulário de comentário
 * Suporta markdown com toolbar e preview
 */
export default function CommentForm({
  projectId,
  milestoneId,
  userId,
  onCommentAdded,
}: CommentFormProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useState<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddCommentInput>({
    resolver: zodResolver(addCommentSchema),
    defaultValues: {
      projectId,
      milestoneId: milestoneId || undefined,
      content: '',
    },
  });

  const content = watch('content') || '';
  const charCount = content.length;
  const isOverLimit = charCount > 5000;

  // Inserir markdown no cursor
  const insertMarkdown = useCallback(
    (before: string, after: string = '') => {
      const textarea = textareaRef[0];
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const newText =
        content.substring(0, start) + before + selectedText + after + content.substring(end);

      setValue('content', newText);

      // Restaurar foco e posicionar cursor
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + before.length + selectedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [content, setValue, textareaRef]
  );

  const toolbarButtons = [
    { icon: Bold, label: 'Negrito', action: () => insertMarkdown('**', '**') },
    { icon: Italic, label: 'Itálico', action: () => insertMarkdown('*', '*') },
    { icon: Code, label: 'Código', action: () => insertMarkdown('`', '`') },
    { icon: Link, label: 'Link', action: () => insertMarkdown('[', '](url)') },
    { icon: List, label: 'Lista', action: () => insertMarkdown('- ') },
  ];

  const onSubmit = async (data: AddCommentInput) => {
    if (isOverLimit) {
      toast.error('Comentário muito longo. Máximo 5000 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addComment(data, userId);

      if (result.success && result.data) {
        toast.success('Comentário enviado com sucesso!');
        onCommentAdded(result.data);
        reset({ projectId, milestoneId: milestoneId || undefined, content: '' });
      } else {
        toast.error(result.error || 'Erro ao enviar comentário');
      }
    } catch (error) {
      toast.error('Erro inesperado ao enviar comentário');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suporte a Ctrl+Enter para enviar
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {toolbarButtons.map((button) => (
            <button
              key={button.label}
              type="button"
              onClick={button.action}
              disabled={isSubmitting}
              className="p-1.5 rounded-lg text-neutral-gray hover:text-neutral-white hover:bg-neutral-gray/10 transition-colors disabled:opacity-50"
              title={button.label}
              aria-label={button.label}
            >
              <button.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-neutral-gray hover:text-neutral-white hover:bg-neutral-gray/10 transition-colors disabled:opacity-50"
        >
          {showPreview ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              Editar
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              Visualizar
            </>
          )}
        </button>
      </div>

      {/* Textarea ou Preview */}
      {showPreview ? (
        <div className="min-h-[120px] max-h-[300px] overflow-y-auto rounded-xl border border-neutral-gray/10 bg-dark-bg-primary p-4">
          {content ? (
            <MarkdownContent content={content} />
          ) : (
            <p className="text-neutral-gray/50 italic">Nada para visualizar...</p>
          )}
        </div>
      ) : (
        <div className="relative">
          <textarea
            {...register('content')}
            ref={(e) => {
              register('content').ref(e);
              textareaRef[1](e);
            }}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            placeholder="Digite seu comentário... Use markdown para formatação."
            className={cn(
              'w-full min-h-[120px] max-h-[300px] rounded-xl border bg-dark-bg-primary p-4',
              'text-neutral-white placeholder:text-neutral-gray/50',
              'focus:border-accent-primary focus:ring-1 focus:ring-accent-primary',
              'transition-all duration-200 resize-y',
              errors.content
                ? 'border-red-500/50'
                : 'border-neutral-gray/10 border-dashed hover:border-neutral-gray/30',
              isSubmitting && 'opacity-60 cursor-not-allowed'
            )}
            aria-invalid={errors.content ? 'true' : 'false'}
            aria-describedby={errors.content ? 'content-error' : undefined}
          />

          {/* Erro de validação */}
          {errors.content && (
            <p id="content-error" className="mt-1.5 text-xs text-red-400">
              {errors.content.message}
            </p>
          )}
        </div>
      )}

      {/* Footer com contador e botão */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('text-xs', isOverLimit ? 'text-red-400' : 'text-neutral-gray')}>
            {charCount}/5000
          </span>
          <span className="text-xs text-neutral-gray/50">Ctrl+Enter para enviar</span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !content.trim() || isOverLimit}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm',
            'bg-accent-primary text-neutral-white',
            'hover:bg-accent-primary/90 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar
            </>
          )}
        </button>
      </div>
    </form>
  );
}
