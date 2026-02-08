'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  color?: 'blue' | 'emerald' | 'primary' | 'yellow' | 'red';
  className?: string;
}

const colorVariants = {
  blue: {
    icon: 'bg-blue-500/10 text-blue-400',
    trend: {
      positive: 'text-emerald-400',
      negative: 'text-red-400',
    },
  },
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-400',
    trend: {
      positive: 'text-emerald-400',
      negative: 'text-red-400',
    },
  },
  primary: {
    icon: 'bg-accent-primary/10 text-accent-primary',
    trend: {
      positive: 'text-emerald-400',
      negative: 'text-red-400',
    },
  },
  yellow: {
    icon: 'bg-amber-500/10 text-amber-400',
    trend: {
      positive: 'text-emerald-400',
      negative: 'text-red-400',
    },
  },
  red: {
    icon: 'bg-red-500/10 text-red-400',
    trend: {
      positive: 'text-emerald-400',
      negative: 'text-red-400',
    },
  },
};

/**
 * Card de métricas para dashboard
 * Exibe um valor com ícone e trend opcional
 */
export function MetricsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  className,
}: MetricsCardProps) {
  const colors = colorVariants[color];

  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-gray mb-1">{title}</p>
          <p className="text-2xl font-bold text-neutral-white">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? colors.trend.positive : colors.trend.negative
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </span>
              <span className="text-sm text-neutral-gray">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', colors.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}
