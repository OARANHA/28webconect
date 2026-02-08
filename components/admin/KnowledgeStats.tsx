'use client';

/**
 * Componente de estatísticas da base de conhecimento
 */

import { useMemo } from 'react';
import { FileText, Database, Clock, PieChart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/validations/admin-knowledge';
import type { KnowledgeStats as KnowledgeStatsType } from '@/types/admin-knowledge';

interface KnowledgeStatsProps {
  stats: KnowledgeStatsType;
}

export default function KnowledgeStats({ stats }: KnowledgeStatsProps) {
  const { totalDocs, totalSize, lastUpdate, breakdown, storagePercentage = 0 } = stats;

  const usageColorClass = useMemo(() => {
    if (storagePercentage > 95) return 'text-red-500';
    if (storagePercentage > 80) return 'text-yellow-500';
    return 'text-green-500';
  }, [storagePercentage]);

  const usageBgClass = useMemo(() => {
    if (storagePercentage > 95) return 'bg-red-500';
    if (storagePercentage > 80) return 'bg-yellow-500';
    return 'bg-green-500';
  }, [storagePercentage]);

  const timeAgo = lastUpdate
    ? formatDistanceToNow(new Date(lastUpdate), { addSuffix: true, locale: ptBR })
    : 'Nunca';

  const statCards = [
    {
      title: 'Total de Documentos',
      value: totalDocs.toString(),
      subtitle: 'de 1000',
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Tamanho Total',
      value: formatFileSize(totalSize),
      subtitle: 'de 500MB',
      icon: Database,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Última Atualização',
      value: timeAgo,
      subtitle: lastUpdate ? new Date(lastUpdate).toLocaleDateString('pt-BR') : 'Sem atualizações',
      icon: Clock,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-dark-bg-secondary rounded-lg border border-neutral-gray/10 p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-gray">{card.title}</p>
                <p className="text-2xl font-bold text-neutral-white mt-1">{card.value}</p>
                <p className="text-xs text-neutral-gray/60 mt-1">{card.subtitle}</p>
              </div>
              <div className={cn('p-3 rounded-lg', card.bgColor)}>
                <card.icon className={cn('w-5 h-5', card.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Uso de armazenamento */}
      <div className="bg-dark-bg-secondary rounded-lg border border-neutral-gray/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <PieChart className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-white">Uso de Armazenamento</p>
              <p className="text-xs text-neutral-gray">
                {formatFileSize(totalSize)} de 500MB utilizados
              </p>
            </div>
          </div>
          <span className={cn('text-sm font-medium', usageColorClass)}>{storagePercentage}%</span>
        </div>

        {/* Barra de progresso */}
        <div className="h-3 bg-dark-bg-primary rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-500', usageBgClass)}
            style={{ width: `${Math.min(100, storagePercentage)}%` }}
          />
        </div>

        {/* Alertas */}
        {storagePercentage > 95 && (
          <p className="mt-3 text-xs text-red-400 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
            Limite de armazenamento quase atingido! Exclua documentos antigos.
          </p>
        )}
        {storagePercentage > 80 && storagePercentage <= 95 && (
          <p className="mt-3 text-xs text-yellow-400 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400" />
            Armazenamento acima de 80%. Considere gerenciar documentos.
          </p>
        )}
      </div>

      {/* Breakdown por tipo */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-dark-bg-secondary rounded-lg border border-neutral-gray/10 p-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-red-400" />
            <span className="text-xs text-neutral-gray">PDFs</span>
          </div>
          <p className="text-lg font-bold text-neutral-white">{breakdown.pdf || 0}</p>
        </div>
        <div className="bg-dark-bg-secondary rounded-lg border border-neutral-gray/10 p-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-neutral-gray">DOCs</span>
          </div>
          <p className="text-lg font-bold text-neutral-white">{breakdown.doc || 0}</p>
        </div>
        <div className="bg-dark-bg-secondary rounded-lg border border-neutral-gray/10 p-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-neutral-gray">DOCXs</span>
          </div>
          <p className="text-lg font-bold text-neutral-white">{breakdown.docx || 0}</p>
        </div>
        <div className="bg-dark-bg-secondary rounded-lg border border-neutral-gray/10 p-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-neutral-gray">TXTs</span>
          </div>
          <p className="text-lg font-bold text-neutral-white">{breakdown.txt || 0}</p>
        </div>
        <div className="bg-dark-bg-secondary rounded-lg border border-neutral-gray/10 p-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-neutral-gray">MDs</span>
          </div>
          <p className="text-lg font-bold text-neutral-white">{breakdown.md || 0}</p>
        </div>
      </div>
    </div>
  );
}
