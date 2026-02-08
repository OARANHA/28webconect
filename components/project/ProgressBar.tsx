'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

/**
 * Componente de barra de progresso animada
 */
export default function ProgressBar({
  progress,
  className,
  showLabel = true,
  size = 'md',
  animated = true,
}: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayProgress(Math.min(Math.max(progress, 0), 100));
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(Math.min(Math.max(progress, 0), 100));
    }
  }, [progress, animated]);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1.5">
        {showLabel && <span className="text-xs text-neutral-gray font-medium">Progresso</span>}
        {showLabel && (
          <span className="text-xs text-neutral-white font-semibold">
            {Math.round(displayProgress)}%
          </span>
        )}
      </div>
      <div
        className={cn('w-full bg-neutral-gray/20 rounded-full overflow-hidden', sizeClasses[size])}
      >
        <div
          className={cn(
            'h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full',
            'transition-all duration-700 ease-out'
          )}
          style={{ width: `${displayProgress}%` }}
          role="progressbar"
          aria-valuenow={displayProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
