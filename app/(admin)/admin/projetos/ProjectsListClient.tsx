'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, FolderKanban, PlayCircle, CheckCircle, PauseCircle } from 'lucide-react';
import { AdminProjectListItem, AdminProjectStats } from '@/types/admin-project';
import { fetchAdminProjects } from '@/lib/api/admin-projects';
import ProjectTable from '@/components/admin/ProjectTable';
import MetricsCard from '@/components/admin/MetricsCard';

interface ProjectsListClientProps {
  initialProjects: AdminProjectListItem[];
  initialStats: AdminProjectStats;
}

/**
 * Client Component para listagem de projetos
 * Gerencia estado de filtros, cache com react-query e auto-refresh
 * Usa API routes em vez de server actions diretas
 */
export default function ProjectsListClient({
  initialProjects,
  initialStats,
}: ProjectsListClientProps) {
  const [filters, setFilters] = useState({});

  // Query com react-query para cache e refetch
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-projects', filters],
    queryFn: async () => {
      return await fetchAdminProjects(filters);
    },
    initialData: {
      projects: initialProjects,
      stats: initialStats,
    },
    refetchInterval: 30000, // Auto-refresh a cada 30 segundos
    staleTime: 10000, // Considerar stale após 10 segundos
  });

  const { projects, stats } = data;

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricsCard title="Total" value={stats.total} icon={FolderKanban} color="primary" />
        <MetricsCard title="Ativos" value={stats.ativos} icon={PlayCircle} color="emerald" />
        <MetricsCard title="Concluídos" value={stats.concluidos} icon={CheckCircle} color="blue" />
        <MetricsCard title="Pausados" value={stats.pausados} icon={PauseCircle} color="yellow" />
        <MetricsCard title="Cancelados" value={stats.cancelados} icon={PauseCircle} color="red" />
      </div>

      {/* Tabela com filtros */}
      <div className="bg-dark-bg-secondary rounded-xl border border-neutral-gray/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-white">Lista de Projetos</h2>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-light hover:text-neutral-white bg-dark-bg border border-neutral-gray/20 rounded-lg hover:bg-neutral-gray/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>

        <ProjectTable projects={projects} isLoading={isLoading} />
      </div>

      {/* Info de auto-refresh */}
      <p className="text-xs text-neutral-gray text-center">
        A lista é atualizada automaticamente a cada 30 segundos.
      </p>
    </div>
  );
}
