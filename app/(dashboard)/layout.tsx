'use client';

import { useState } from 'react';
import { requireEmailVerified } from '@/lib/auth-utils';
import { Metadata } from 'next';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Skeleton from '@/components/ui/Skeleton';

// Dynamic imports com suspense para componentes client-side
const Sidebar = dynamic(() => import('@/components/dashboard/Sidebar'), {
  suspense: true,
});

const Topbar = dynamic(() => import('@/components/dashboard/Topbar'), {
  suspense: true,
});

// export const metadata: Metadata = {
//   title: 'Dashboard | 28Web Connect',
//   description: 'Gerencie seus projetos e acompanhe o progresso',
// };

/**
 * Sidebar skeleton para Suspense fallback
 */
function SidebarSkeleton() {
  return (
    <aside className="hidden md:flex w-64 bg-dark-bg-secondary border-r border-neutral-gray/10 flex-col shrink-0">
      <div className="p-4 border-b border-neutral-gray/10">
        <Skeleton variant="title" className="h-10 w-32" />
      </div>
      <div className="flex-1 p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-12 w-full" />
        ))}
      </div>
    </aside>
  );
}

/**
 * Topbar skeleton para Suspense fallback
 */
function TopbarSkeleton() {
  return (
    <header className="h-16 bg-dark-bg-secondary border-b border-neutral-gray/10 flex items-center justify-between px-4">
      <Skeleton variant="text" className="h-6 w-32" />
      <Skeleton variant="circle" className="w-10 h-10" />
    </header>
  );
}

/**
 * Layout do Dashboard - Client Component
 * Gerencia estado do menu mobile unificado
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen bg-dark-bg">
      {/* Sidebar - Lazy loaded */}
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar isMobileOpen={isMobileMenuOpen} onMobileClose={closeMobileMenu} />
      </Suspense>

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar - Lazy loaded */}
        <Suspense fallback={<TopbarSkeleton />}>
          <Topbar isMobileMenuOpen={isMobileMenuOpen} onMobileMenuToggle={toggleMobileMenu} />
        </Suspense>

        {/* Conteúdo da página */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
