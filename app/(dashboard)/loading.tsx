import Skeleton from '@/components/ui/Skeleton';

/**
 * Loading state para páginas do dashboard
 * Renderiza skeletons do topbar, sidebar e cards
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar skeleton - hidden on mobile */}
      <aside className="hidden md:flex w-64 bg-dark-bg-secondary border-r border-neutral-gray/10 flex-col shrink-0">
        {/* Logo area */}
        <div className="p-4 border-b border-neutral-gray/10">
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" className="w-10 h-10" />
            <Skeleton variant="title" className="h-6 w-32" />
          </div>
        </div>
        {/* Nav items */}
        <div className="flex-1 p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="h-12 w-full" />
          ))}
        </div>
        {/* Logout button */}
        <div className="p-4 border-t border-neutral-gray/10">
          <Skeleton variant="text" className="h-12 w-full" />
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar skeleton */}
        <header className="h-16 bg-dark-bg-secondary border-b border-neutral-gray/10 flex items-center justify-between px-4 md:px-6">
          <Skeleton variant="text" className="h-6 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" className="w-10 h-10" />
            <Skeleton variant="circle" className="w-9 h-9" />
          </div>
        </header>

        {/* Content skeleton */}
        <main className="flex-1 p-4 md:p-6 space-y-6">
          {/* Welcome text */}
          <div className="space-y-2">
            <Skeleton variant="title" className="h-8 w-64" />
            <Skeleton variant="text" className="h-5 w-96" />
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="card" className="h-28" />
            ))}
          </div>

          {/* Empty state placeholder */}
          <Skeleton variant="card" className="h-80" />
        </main>
      </div>
    </div>
  );
}
