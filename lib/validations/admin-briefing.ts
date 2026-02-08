import { z } from 'zod';
import { BriefingStatus, ServiceType } from '@prisma/client';

/**
 * Schema de validação para rejeição de briefing
 */
export const rejectBriefingSchema = z.object({
  reason: z
    .string()
    .min(10, 'O motivo deve ter no mínimo 10 caracteres')
    .max(500, 'O motivo deve ter no máximo 500 caracteres'),
});

/**
 * Schema de validação para filtros de briefing
 */
export const briefingFiltersSchema = z.object({
  status: z.nativeEnum(BriefingStatus).optional(),
  serviceType: z.nativeEnum(ServiceType).optional(),
  searchTerm: z.string().max(100).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

/**
 * Schema de validação para atualização de status
 */
export const updateBriefingStatusSchema = z.object({
  status: z.nativeEnum(BriefingStatus),
});

/**
 * Schema de validação para ID de briefing
 */
export const briefingIdSchema = z.object({
  briefingId: z.string().cuid('ID de briefing inválido'),
});

/**
 * Schema de validação para aprovação de briefing
 */
export const approveBriefingSchema = z.object({
  briefingId: z.string().cuid('ID de briefing inválido'),
  adminId: z.string().cuid('ID do administrador inválido'),
});

/**
 * Schema de validação para rejeição de briefing (com IDs)
 */
export const rejectBriefingWithIdsSchema = z.object({
  briefingId: z.string().cuid('ID de briefing inválido'),
  adminId: z.string().cuid('ID do administrador inválido'),
  reason: z
    .string()
    .min(10, 'O motivo deve ter no mínimo 10 caracteres')
    .max(500, 'O motivo deve ter no máximo 500 caracteres'),
});

// Types inferidos
export type RejectBriefingData = z.infer<typeof rejectBriefingSchema>;
export type BriefingFiltersData = z.infer<typeof briefingFiltersSchema>;
export type UpdateBriefingStatusData = z.infer<typeof updateBriefingStatusSchema>;
export type BriefingIdData = z.infer<typeof briefingIdSchema>;
export type ApproveBriefingData = z.infer<typeof approveBriefingSchema>;
export type RejectBriefingWithIdsData = z.infer<typeof rejectBriefingWithIdsSchema>;
