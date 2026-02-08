import { ProjectMilestone, ProjectStatus } from '@prisma/client';
import { CheckCircle2, Circle, LucideIcon } from 'lucide-react';

export const DEFAULT_MILESTONES_COUNT = 4;

/**
 * Calcula o progresso do projeto baseado nas milestones concluídas
 * Regra: 4 marcos padrão = 25% cada
 * @param milestones Array de milestones do projeto
 * @returns Percentual de progresso (0-100)
 */
export function calculateProgress(milestones: ProjectMilestone[]): number {
  if (!milestones || milestones.length === 0) return 0;

  const completedCount = milestones.filter((m) => m.completed).length;
  const progress = (completedCount / DEFAULT_MILESTONES_COUNT) * 100;
  return Math.round(Math.min(Math.max(progress, 0), 100));
}

/**
 * Retorna as classes Tailwind para a cor do status do projeto
 * @param status Status do projeto
 * @returns Classes CSS para background e texto
 */
export function getProjectStatusColor(status: ProjectStatus): string {
  const colorMap: Record<ProjectStatus, string> = {
    AGUARDANDO_APROVACAO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ATIVO: 'bg-green-500/20 text-green-400 border-green-500/30',
    PAUSADO: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    CONCLUIDO: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    CANCELADO: 'bg-red-500/20 text-red-400 border-red-500/30',
    ARQUIVADO: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
  };

  return colorMap[status] || 'bg-neutral-500/20 text-neutral-400';
}

/**
 * Retorna o label em português para o status do projeto
 * @param status Status do projeto
 * @returns Label traduzido
 */
export function getProjectStatusLabel(status: ProjectStatus): string {
  const labelMap: Record<ProjectStatus, string> = {
    AGUARDANDO_APROVACAO: 'Aguardando Aprovação',
    ATIVO: 'Ativo',
    PAUSADO: 'Pausado',
    CONCLUIDO: 'Concluído',
    CANCELADO: 'Cancelado',
    ARQUIVADO: 'Arquivado',
  };

  return labelMap[status] || status;
}

/**
 * Retorna o ícone apropriado para o estado da milestone
 * @param completed Se a milestone está concluída
 * @returns Componente de ícone do Lucide
 */
export function getMilestoneIcon(completed: boolean): LucideIcon {
  return completed ? CheckCircle2 : Circle;
}

/**
 * Retorna a cor do ícone da milestone baseada no estado
 * @param completed Se a milestone está concluída
 * @returns Classes CSS para cor do ícone
 */
export function getMilestoneIconColor(completed: boolean): string {
  return completed ? 'text-emerald-400' : 'text-neutral-gray';
}
