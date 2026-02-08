import { Metadata } from 'next';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/types';
import { getAllPricingPlans } from '@/app/actions/pricing';
import PricingList from '@/components/admin/PricingList';
import { DollarSign, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gestão de Planos de Preços | Admin',
  description: 'Gerencie os planos de preços da plataforma',
};

/**
 * Página Administrativa de Gestão de Preços
 * Server Component protegido por role (ADMIN ou SUPER_ADMIN)
 * Exibe lista de planos com drag-and-drop para reordenação
 */
export default async function AdminPricingPage() {
  // Proteção de rota - apenas admins podem acessar
  await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  // Buscar todos os planos (ativos e inativos)
  const plans = await getAllPricingPlans();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex items-center justify-center p-2 bg-accent-primary/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-accent-primary" />
          </div>
          <span className="text-sm text-accent-primary font-medium">Área Administrativa</span>
        </div>
        <h1 className="text-3xl font-bold text-neutral-white mb-2">Gestão de Planos de Preços</h1>
        <p className="text-neutral-gray">
          Gerencie os planos de preços, reordene a exibição e controle a visibilidade.
        </p>
      </div>

      {/* Alerta de Admin */}
      <div className="mb-8 p-4 bg-accent-primary/5 border border-accent-primary/20 rounded-lg flex items-start gap-3">
        <Shield className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-neutral-white">Área Restrita</h3>
          <p className="text-sm text-neutral-gray mt-1">
            Esta área é exclusiva para administradores. As alterações realizadas aqui afetam
            diretamente o que os clientes veem na página de preços.
          </p>
        </div>
      </div>

      {/* Lista de Planos com Drag-and-Drop */}
      <PricingList initialPlans={plans} />
    </div>
  );
}
