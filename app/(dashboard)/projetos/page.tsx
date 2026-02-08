import { Metadata } from 'next';
import { requireEmailVerified } from '@/lib/auth-utils';
import { getProjectsByUserId } from '@/app/actions/projects';
import ProjectsListClient from './ProjectsListClient';

export const metadata: Metadata = {
  title: 'Meus Projetos | 28Web Connect',
  description: 'Gerencie e acompanhe todos os seus projetos',
};

/**
 * Página de listagem de projetos - Server Component
 * Busca os projetos e renderiza o client component com filtros
 */
export default async function ProjectsPage() {
  const session = await requireEmailVerified();

  const response = await getProjectsByUserId(session.user.id);

  const projects = response.success ? response.data || [] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-white">Meus Projetos</h1>
        <p className="text-neutral-gray mt-1">
          Acompanhe o progresso e gerencie todos os seus projetos
        </p>
      </div>

      {/* Client Component com filtros e listagem */}
      <ProjectsListClient projects={projects} />
    </div>
  );
}
