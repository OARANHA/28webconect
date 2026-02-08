'use client';

import { ProjectMilestone } from '@prisma/client';
import { calculateProgress } from '@/lib/project-utils';
import ProgressBar from '@/components/project/ProgressBar';
import MilestoneCheckbox from './MilestoneCheckbox';
import { Circle, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminProjectTimelineProps {
  milestones: ProjectMilestone[];
  onToggleMilestone: (id: string, completed: boolean) => Promise<void>;
  showConfettiOnComplete?: boolean;
}

/**
 * Componente de timeline interativa para admin
 * Permite marcar/desmarcar milestones e mostra progresso
 */
export default function AdminProjectTimeline({
  milestones,
  onToggleMilestone,
  showConfettiOnComplete = true,
}: AdminProjectTimelineProps) {
  // Ordenar milestones por ordem
  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);

  // Calcular progresso
  const progress = calculateProgress(milestones);
  const isComplete = progress === 100;

  return (
    <div className="space-y-6">
      {/* Header com progresso */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-neutral-light">Progresso do Projeto</h3>
            {isComplete && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
                <PartyPopper className="w-3 h-3" />
                Concluído!
              </span>
            )}
          </div>
          <span
            className={cn(
              'text-lg font-bold',
              isComplete ? 'text-emerald-400' : 'text-neutral-white'
            )}
          >
            {progress}%
          </span>
        </div>
        <ProgressBar progress={progress} size="lg" animated />
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Linha conectora vertical */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-neutral-gray/20" />

        {/* Lista de milestones */}
        <div className="space-y-0">
          {sortedMilestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className={cn(
                'relative py-4',
                index !== sortedMilestones.length - 1 && 'border-b border-neutral-gray/10'
              )}
            >
              <MilestoneCheckbox milestone={milestone} onToggle={onToggleMilestone} />
            </div>
          ))}
        </div>

        {/* Estado vazio */}
        {sortedMilestones.length === 0 && (
          <div className="text-center py-8 text-neutral-gray">
            <Circle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma milestone definida para este projeto.</p>
          </div>
        )}
      </div>
    </div>
  );
}
