import { Metadata } from 'next';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/types';
import { getAllBriefings } from '@/app/actions/admin-briefings';
import BriefingsListClient from './BriefingsListClient';
import { FileText, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gestão de Briefings | Admin',
  description: 'Gerencie briefings de clientes',
};

/**
 * Página Administrativa de Gestão de Briefings
 * Server Component protegido por role (ADMIN ou SUPER_ADMIN)
 * Busca dados iniciais no servidor e passa para client component
 */
export default async function AdminBriefingsPage() {
  // Proteção de rota - apenas admins podem acessar
  await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  // Buscar briefings iniciais e estatísticas
  const result = await getAllBriefings();

  const initialBriefings = result.success && result.data ? result.data.briefings : [];
  const initialStats =
    result.success && result.data
      ? result.data.stats
      : {
          total: 0,
          enviados: 0,
          emAnalise: 0,
          aprovados: 0,
          rejeitados: 0,
          rascunhos: 0,
        };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex items-center justify-center p-2 bg-accent-primary/10 rounded-lg">
            <FileText className="w-5 h-5 text-accent-primary" />
          </div>
          <span className="text-sm text-accent-primary font-medium">Área Administrativa</span>
        </div>
        <h1 className="text-3xl font-bold text-neutral-white mb-2">Gestão de Briefings</h1>
        <p className="text-neutral-gray">
          Visualize, analise e gerencie todos os briefings enviados pelos clientes.
        </p>
      </div>

      {/* Alerta de Admin */}
      <div className="mb-8 p-4 bg-accent-primary/5 border border-accent-primary/20 rounded-lg flex items-start gap-3">
        <Shield className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-neutral-white">Fluxo de Aprovação</h3>
          <p className="text-sm text-neutral-gray mt-1">
            Briefings enviados podem ser aprovados (cria projeto automaticamente) ou rejeitados
            (cliente é notificado). Briefings aprovados não podem ser modificados.
          </p>
        </div>
      </div>

      {/* Client Component com dados iniciais */}
      <BriefingsListClient initialBriefings={initialBriefings} initialStats={initialStats} />
    </div>
  );
}
