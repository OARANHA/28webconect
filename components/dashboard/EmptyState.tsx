'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

/**
 * Estado vazio reutilizável
 * Exibido quando não há dados para mostrar
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'bg-dark-bg-secondary rounded-xl p-8 md:p-12',
        'border border-neutral-gray/10',
        'flex flex-col items-center justify-center text-center',
        className
      )}
    >
      {/* Ícone */}
      <div className="w-16 h-16 md:w-20 md:h-20 text-neutral-gray/50 mb-6">{icon}</div>

      {/* Título */}
      <h3 className="text-xl font-semibold text-neutral-white mb-2">{title}</h3>

      {/* Descrição */}
      <p className="text-neutral-gray max-w-md mb-6">{description}</p>

      {/* Ação opcional */}
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button variant="primary">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
