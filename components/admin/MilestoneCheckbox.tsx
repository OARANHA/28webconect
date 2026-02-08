'use client';

import { useState } from 'react';
import { ProjectMilestone } from '@prisma/client';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

interface MilestoneCheckboxProps {
  milestone: ProjectMilestone;
  onToggle: (id: string, completed: boolean) => Promise<void>;
}

/**
 * Componente de checkbox customizado para milestones
 * Com loading state e tooltip de data de conclusão
 */
export default function MilestoneCheckbox({ milestone, onToggle }: MilestoneCheckboxProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await onToggle(milestone.id, !milestone.completed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-start gap-3">
      {/* Checkbox customizado */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          'relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          'transition-all duration-300 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-dark-bg-secondary',
          milestone.completed
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-dark-bg-primary text-neutral-gray border border-neutral-gray/30 hover:border-neutral-gray/50',
          isLoading && 'opacity-70 cursor-wait'
        )}
        title={milestone.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : milestone.completed ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              'text-sm font-medium transition-all duration-300',
              milestone.completed ? 'text-neutral-gray line-through' : 'text-neutral-white'
            )}
          >
            {milestone.name}
          </h4>
          {milestone.completed && milestone.completedAt && (
            <span
              className="text-xs text-emerald-400 flex-shrink-0"
              title={`Concluído em ${formatDate(milestone.completedAt)}`}
            >
              {formatDate(milestone.completedAt)}
            </span>
          )}
        </div>
        {milestone.description && (
          <p
            className={cn(
              'text-sm mt-1',
              milestone.completed ? 'text-neutral-gray/70' : 'text-neutral-gray'
            )}
          >
            {milestone.description}
          </p>
        )}
      </div>
    </div>
  );
}
