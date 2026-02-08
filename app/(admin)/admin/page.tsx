import { Metadata } from 'next';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/types';
import { getMetrics } from '@/app/actions/admin-clients';
import AdminDashboardClient from './AdminDashboardClient';
import { LayoutDashboard, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard Admin | 28Web Connect',
  description: 'Visão geral de métricas e estatísticas',
};

/**
 * Página Administrativa de Dashboard
 * Server Component protegido por role (ADMIN ou SUPER_ADMIN)
 * Busca dados iniciais no servidor e passa para client component
 */
export default async function AdminDashboardPage() {
  // Proteção de rota - apenas admins podem acessar
  await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  // Buscar métricas iniciais
  const result = await getMetrics();

  const initialMetrics =
    result.success && result.data
      ? result.data
      : {
          leads: { current: 0, previous: 0, variation: 0 },
          conversions: { current: 0, previous: 0, variation: 0 },
          activeProjects: { current: 0, previous: 0, variation: 0 },
          estimatedRevenue: { current: 0, previous: 0, variation: 0 },
          leadsByMonth: [],
          conversionByService: [],
          projectsByStatus: [],
        };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex items-center justify-center p-2 bg-accent-primary/10 rounded-lg">
            <LayoutDashboard className="w-5 h-5 text-accent-primary" />
          </div>
          <span className="text-sm text-accent-primary font-medium">Área Administrativa</span>
        </div>
        <h1 className="text-3xl font-bold text-neutral-white mb-2">Dashboard Administrativo</h1>
        <p className="text-neutral-gray">
          Visão geral de métricas, leads, conversões e estatísticas da plataforma.
        </p>
      </div>

      {/* Alerta de Admin */}
      <div className="mb-8 p-4 bg-accent-primary/5 border border-accent-primary/20 rounded-lg flex items-start gap-3">
        <Shield className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-neutral-white">Métricas em Tempo Real</h3>
          <p className="text-sm text-neutral-gray mt-1">
            Os dados são atualizados automaticamente. As variações mostram a comparação com o mês
            anterior.
          </p>
        </div>
      </div>

      {/* Client Component com dados iniciais */}
      <AdminDashboardClient initialMetrics={initialMetrics} />
    </div>
  );
}
