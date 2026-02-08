'use client';

import { ProjectStatus } from '@prisma/client';
import { cn } from '@/lib/utils';
import { getProjectStatusLabel, getProjectStatusColor } from '@/lib/project-utils';
import { Clock, Play, Pause, CheckCircle, XCircle, Archive } from 'lucide-react';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
  showIcon?: boolean;
}

const statusIcons: Record<ProjectStatus, React.ReactNode> = {
  AGUARDANDO_APROVACAO: <Clock className="w-3.5 h-3.5" />,
  ATIVO: <Play className="w-3.5 h-3.5" />,
  PAUSADO: <Pause className="w-3.5 h-3.5" />,
  CONCLUIDO: <CheckCircle className="w-3.5 h-3.5" />,
  CANCELADO: <XCircle className="w-3.5 h-3.5" />,
  ARQUIVADO: <Archive className="w-3.5 h-3.5" />,
};

/**
 * Componente para exibir o status do projeto com cores e ícone
 */
export default function ProjectStatusBadge({
  status,
  className,
  showIcon = true,
}: ProjectStatusBadgeProps) {
  const label = getProjectStatusLabel(status);
  const colorClasses = getProjectStatusColor(status);
  const icon = statusIcons[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        colorClasses,
        className
      )}
    >
      {showIcon && icon}
      {label}
    </span>
  );
}
