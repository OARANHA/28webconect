import { Metadata } from 'next';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/types';
import { getAllProjects } from '@/app/actions/admin-projects';
import ProjectsListClient from './ProjectsListClient';
import { FolderKanban, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gestão de Projetos | Admin',
  description: 'Gerencie projetos de clientes',
};

/**
 * Página Administrativa de Gestão de Projetos
 * Server Component protegido por role (ADMIN ou SUPER_ADMIN)
 * Busca dados iniciais no servidor e passa para client component
 */
export default async function AdminProjectsPage() {
  // Proteção de rota - apenas admins podem acessar
  await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  // Buscar projetos iniciais e estatísticas
  const result = await getAllProjects();

  const initialProjects = result.success && result.data ? result.data.projects : [];
  const initialStats =
    result.success && result.data
      ? result.data.stats
      : {
          total: 0,
          ativos: 0,
          concluidos: 0,
          pausados: 0,
          cancelados: 0,
          arquivados: 0,
        };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex items-center justify-center p-2 bg-accent-primary/10 rounded-lg">
            <FolderKanban className="w-5 h-5 text-accent-primary" />
          </div>
          <span className="text-sm text-accent-primary font-medium">Área Administrativa</span>
        </div>
        <h1 className="text-3xl font-bold text-neutral-white mb-2">Gestão de Projetos</h1>
        <p className="text-neutral-gray">
          Visualize, gerencie e acompanhe o progresso de todos os projetos dos clientes.
        </p>
      </div>

      {/* Alerta de Admin */}
      <div className="mb-8 p-4 bg-accent-primary/5 border border-accent-primary/20 rounded-lg flex items-start gap-3">
        <Shield className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-neutral-white">Gestão de Milestones</h3>
          <p className="text-sm text-neutral-gray mt-1">
            Você pode marcar milestones como concluídas, alterar status dos projetos e adicionar
            notas. Os clientes são notificados automaticamente sobre atualizações importantes.
          </p>
        </div>
      </div>

      {/* Client Component com dados iniciais */}
      <ProjectsListClient initialProjects={initialProjects} initialStats={initialStats} />
    </div>
  );
}
