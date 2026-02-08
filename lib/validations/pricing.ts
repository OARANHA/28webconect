import { z } from 'zod';
import { ServiceType } from '@prisma/client';

// Valores válidos do ServiceType
const validServiceTypes: string[] = [
  ServiceType.ERP_BASICO,
  ServiceType.ERP_ECOMMERCE,
  ServiceType.ERP_PREMIUM,
  ServiceType.LANDING_IA,
  ServiceType.LANDING_IA_WHATSAPP,
];

/**
 * Schema para atualização de plano
 * Usado na edição de planos existentes
 */
export const updatePlanSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome do plano deve ter no mínimo 3 caracteres')
    .max(100, 'O nome do plano deve ter no máximo 100 caracteres'),
  price: z.number().positive('O preço deve ser maior que 0'),
  features: z
    .array(z.string().min(1, 'A feature não pode estar vazia'))
    .min(1, 'Adicione pelo menos 1 feature')
    .max(15, 'Máximo de 15 features permitidas'),
  storageLimit: z.number().positive('O limite de storage deve ser maior que 0'),
});

/**
 * Schema para criação de novo plano
 * Inclui serviceType que não pode ser alterado em edição
 */
export const createPlanSchema = updatePlanSchema.extend({
  serviceType: z.string().refine((val) => validServiceTypes.includes(val), {
    message: 'Selecione um tipo de serviço válido',
  }),
});

/**
 * Schema para reordenação de planos
 */
export const reorderPlansSchema = z.object({
  planIds: z.array(z.string()).min(1, 'Forneça pelo menos um ID de plano'),
});

// Tipos TypeScript inferidos dos schemas
export type UpdatePlanData = z.infer<typeof updatePlanSchema>;
export type CreatePlanData = z.infer<typeof createPlanSchema>;
export type ReorderPlansData = z.infer<typeof reorderPlansSchema>;

// Re-exporta o ServiceType para conveniência
export { ServiceType };
