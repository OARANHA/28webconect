import {
  AdminProjectFilters,
  AdminProjectListItem,
  AdminProjectStats,
  AdminProjectWithRelations,
  ToggleMilestoneResult,
  UpdateProjectStatusResult,
} from '@/types/admin-project';
import { ProjectStatus } from '@prisma/client';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Busca todos os projetos com filtros opcionais
 */
export async function fetchAdminProjects(
  filters?: AdminProjectFilters
): Promise<{ projects: AdminProjectListItem[]; stats: AdminProjectStats }> {
  const params = new URLSearchParams();

  if (filters?.status) params.append('status', filters.status);
  if (filters?.serviceType) params.append('serviceType', filters.serviceType);
  if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
  if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString());

  const response = await fetch(`/api/admin/projects?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const result: ApiResponse<{ projects: AdminProjectListItem[]; stats: AdminProjectStats }> =
    await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Erro ao buscar projetos');
  }

  return result.data;
}

/**
 * Busca um projeto específico por ID
 */
export async function fetchAdminProjectById(projectId: string): Promise<AdminProjectWithRelations> {
  const response = await fetch(`/api/admin/projects/${projectId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const result: ApiResponse<AdminProjectWithRelations> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Erro ao buscar projeto');
  }

  return result.data;
}

/**
 * Atualiza o status de um projeto
 */
export async function updateAdminProjectStatus(
  projectId: string,
  status: ProjectStatus
): Promise<UpdateProjectStatusResult> {
  const response = await fetch(`/api/admin/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  const result: ApiResponse<UpdateProjectStatusResult> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Erro ao atualizar status');
  }

  return result.data;
}

/**
 * Alterna o estado de conclusão de uma milestone
 */
export async function toggleAdminMilestone(
  projectId: string,
  milestoneId: string,
  completed: boolean
): Promise<ToggleMilestoneResult> {
  const response = await fetch(`/api/admin/projects/${projectId}/milestones`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ milestoneId, completed }),
  });

  const result: ApiResponse<ToggleMilestoneResult> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Erro ao atualizar milestone');
  }

  return result.data;
}

/**
 * Adiciona uma nota ao projeto
 */
export async function addAdminProjectNote(projectId: string, content: string): Promise<void> {
  const response = await fetch(`/api/admin/projects/${projectId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  const result: ApiResponse<void> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Erro ao adicionar nota');
  }
}

/**
 * Busca estatísticas de projetos
 */
export async function fetchAdminProjectStats(): Promise<{
  total: number;
  ativos: number;
  concluidosEsteMes: number;
  taxaConclusao: number;
  tempoMedioConclusao: number;
}> {
  const response = await fetch('/api/admin/projects/stats', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const result: ApiResponse<{
    total: number;
    ativos: number;
    concluidosEsteMes: number;
    taxaConclusao: number;
    tempoMedioConclusao: number;
  }> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Erro ao buscar estatísticas');
  }

  return result.data;
}
