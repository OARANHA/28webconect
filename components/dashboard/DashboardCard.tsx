'use client';

import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'default' | 'accent';
  className?: string;
}

/**
 * Card de estatísticas do Dashboard
 * Componente reutilizável para exibir métricas
 */
export default function DashboardCard({
  title,
  value,
  icon,
  variant = 'default',
  className,
}: DashboardCardProps) {
  return (
    <Card
      variant={variant === 'accent' ? 'dashed' : 'default'}
      className={cn(
        'hover:-translate-y-1 transition-transform duration-300',
        variant === 'accent' && 'border-accent-primary/30',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Ícone */}
        <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center text-accent-primary shrink-0">
          {icon}
        </div>

        {/* Conteúdo */}
        <div className="min-w-0">
          <p className="text-neutral-gray text-sm truncate">{title}</p>
          <p className="text-2xl font-bold text-neutral-white">{value}</p>
        </div>
      </div>
    </Card>
  );
}
