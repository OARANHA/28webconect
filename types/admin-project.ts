import {
  Project,
  ProjectMilestone,
  ProjectFile,
  ProjectComment,
  Briefing,
  ServiceType,
  ProjectStatus,
  UserRole,
} from '@prisma/client';

/**
 * Tipo de projeto com relações para listagem admin
 */
export type AdminProjectListItem = Project & {
  user: { id: string; name: string | null; email: string; company: string | null };
  briefing?: { id: string; serviceType: ServiceType; companyName: string } | null;
  milestones: ProjectMilestone[];
  _count: { files: number; comments: number };
};

/**
 * Tipo de projeto completo para edição admin
 */
export type AdminProjectWithRelations = Project & {
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    company: string | null;
  };
  briefing?: Briefing | null;
  milestones: ProjectMilestone[];
  files: (ProjectFile & { user: { id: string; name: string | null } })[];
  comments: (ProjectComment & { user: { id: string; name: string | null; role: UserRole } })[];
};

/**
 * Filtros de projeto para admin
 */
export interface AdminProjectFilters {
  status?: ProjectStatus;
  userId?: string;
  serviceType?: ServiceType;
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Estatísticas de projetos
 */
export interface AdminProjectStats {
  total: number;
  ativos: number;
  concluidos: number;
  pausados: number;
  cancelados: number;
  arquivados: number;
}

/**
 * Resposta de ações admin
 */
export interface AdminProjectActionResponse<T = unknown> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

/**
 * Resultado da atualização de milestone
 */
export interface ToggleMilestoneResult {
  progress: number;
  milestoneCompleted: boolean;
}

/**
 * Resultado da atualização de status
 */
export interface UpdateProjectStatusResult {
  oldStatus: ProjectStatus;
  newStatus: ProjectStatus;
}
