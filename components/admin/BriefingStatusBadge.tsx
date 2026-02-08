'use client';

import { BriefingStatus } from '@prisma/client';
import { getStatusColor, getStatusLabel, getStatusIconName } from '@/lib/briefing-utils';
import { FileEdit, Send, Clock, CheckCircle, XCircle, LucideIcon } from 'lucide-react';

interface BriefingStatusBadgeProps {
  status: BriefingStatus;
  className?: string;
  showIcon?: boolean;
}

// Mapeamento de ícones por nome
const iconMap: Record<string, LucideIcon> = {
  FileEdit,
  Send,
  Clock,
  CheckCircle,
  XCircle,
};

/**
 * Componente Badge para exibir status de briefing
 * Mostra cor, ícone e label apropriados para cada status
 */
export default function BriefingStatusBadge({
  status,
  className = '',
  showIcon = true,
}: BriefingStatusBadgeProps) {
  const colorClasses = getStatusColor(status);
  const label = getStatusLabel(status);
  const iconName = getStatusIconName(status);
  const Icon = iconMap[iconName];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1 rounded-full
        text-xs font-medium
        border
        ${colorClasses}
        ${className}
      `}
      title={getStatusDescription(status)}
    >
      {showIcon && Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
}

/**
 * Retorna descrição do status para tooltip
 */
function getStatusDescription(status: BriefingStatus): string {
  const descriptions: Record<BriefingStatus, string> = {
    RASCUNHO: 'Briefing em edição, ainda não enviado',
    ENVIADO: 'Briefing enviado pelo cliente, aguardando análise',
    EM_ANALISE: 'Briefing sendo analisado pela equipe',
    APROVADO: 'Briefing aprovado e projeto criado',
    REJEITADO: 'Briefing rejeitado, ver motivo na descrição',
  };
  return descriptions[status];
}
