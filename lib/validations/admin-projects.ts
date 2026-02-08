import { z } from 'zod';
import { ProjectStatus, ServiceType } from '@prisma/client';

/**
 * Schema de validação para atualização de status do projeto
 */
export const updateProjectStatusSchema = z.object({
  projectId: z.string().cuid('ID de projeto inválido'),
  newStatus: z.nativeEnum(ProjectStatus),
});

/**
 * Schema de validação para toggle de milestone
 */
export const toggleMilestoneSchema = z.object({
  milestoneId: z.string().cuid('ID de milestone inválido'),
  completed: z.boolean(),
});

/**
 * Schema de validação para adicionar nota ao projeto
 */
export const addProjectNoteSchema = z.object({
  projectId: z.string().cuid('ID de projeto inválido'),
  content: z
    .string()
    .min(10, 'Nota deve ter no mínimo 10 caracteres')
    .max(1000, 'Nota muito longa (máximo 1000 caracteres)'),
});

/**
 * Schema de validação para filtros de projetos
 */
export const adminProjectFiltersSchema = z.object({
  status: z.nativeEnum(ProjectStatus).optional(),
  userId: z.string().cuid().optional(),
  serviceType: z.nativeEnum(ServiceType).optional(),
  searchTerm: z.string().max(100).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

/**
 * Schema de validação para ID de projeto
 */
export const projectIdSchema = z.object({
  projectId: z.string().cuid('ID de projeto inválido'),
});

// Types inferidos
export type UpdateProjectStatusData = z.infer<typeof updateProjectStatusSchema>;
export type ToggleMilestoneData = z.infer<typeof toggleMilestoneSchema>;
export type AddProjectNoteData = z.infer<typeof addProjectNoteSchema>;
export type AdminProjectFiltersData = z.infer<typeof adminProjectFiltersSchema>;
export type ProjectIdData = z.infer<typeof projectIdSchema>;
