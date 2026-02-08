import { Metadata } from 'next';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/types';
import { getClients } from '@/app/actions/admin-clients';
import ClientsListClient from './ClientsListClient';
import { Users, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gestão de Clientes | Admin',
  description: 'Visualize e gerencie todos os clientes da plataforma',
};

/**
 * Página Administrativa de Gestão de Clientes
 * Server Component protegido por role (ADMIN ou SUPER_ADMIN)
 * Busca dados iniciais no servidor e passa para client component
 */
export default async function AdminClientsPage() {
  // Proteção de rota - apenas admins podem acessar
  await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  // Buscar clientes iniciais e estatísticas
  const result = await getClients();

  const initialClients = result.success && result.data ? result.data.clients : [];
  const initialStats =
    result.success && result.data
      ? result.data.stats
      : {
          total: 0,
          active: 0,
          inactive: 0,
          newThisMonth: 0,
        };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex items-center justify-center p-2 bg-accent-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-accent-primary" />
          </div>
          <span className="text-sm text-accent-primary font-medium">Área Administrativa</span>
        </div>
        <h1 className="text-3xl font-bold text-neutral-white mb-2">Gestão de Clientes</h1>
        <p className="text-neutral-gray">
          Visualize, analise e gerencie todos os clientes cadastrados na plataforma.
        </p>
      </div>

      {/* Alerta de Admin */}
      <div className="mb-8 p-4 bg-accent-primary/5 border border-accent-primary/20 rounded-lg flex items-start gap-3">
        <Shield className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-neutral-white">Gestão de Clientes</h3>
          <p className="text-sm text-neutral-gray mt-1">
            Visualize o histórico completo de cada cliente, incluindo briefings, projetos,
            comentários e arquivos. Clientes com projetos ativos não podem ser desativados.
          </p>
        </div>
      </div>

      {/* Client Component com dados iniciais */}
      <ClientsListClient initialClients={initialClients} initialStats={initialStats} />
    </div>
  );
}
