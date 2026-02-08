'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down';
  };
  color?: 'primary' | 'emerald' | 'yellow' | 'red' | 'blue';
  className?: string;
}

/**
 * Componente de card para exibir métricas com ícone, valor e tendência
 */
export default function MetricsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  className,
}: MetricsCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const colorClasses = {
    primary: {
      bg: 'bg-accent-primary/10',
      text: 'text-accent-primary',
      border: 'border-accent-primary/20',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
    },
    yellow: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      border: 'border-yellow-500/20',
    },
    red: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/20',
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-5 transition-all duration-500',
        'bg-dark-bg-secondary border-neutral-gray/10',
        'hover:border-neutral-gray/20 hover:shadow-lg',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
    >
      {/* Background gradient effect */}
      <div
        className={cn(
          'absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl',
          colors.bg
        )}
      />

      <div className="relative">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-3">
          <div className={cn('p-2 rounded-lg', colors.bg)}>
            <Icon className={cn('w-5 h-5', colors.text)} />
          </div>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                trend.direction === 'up'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              )}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value > 0 ? '+' : ''}
              {trend.value}%
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-1">
          <span className="text-2xl font-bold text-neutral-white">{value}</span>
        </div>

        {/* Title */}
        <p className="text-sm text-neutral-gray">{title}</p>

        {/* Trend label */}
        {trend && <p className="text-xs text-neutral-gray/70 mt-2">{trend.label}</p>}
      </div>
    </div>
  );
}
