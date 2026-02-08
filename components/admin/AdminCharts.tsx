'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { LeadsByMonth, ConversionByService, ProjectsByStatus } from '@/types/admin-client';
import { ProjectStatus } from '@prisma/client';

interface LeadsChartProps {
  data: LeadsByMonth[];
}

/**
 * Gráfico de linha para leads por mês
 */
export function LeadsChart({ data }: LeadsChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
            }}
            itemStyle={{ color: '#ff6b35' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#ff6b35"
            strokeWidth={3}
            dot={{ fill: '#ff6b35', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#ff6b35', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ConversionChartProps {
  data: ConversionByService[];
}

/**
 * Gráfico de barras para conversão por serviço
 */
export function ConversionChart({ data }: ConversionChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="serviceType"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any, props: any) => {
              if (name === 'briefings') {
                return [`${value}`, 'Total de Briefings'];
              }
              if (name === 'aprovados') {
                const taxa = props?.payload?.taxa?.toFixed(1) || '0';
                return [`${value} (${taxa}%)`, 'Aprovados'];
              }
              return [value, name];
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend
            wrapperStyle={{ color: '#94a3b8' }}
            formatter={(value) => {
              if (value === 'briefings') return 'Total de Briefings';
              if (value === 'aprovados') return 'Aprovados';
              return value;
            }}
          />
          <Bar dataKey="briefings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="aprovados" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ProjectsChartProps {
  data: ProjectsByStatus[];
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.ATIVO]: '#10b981',
  [ProjectStatus.CONCLUIDO]: '#3b82f6',
  [ProjectStatus.PAUSADO]: '#f59e0b',
  [ProjectStatus.CANCELADO]: '#ef4444',
  [ProjectStatus.ARQUIVADO]: '#6b7280',
  [ProjectStatus.AGUARDANDO_APROVACAO]: '#8b5cf6',
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.ATIVO]: 'Ativo',
  [ProjectStatus.CONCLUIDO]: 'Concluído',
  [ProjectStatus.PAUSADO]: 'Pausado',
  [ProjectStatus.CANCELADO]: 'Cancelado',
  [ProjectStatus.ARQUIVADO]: 'Arquivado',
  [ProjectStatus.AGUARDANDO_APROVACAO]: 'Aguardando Aprovação',
};

/**
 * Gráfico de pizza para projetos por status
 */
export function ProjectsChart({ data }: ProjectsChartProps) {
  const chartData = data.map((item) => ({
    name: STATUS_LABELS[item.status],
    value: item.count,
    color: STATUS_COLORS[item.status],
  }));

  const total = chartData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label={(props: any) => {
              const percent = props?.percent || 0;
              if (percent < 0.05) return null;
              return `${(percent * 100).toFixed(0)}%`;
            }}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => {
              const percent = total > 0 ? (((value as number) / total) * 100).toFixed(1) : '0';
              return [`${value} (${percent}%)`, name];
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ color: '#94a3b8' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, entry: any) => {
              const count = entry?.payload?.value || 0;
              return `${value}: ${count}`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
