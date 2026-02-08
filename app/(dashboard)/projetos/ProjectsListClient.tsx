'use client';

import { useState, useMemo } from 'react';
import { ProjectListItem, ProjectFilter } from '@/types/project';
import { ProjectStatus } from '@prisma/client';
import ProjectCard from '@/components/project/ProjectCard';
import EmptyState from '@/components/dashboard/EmptyState';
import { cn } from '@/lib/utils';
import { FolderKanban, CheckCircle, Archive, Layers, Rocket, Plus } from 'lucide-react';
import Link from 'next/link';

interface ProjectsListClientProps {
  projects: ProjectListItem[];
}

interface FilterTab {
  id: ProjectFilter;
  label: string;
  icon: React.ReactNode;
  statuses: ProjectStatus[];
}

const filterTabs: FilterTab[] = [
  {
    id: 'active',
    label: 'Ativos',
    icon: <FolderKanban className="w-4 h-4" />,
    statuses: [ProjectStatus.ATIVO, ProjectStatus.AGUARDANDO_APROVACAO, ProjectStatus.PAUSADO],
  },
  {
    id: 'completed',
    label: 'Concluídos',
    icon: <CheckCircle className="w-4 h-4" />,
    statuses: [ProjectStatus.CONCLUIDO],
  },
  {
    id: 'archived',
    label: 'Arquivados',
    icon: <Archive className="w-4 h-4" />,
    statuses: [ProjectStatus.ARQUIVADO, ProjectStatus.CANCELADO],
  },
  {
    id: 'all',
    label: 'Todos',
    icon: <Layers className="w-4 h-4" />,
    statuses: Object.values(ProjectStatus),
  },
];

/**
 * Client Component para filtros e listagem de projetos
 */
export default function ProjectsListClient({ projects }: ProjectsListClientProps) {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>('active');

  // Filtrar projetos baseado no filtro ativo
  const filteredProjects = useMemo(() => {
    const activeTab = filterTabs.find((tab) => tab.id === activeFilter);
    if (!activeTab) return projects;

    return projects.filter((project) => activeTab.statuses.includes(project.status));
  }, [projects, activeFilter]);

  // Contar projetos por filtro
  const counts = useMemo(() => {
    const counts: Record<ProjectFilter, number> = {
      active: 0,
      completed: 0,
      archived: 0,
      all: projects.length,
    };

    projects.forEach((project) => {
      if (filterTabs[0].statuses.includes(project.status)) counts.active++;
      if (filterTabs[1].statuses.includes(project.status)) counts.completed++;
      if (filterTabs[2].statuses.includes(project.status)) counts.archived++;
    });

    return counts;
  }, [projects]);

  // Mensagem de empty state baseada no filtro
  const getEmptyStateMessage = () => {
    switch (activeFilter) {
      case 'active':
        return {
          title: 'Nenhum projeto ativo',
          description:
            'Você não tem projetos ativos no momento. Envie um briefing para iniciar um novo projeto.',
        };
      case 'completed':
        return {
          title: 'Nenhum projeto concluído',
          description:
            'Você ainda não tem projetos concluídos. Acompanhe seus projetos ativos para vê-los aqui em breve.',
        };
      case 'archived':
        return {
          title: 'Nenhum projeto arquivado',
          description: 'Você não tem projetos arquivados ou cancelados.',
        };
      default:
        return {
          title: 'Nenhum projeto encontrado',
          description:
            'Você ainda não tem projetos. Envie um briefing para iniciar seu primeiro projeto.',
        };
    }
  };

  const emptyState = getEmptyStateMessage();

  return (
    <div className="space-y-6">
      {/* Tabs de filtro */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              'border hover:border-accent-primary/50',
              activeFilter === tab.id
                ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                : 'bg-dark-bg-secondary border-neutral-gray/20 text-neutral-gray hover:text-neutral-white'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span
              className={cn(
                'ml-1 px-1.5 py-0.5 rounded-full text-xs',
                activeFilter === tab.id
                  ? 'bg-accent-primary/30 text-accent-primary'
                  : 'bg-neutral-gray/20 text-neutral-gray'
              )}
            >
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Grid de projetos ou Empty State */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} variant="default" />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Rocket className="w-full h-full" />}
          title={emptyState.title}
          description={emptyState.description}
          actionLabel="Enviar Briefing"
          actionHref="/briefing"
        />
      )}

      {/* Link para novo briefing quando há projetos */}
      {projects.length > 0 && (
        <div className="flex justify-center pt-4">
          <Link
            href="/briefing"
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-lg',
              'bg-accent-primary text-white font-medium',
              'hover:bg-accent-secondary transition-colors'
            )}
          >
            <Plus className="w-4 h-4" />
            Novo Projeto
          </Link>
        </div>
      )}
    </div>
  );
}
