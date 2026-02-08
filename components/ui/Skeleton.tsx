'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  variant?: 'text' | 'title' | 'card' | 'circle' | 'rectangle';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

/**
 * Componente Skeleton para estados de loading
 * Usa animação shimmer com gradiente CSS
 */
export default function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  count = 1,
}: SkeletonProps) {
  const baseStyles =
    'bg-gradient-to-r from-dark-bg-secondary via-neutral-gray/10 to-dark-bg-secondary bg-[length:200%_100%] animate-shimmer rounded';

  const variantStyles = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/5',
    card: 'h-48 w-full rounded-xl',
    circle: 'w-12 h-12 rounded-full',
    rectangle: 'h-24 w-full',
  };

  const skeletonElement = (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={{
        width: width,
        height: height,
      }}
      aria-hidden="true"
    />
  );

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>{skeletonElement}</div>
        ))}
      </div>
    );
  }

  return skeletonElement;
}

/**
 * Skeleton específico para cards de serviços
 */
export function ServiceCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-dark-bg-secondary rounded-xl p-6 border-2 border-dashed border-neutral-gray/10',
        className
      )}
    >
      <div className="space-y-4">
        <Skeleton variant="circle" className="w-14 h-14" />
        <Skeleton variant="title" className="h-6 w-2/3" />
        <Skeleton variant="text" count={2} />
        <Skeleton variant="text" className="w-1/3" />
      </div>
    </div>
  );
}

/**
 * Skeleton específico para grid de serviços
 */
export function ServicesGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ServiceCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Skeleton específico para seção de benefícios
 */
export function BenefitsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-dark-bg-secondary rounded-xl p-4 border border-neutral-gray/10"
        >
          <Skeleton variant="circle" className="w-10 h-10 mb-3" />
          <Skeleton variant="title" className="h-5 w-4/5 mb-2" />
          <Skeleton variant="text" count={2} />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para Hero section
 */
export function HeroSkeleton() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Skeleton variant="title" className="h-16 w-full" />
            <Skeleton variant="title" className="h-16 w-4/5" />
            <Skeleton variant="text" count={2} className="max-w-xl" />
            <div className="flex gap-4 pt-4">
              <Skeleton variant="rectangle" className="h-12 w-40 rounded-lg" />
              <Skeleton variant="rectangle" className="h-12 w-48 rounded-lg" />
            </div>
          </div>
          <div className="hidden lg:block">
            <Skeleton variant="card" className="aspect-square max-w-md mx-auto rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para CTA section
 */
export function CTASkeleton() {
  return (
    <div className="bg-dark-bg-secondary/50 rounded-2xl p-8 md:p-16 border-2 border-dashed border-neutral-gray/10">
      <div className="text-center max-w-2xl mx-auto space-y-6">
        <Skeleton variant="title" className="h-10 w-3/4 mx-auto" />
        <Skeleton variant="text" count={2} />
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Skeleton variant="rectangle" className="h-12 w-48 rounded-lg mx-auto sm:mx-0" />
          <Skeleton variant="rectangle" className="h-12 w-48 rounded-lg mx-auto sm:mx-0" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton completo para página inicial
 */
export function HomePageSkeleton() {
  return (
    <div className="space-y-0">
      <HeroSkeleton />
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-4">
            <Skeleton variant="title" className="h-10 w-64 mx-auto" />
            <Skeleton variant="text" className="w-96 mx-auto" />
          </div>
          <ServicesGridSkeleton count={3} />
        </div>
      </div>
      <div className="py-20 bg-dark-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <Skeleton variant="title" className="h-10 w-full" />
              <Skeleton variant="text" count={2} />
              <Skeleton variant="rectangle" className="h-12 w-48 rounded-lg" />
            </div>
            <BenefitsGridSkeleton count={4} />
          </div>
        </div>
      </div>
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CTASkeleton />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para formulário de autenticação
 */
export function AuthFormSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto p-8 bg-dark-bg-secondary rounded-xl border-2 border-dashed border-neutral-gray/10 space-y-6">
      <div className="text-center space-y-2">
        <Skeleton variant="circle" className="w-16 h-16 mx-auto" />
        <Skeleton variant="title" className="h-8 w-48 mx-auto" />
        <Skeleton variant="text" className="w-64 mx-auto" />
      </div>
      <div className="space-y-4">
        <Skeleton variant="rectangle" className="h-12 w-full rounded-lg" />
        <Skeleton variant="rectangle" className="h-12 w-full rounded-lg" />
        <Skeleton variant="rectangle" className="h-12 w-full rounded-lg" />
      </div>
      <Skeleton variant="rectangle" className="h-12 w-full rounded-lg" />
    </div>
  );
}

/**
 * Skeleton para dashboard
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar skeleton */}
      <div className="w-64 bg-dark-bg-secondary border-r border-neutral-gray/10 hidden lg:block p-4 space-y-4">
        <Skeleton variant="title" className="h-8 w-40" />
        <div className="space-y-2 pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="h-10 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1">
        {/* Topbar skeleton */}
        <div className="h-16 bg-dark-bg-secondary border-b border-neutral-gray/10 px-4 flex items-center justify-between">
          <Skeleton variant="text" className="h-6 w-32" />
          <Skeleton variant="circle" className="w-10 h-10" />
        </div>
        {/* Content skeleton */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="card" className="h-40" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton específico para card de projeto
 */
export function ProjectCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('bg-dark-bg-secondary rounded-xl p-5 border border-neutral-gray/10', className)}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <Skeleton variant="text" className="h-6 w-32" />
          <Skeleton variant="text" className="h-6 w-20" />
        </div>
        {/* Service type */}
        <Skeleton variant="text" className="h-4 w-24" />
        {/* Progress bar */}
        <Skeleton variant="text" className="h-2 w-full" />
        {/* Footer */}
        <div className="flex justify-between items-center pt-3">
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton variant="text" className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para grid de projetos
 */
export function ProjectsGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </div>
  );
}
