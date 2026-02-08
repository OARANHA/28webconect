'use client';

import { useState } from 'react';
import {
  AdminClientListItem,
  AdminClientStats,
  ClientCSVData,
  AdminClientFilters,
} from '@/types/admin-client';
import { ClientTable } from '@/components/admin/ClientTable';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import Button from '@/components/ui/Button';
import { Users, UserCheck, UserX, UserPlus, Download, RefreshCw } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';

interface ClientsListClientProps {
  initialClients: AdminClientListItem[];
  initialStats: AdminClientStats;
}

/**
 * Client Component da Lista de Clientes
 * Exibe tabela com filtros e estatísticas
 * Chama API routes para operações (não importa server actions diretamente)
 */
export default function ClientsListClient({
  initialClients,
  initialStats,
}: ClientsListClientProps) {
  const [clients, setClients] = useState<AdminClientListItem[]>(initialClients);
  const [stats, setStats] = useState<AdminClientStats>(initialStats);
  const [isExporting, setIsExporting] = useState(false);

  // Exportar CSV via API route
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/admin/clients/export');
      const result = await response.json();

      if (result.success && result.data) {
        exportToCSV(result.data, 'clientes');
      } else {
        console.error('Erro ao exportar clientes:', result.error);
      }
    } catch (error) {
      console.error('Erro ao exportar clientes:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Recarregar página
  const handleRefresh = () => {
    window.location.reload();
  };

  // Aplicar filtros via API route
  const handleFilterChange = async (filters: AdminClientFilters) => {
    try {
      const params = new URLSearchParams();

      if (filters.status) params.append('status', filters.status);
      if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());

      const response = await fetch(`/api/admin/clients?${params.toString()}`);
      const result = await response.json();

      if (result.success && result.data) {
        setClients(result.data.clients);
        setStats(result.data.stats);
      } else {
        console.error('Erro ao filtrar clientes:', result.error);
      }
    } catch (error) {
      console.error('Erro ao filtrar clientes:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard title="Total de Clientes" value={stats.total} icon={Users} color="blue" />
        <MetricsCard
          title="Clientes Ativos"
          value={stats.active}
          icon={UserCheck}
          trend={{
            value: stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0,
            isPositive: true,
            label: 'do total',
          }}
          color="emerald"
        />
        <MetricsCard
          title="Clientes Inativos"
          value={stats.inactive}
          icon={UserX}
          trend={{
            value: stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0,
            isPositive: false,
            label: 'do total',
          }}
          color="red"
        />
        <MetricsCard
          title="Novos no Mês"
          value={stats.newThisMonth}
          icon={UserPlus}
          color="primary"
        />
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="border-neutral-gray/20 text-neutral-white hover:bg-dark-bg-secondary"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
        <Button
          onClick={handleExportCSV}
          disabled={isExporting || clients.length === 0}
          className="bg-accent-primary hover:bg-accent-primary/90 text-white disabled:opacity-50"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exportando...' : 'Exportar CSV'}
        </Button>
      </div>

      {/* Tabela de Clientes */}
      <ClientTable clients={clients} isLoading={false} onFilterChange={handleFilterChange} />
    </div>
  );
}
