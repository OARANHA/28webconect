'use client';

import Link from 'next/link';
import { ProjectListItem } from '@/types/project';
import { calculateProgress } from '@/lib/project-utils';
import { formatDate, truncateText } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import ProjectStatusBadge from './ProjectStatusBadge';
import ProgressBar from './ProgressBar';
import {
  Calendar,
  TrendingUp,
  ArrowRight,
  FileText,
  MessageSquare,
  Globe,
  Palette,
  Code,
  ShoppingCart,
} from 'lucide-react';
import { ServiceType } from '@prisma/client';

interface ProjectCardProps {
  project: ProjectListItem;
  variant?: 'default' | 'compact';
  className?: string;
}

const serviceTypeIcons: Record<ServiceType, React.ReactNode> = {
  SITE_INSTITUCIONAL: <Globe className="w-4 h-4" />,
  LANDING_PAGE: <FileText className="w-4 h-4" />,
  E_COMMERCE: <ShoppingCart className="w-4 h-4" />,
  WEB_APP: <Code className="w-4 h-4" />,
  DESIGN_UI_UX: <Palette className="w-4 h-4" />,
  OUTRO: <FileText className="w-4 h-4" />,
};

const serviceTypeLabels: Record<ServiceType, string> = {
  SITE_INSTITUCIONAL: 'Site Institucional',
  LANDING_PAGE: 'Landing Page',
  E_COMMERCE: 'E-commerce',
  WEB_APP: 'Web App',
  DESIGN_UI_UX: 'Design UI/UX',
  OUTRO: 'Outro',
};

/**
 * Componente de card para exibir informações do projeto
 */
export default function ProjectCard({ project, variant = 'default', className }: ProjectCardProps) {
  const progress = calculateProgress(project.milestones);
  const isCompact = variant === 'compact';

  const serviceType = project.briefing?.serviceType;
  const serviceIcon = serviceType ? serviceTypeIcons[serviceType] : null;
  const serviceLabel = serviceType ? serviceTypeLabels[serviceType] : null;

  return (
    <Card
      variant="elevated"
      className={cn('group flex flex-col', isCompact ? 'p-4' : 'p-5', className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              'font-semibold text-neutral-white truncate group-hover:text-accent-primary transition-colors',
              isCompact ? 'text-base' : 'text-lg'
            )}
          >
            {project.name}
          </h3>
          {serviceType && (
            <div className="flex items-center gap-1.5 text-neutral-gray text-xs mt-1">
              {serviceIcon}
              <span>{serviceLabel}</span>
            </div>
          )}
        </div>
        <ProjectStatusBadge status={project.status} showIcon={!isCompact} />
      </div>

      {/* Descrição */}
      {!isCompact && project.description && (
        <p className="text-sm text-neutral-gray mb-4 line-clamp-2">
          {truncateText(project.description, 120)}
        </p>
      )}

      {/* Progress Bar */}
      <div className={cn('mt-auto', isCompact ? 'mb-3' : 'mb-4')}>
        <ProgressBar progress={progress} size={isCompact ? 'sm' : 'md'} showLabel={!isCompact} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-gray/10">
        <div className="flex items-center gap-3 text-neutral-gray">
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(project.updatedAt)}</span>
          </div>
          {!isCompact && project._count && (
            <>
              <div className="flex items-center gap-1 text-xs">
                <FileText className="w-3.5 h-3.5" />
                <span>{project._count.files}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{project._count.comments}</span>
              </div>
            </>
          )}
        </div>
        <Link
          href={`/projetos/${project.id}`}
          className={cn(
            'flex items-center gap-1 text-accent-primary font-medium',
            'hover:text-accent-secondary transition-colors',
            isCompact ? 'text-xs' : 'text-sm'
          )}
        >
          Ver Detalhes
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </Card>
  );
}
