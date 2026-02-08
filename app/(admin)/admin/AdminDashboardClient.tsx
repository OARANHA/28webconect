'use client';

import { useState } from 'react';
import { AdminMetrics } from '@/types/admin-client';
import { formatCurrency } from '@/lib/utils';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { LeadsChart, ConversionChart, ProjectsChart } from '@/components/admin/AdminCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-shadcn';
import Button from '@/components/ui/Button';
import { Users, TrendingUp, FolderKanban, DollarSign, RefreshCw, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';

interface AdminDashboardClientProps {
  initialMetrics: AdminMetrics;
}

/**
 * Client Component do Dashboard Administrativo
 * Exibe métricas e gráficos interativos
 * Chama API routes para atualização de dados (não importa server actions diretamente)
 */
export default function AdminDashboardClient({ initialMetrics }: AdminDashboardClientProps) {
  const [metrics, setMetrics] = useState<AdminMetrics>(initialMetrics);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Atualizar métricas via API route
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin/metrics');
      const result = await response.json();

      if (result.success && result.data) {
        setMetrics(result.data);
      } else {
        console.error('Erro ao atualizar métricas:', result.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Exportar relatório simplificado
  const handleExport = () => {
    const reportData = [
      {
        métrica: 'Leads do Mês',
        valor: metrics.leads.current,
        variação: `${metrics.leads.variation > 0 ? '+' : ''}${metrics.leads.variation}%`,
      },
      {
        métrica: 'Taxa de Conversão',
        valor: `${metrics.conversions.current}%`,
        variação: `${metrics.conversions.variation > 0 ? '+' : ''}${metrics.conversions.variation}%`,
      },
      {
        métrica: 'Projetos Ativos',
        valor: metrics.activeProjects.current,
        variação: `${metrics.activeProjects.variation > 0 ? '+' : ''}${metrics.activeProjects.variation}%`,
      },
      {
        métrica: 'Receita Estimada',
        valor: formatCurrency(metrics.estimatedRevenue.current),
        variação: `${metrics.estimatedRevenue.variation > 0 ? '+' : ''}${metrics.estimatedRevenue.variation}%`,
      },
    ];

    exportToCSV(reportData, 'relatorio-dashboard');
  };

  return (
    <div className="space-y-8">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Leads do Mês"
          value={metrics.leads.current}
          icon={Users}
          trend={{
            value: Math.abs(metrics.leads.variation),
            isPositive: metrics.leads.variation >= 0,
            label: 'vs mês anterior',
          }}
          color="blue"
        />
        <MetricsCard
          title="Taxa de Conversão"
          value={`${metrics.conversions.current}%`}
          icon={TrendingUp}
          trend={{
            value: Math.abs(metrics.conversions.variation),
            isPositive: metrics.conversions.variation >= 0,
            label: 'vs mês anterior',
          }}
          color="emerald"
        />
        <MetricsCard
          title="Projetos Ativos"
          value={metrics.activeProjects.current}
          icon={FolderKanban}
          trend={{
            value: Math.abs(metrics.activeProjects.variation),
            isPositive: metrics.activeProjects.variation >= 0,
            label: 'vs mês anterior',
          }}
          color="primary"
        />
        <MetricsCard
          title="Receita Estimada"
          value={formatCurrency(metrics.estimatedRevenue.current)}
          icon={DollarSign}
          trend={{
            value: Math.abs(metrics.estimatedRevenue.variation),
            isPositive: metrics.estimatedRevenue.variation >= 0,
            label: 'vs mês anterior',
          }}
          color="yellow"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Leads por Mês */}
        <Card className="bg-dark-bg-secondary border-neutral-gray/10">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-white">Leads por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadsChart data={metrics.leadsByMonth} />
          </CardContent>
        </Card>

        {/* Gráfico de Conversão por Serviço */}
        <Card className="bg-dark-bg-secondary border-neutral-gray/10">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-white">Conversão por Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <ConversionChart data={metrics.conversionByService} />
          </CardContent>
        </Card>

        {/* Gráfico de Projetos por Status */}
        <Card className="bg-dark-bg-secondary border-neutral-gray/10 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-white">
              Distribuição de Projetos por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl mx-auto">
              <ProjectsChart data={metrics.projectsByStatus} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="border-neutral-gray/20 text-neutral-white hover:bg-dark-bg-secondary"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </Button>
        <Button
          onClick={handleExport}
          className="bg-accent-primary hover:bg-accent-primary/90 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>
    </div>
  );
}
