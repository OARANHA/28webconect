import { ServicesGridSkeleton } from '@/components/ui/Skeleton';

/**
 * Loading state para página de serviços
 */
export default function ServicosLoading() {
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-neutral-gray/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="w-32 h-8 bg-dark-bg-secondary rounded animate-shimmer bg-gradient-to-r from-dark-bg-secondary via-neutral-gray/10 to-dark-bg-secondary bg-[length:200%_100%]" />
            <div className="hidden md:flex gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-16 h-4 bg-dark-bg-secondary rounded animate-shimmer bg-gradient-to-r from-dark-bg-secondary via-neutral-gray/10 to-dark-bg-secondary bg-[length:200%_100%]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-4">
            <div className="h-12 w-64 mx-auto bg-dark-bg-secondary rounded animate-shimmer bg-gradient-to-r from-dark-bg-secondary via-neutral-gray/10 to-dark-bg-secondary bg-[length:200%_100%]" />
            <div className="h-6 w-96 mx-auto bg-dark-bg-secondary rounded animate-shimmer bg-gradient-to-r from-dark-bg-secondary via-neutral-gray/10 to-dark-bg-secondary bg-[length:200%_100%]" />
          </div>
          <ServicesGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
