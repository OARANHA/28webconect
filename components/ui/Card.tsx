'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'dashed' | 'elevated';
  className?: string;
  animate?: boolean;
}

/**
 * Componente Card reutilizável com variantes de estilo
 * Versão estática sem framer-motion para melhor performance
 * Animações via CSS quando necessário
 */
export default function Card({
  children,
  variant = 'default',
  className,
  animate = false,
}: CardProps) {
  const [isVisible, setIsVisible] = useState(!animate);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  const baseStyles = 'bg-dark-bg-secondary rounded-xl p-6 transition-all duration-300';

  const variantStyles = {
    default: 'border border-neutral-gray/10',
    dashed: 'border-2 border-dashed border-accent-primary/30',
    elevated: cn(
      'border border-neutral-gray/10',
      'hover:-translate-y-1 hover:shadow-xl',
      'hover:border-accent-primary/30'
    ),
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        className,
        animate && 'transition-all duration-500',
        animate && (isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5')
      )}
    >
      {children}
    </div>
  );
}
