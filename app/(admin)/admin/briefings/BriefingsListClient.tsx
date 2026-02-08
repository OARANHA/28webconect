'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { BriefingListItem, BriefingStats } from '@/types/admin-briefing';
import { getAllBriefings } from '@/app/actions/admin-briefings';
import BriefingTable from '@/components/admin/BriefingTable';

interface BriefingsListClientProps {
  initialBriefings: BriefingListItem[];
  initialStats: BriefingStats;
}

/**
 * Client Component para listagem de briefings
 * Gerencia estado de filtros, cache com react-query e auto-refresh
 */
export default function BriefingsListClient({
  initialBriefings,
  initialStats,
}: BriefingsListClientProps) {
  const [filters, setFilters] = useState({});

  // Query com react-query para cache e refetch
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-briefings', filters],
    queryFn: async () => {
      const result = await getAllBriefings(filters);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Erro ao buscar briefings');
    },
    initialData: {
      briefings: initialBriefings,
      stats: initialStats,
    },
    refetchInterval: 30000, // Auto-refresh a cada 30 segundos
    staleTime: 10000, // Considerar stale após 10 segundos
  });

  const { briefings, stats } = data;

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total" value={stats.total} icon={FileText} color="neutral" />
        <StatCard title="Rascunhos" value={stats.rascunhos} icon={AlertCircle} color="gray" />
        <StatCard title="Enviados" value={stats.enviados} icon={FileText} color="blue" />
        <StatCard title="Em Análise" value={stats.emAnalise} icon={Clock} color="yellow" />
        <StatCard title="Aprovados" value={stats.aprovados} icon={CheckCircle} color="green" />
        <StatCard title="Rejeitados" value={stats.rejeitados} icon={XCircle} color="red" />
      </div>

      {/* Tabela com filtros */}
      <div className="bg-dark-bg-secondary rounded-xl border border-neutral-gray/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-white">Lista de Briefings</h2>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-light hover:text-neutral-white bg-dark-bg border border-neutral-gray/20 rounded-lg hover:bg-neutral-gray/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>

        <BriefingTable briefings={briefings} isLoading={isLoading} />
      </div>

      {/* Info de auto-refresh */}
      <p className="text-xs text-neutral-gray text-center">
        A lista é atualizada automaticamente a cada 30 segundos.
      </p>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'neutral' | 'gray' | 'blue' | 'yellow' | 'green' | 'red';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    neutral: 'bg-neutral-white/10 text-neutral-white border-neutral-white/20',
    gray: 'bg-neutral-gray/10 text-neutral-gray border-neutral-gray/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{title}</span>
        <Icon className="w-4 h-4 opacity-60" />
      </div>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}
