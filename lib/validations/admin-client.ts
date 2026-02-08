import { z } from 'zod';

/**
 * Schema para validação de filtros de clientes
 */
export const adminClientFiltersSchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  searchTerm: z.string().min(0).max(100).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

/**
 * Schema para validação de ID de cliente
 */
export const clientIdSchema = z.string().cuid({
  message: 'ID de cliente inválido',
});

/**
 * Schema para validação de desativação de cliente
 */
export const deactivateClientSchema = z.object({
  clientId: z.string().cuid({
    message: 'ID de cliente inválido',
  }),
});

// Tipos TypeScript inferidos dos schemas
export type AdminClientFiltersData = z.infer<typeof adminClientFiltersSchema>;
export type DeactivateClientData = z.infer<typeof deactivateClientSchema>;
