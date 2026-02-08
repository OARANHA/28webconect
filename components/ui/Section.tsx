'use client';

import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  id?: string;
  animate?: boolean;
}

/**
 * Componente Section wrapper com título opcional e animações CSS
 * Versão otimizada sem framer-motion para reduzir bundle inicial
 * Usa classes CSS para animações fade/slide quando animate=true
 */
export default function Section({
  children,
  title,
  subtitle,
  className,
  id,
  animate = true,
}: SectionProps) {
  const content = (
    <section id={id} className={cn('py-16 md:py-24', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className={cn('text-center mb-12', animate && 'animate-fade-in')}>
            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl text-neutral-gray mt-4 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className={cn('mt-12', animate && 'animate-slide-up')}>{children}</div>
      </div>
    </section>
  );

  return content;
}
