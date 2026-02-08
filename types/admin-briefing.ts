import { Briefing, BriefingStatus, ServiceType, Project } from '@prisma/client';

/**
 * Item de briefing para listagem (dados simplificados)
 */
export interface BriefingListItem {
  id: string;
  serviceType: ServiceType;
  companyName: string;
  status: BriefingStatus;
  createdAt: Date;
  submittedAt: Date | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    company: string | null;
  };
  project?: {
    id: string;
    name: string;
  } | null;
}

/**
 * Briefing com todas as relações para visualização detalhada
 */
export interface BriefingWithRelations extends Briefing {
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    company: string | null;
  };
  project?: Project | null;
}

/**
 * Filtros para listagem de briefings
 */
export interface BriefingFilters {
  status?: BriefingStatus;
  serviceType?: ServiceType;
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Estatísticas de briefings para dashboard
 */
export interface BriefingStats {
  total: number;
  enviados: number;
  emAnalise: number;
  aprovados: number;
  rejeitados: number;
  rascunhos: number;
}

/**
 * Resposta padrão para actions de briefing
 */
export interface BriefingActionResponse<T = unknown> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

/**
 * Dados para aprovação de briefing
 */
export interface ApproveBriefingResult {
  projectId: string;
}

/**
 * Dados para rejeição de briefing
 */
export interface RejectBriefingData {
  reason: string;
}
