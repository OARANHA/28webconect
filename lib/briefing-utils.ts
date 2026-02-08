import { BriefingStatus, ServiceType, Briefing } from '@prisma/client';

/**
 * Mapeia ServiceType para labels amigáveis em português
 */
export function getServiceTypeLabel(serviceType: ServiceType): string {
  const labels: Record<ServiceType, string> = {
    ERP_BASICO: 'ERP Cloud Básico',
    ERP_ECOMMERCE: 'ERP + E-commerce + Marketplace',
    ERP_PREMIUM: 'ERP Premium + Marketplace',
    LANDING_IA: 'Landing Page + Agente IA',
    LANDING_IA_WHATSAPP: 'Landing Page + IA + WhatsApp',
  };
  return labels[serviceType] || serviceType;
}

/**
 * Retorna classes Tailwind para cores de badges baseado no status
 */
export function getStatusColor(status: BriefingStatus): string {
  const colors: Record<BriefingStatus, string> = {
    RASCUNHO: 'bg-neutral-gray/20 text-neutral-gray border-neutral-gray/30',
    ENVIADO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    EM_ANALISE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    APROVADO: 'bg-green-500/20 text-green-400 border-green-500/30',
    REJEITADO: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[status];
}

/**
 * Mapeia BriefingStatus para labels em português
 */
export function getStatusLabel(status: BriefingStatus): string {
  const labels: Record<BriefingStatus, string> = {
    RASCUNHO: 'Rascunho',
    ENVIADO: 'Enviado',
    EM_ANALISE: 'Em Análise',
    APROVADO: 'Aprovado',
    REJEITADO: 'Rejeitado',
  };
  return labels[status];
}

/**
 * Formata data para exibição em português com hora
 */
export function formatBriefingDate(date: Date | string | null): string {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Verifica se um briefing pode ser aprovado
 * Apenas briefings em status ENVIADO ou EM_ANALISE podem ser aprovados
 */
export function canApproveBriefing(briefing: Briefing): boolean {
  return briefing.status === 'ENVIADO' || briefing.status === 'EM_ANALISE';
}

/**
 * Verifica se um briefing pode ser rejeitado
 * Apenas briefings em status ENVIADO ou EM_ANALISE podem ser rejeitados
 */
export function canRejectBriefing(briefing: Briefing): boolean {
  return briefing.status === 'ENVIADO' || briefing.status === 'EM_ANALISE';
}

/**
 * Verifica se um briefing pode ser marcado como em análise
 * Apenas briefings em status ENVIADO podem ser marcados como em análise
 */
export function canMarkAsInAnalysis(briefing: Briefing): boolean {
  return briefing.status === 'ENVIADO';
}

/**
 * Retorna ícone Lucide apropriado para cada status
 */
export function getStatusIconName(status: BriefingStatus): string {
  const icons: Record<BriefingStatus, string> = {
    RASCUNHO: 'FileEdit',
    ENVIADO: 'Send',
    EM_ANALISE: 'Clock',
    APROVADO: 'CheckCircle',
    REJEITADO: 'XCircle',
  };
  return icons[status];
}

/**
 * Retorna uma descrição amigável para o status
 */
export function getStatusDescription(status: BriefingStatus): string {
  const descriptions: Record<BriefingStatus, string> = {
    RASCUNHO: 'Briefing em edição, ainda não enviado',
    ENVIADO: 'Briefing enviado pelo cliente, aguardando análise',
    EM_ANALISE: 'Briefing sendo analisado pela equipe',
    APROVADO: 'Briefing aprovado e projeto criado',
    REJEITADO: 'Briefing rejeitado, ver motivo na descrição',
  };
  return descriptions[status];
}
