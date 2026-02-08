'use client';

import { ProjectMilestone } from '@prisma/client';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProjectTimelineProps {
  milestones: ProjectMilestone[];
  isReadOnly?: boolean;
}

/**
 * Componente de timeline vertical para exibir milestones do projeto
 */
export default function ProjectTimeline({ milestones, isReadOnly = true }: ProjectTimelineProps) {
  // Ordenar milestones por ordem
  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);

  return (
    <div className="relative">
      {/* Linha conectora vertical */}
      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-neutral-gray/20" />

      {/* Lista de milestones */}
      <div className="space-y-0">
        {sortedMilestones.map((milestone, index) => {
          const isCompleted = milestone.completed;
          const completedAt = milestone.completedAt;

          return (
            <div
              key={milestone.id}
              className={cn(
                'relative flex items-start gap-4 py-4',
                'animate-in fade-in slide-in-from-left-2 duration-300',
                index !== sortedMilestones.length - 1 && 'border-b border-neutral-gray/10'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Checkbox estilizado */}
              <div
                className={cn(
                  'relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                  'transition-colors duration-300',
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-dark-bg-primary text-neutral-gray border border-neutral-gray/30'
                )}
              >
                <input
                  type="checkbox"
                  checked={isCompleted}
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  className={cn(
                    'w-5 h-5 rounded border-2 cursor-default',
                    'transition-all duration-200',
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-transparent border-neutral-gray/50',
                    'focus:outline-none focus:ring-2 focus:ring-accent-primary/50'
                  )}
                  aria-label={milestone.name}
                />
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start justify-between gap-2">
                  <h4
                    className={cn(
                      'text-sm font-medium transition-all duration-300',
                      isCompleted ? 'text-neutral-gray line-through' : 'text-neutral-white'
                    )}
                  >
                    {milestone.name}
                  </h4>
                  {isCompleted && completedAt && (
                    <span className="text-xs text-emerald-400 flex-shrink-0">
                      {formatDate(completedAt)}
                    </span>
                  )}
                </div>
                {milestone.description && (
                  <p
                    className={cn(
                      'text-sm mt-1',
                      isCompleted ? 'text-neutral-gray/70' : 'text-neutral-gray'
                    )}
                  >
                    {milestone.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado vazio */}
      {sortedMilestones.length === 0 && (
        <div className="text-center py-8 text-neutral-gray">
          <Circle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma milestone definida para este projeto.</p>
        </div>
      )}
    </div>
  );
}
