import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/types';
import { getProjectByIdAdmin } from '@/app/actions/admin-projects';
import ProjectEditorClient from './ProjectEditorClient';
import { FolderKanban } from 'lucide-react';

interface ProjectEditPageProps {
  params: {
    id: string;
  };
}

/**
 * Gera metadata dinâmica para a página
 */
export async function generateMetadata({ params }: ProjectEditPageProps): Promise<Metadata> {
  const result = await getProjectByIdAdmin(params.id);

  if (result.success && result.data) {
    return {
      title: `Projeto - ${result.data.name} | Admin`,
      description: `Gerenciar projeto ${result.data.name}`,
    };
  }

  return {
    title: 'Projeto não encontrado | Admin',
    description: 'Projeto não encontrado',
  };
}

/**
 * Página de Edição de Projeto Admin
 * Server Component protegido por role
 * Busca dados do projeto e passa para client component
 */
export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
  // Proteção de rota - apenas admins podem acessar
  await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  // Buscar projeto
  const result = await getProjectByIdAdmin(params.id);

  // Se não encontrar, retorna 404
  if (!result.success || !result.data) {
    notFound();
  }

  const project = result.data;

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
        <h1 className="text-3xl font-bold text-neutral-white mb-2">Editar Projeto</h1>
        <p className="text-neutral-gray">
          Gerencie milestones, status e adicione notas ao projeto.
        </p>
      </div>

      {/* Client Component com dados do projeto */}
      <ProjectEditorClient project={project} />
    </div>
  );
}
