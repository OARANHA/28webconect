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
 * Schema de rascunho - aceita campos parciais
 * Usado para auto-save e validação de formulário
 */
export const briefingDraftSchema = z.object({
  serviceType: z.string().optional(),
  companyName: z.string().min(0).max(100).optional(),
  segment: z.string().min(0).max(100).optional(),
  objectives: z.string().min(0).max(2000).optional(),
  budget: z.string().min(0).max(100).optional(),
  deadline: z.string().min(0).max(100).optional(),
  features: z.string().min(0).max(2000).optional(),
  references: z.string().min(0).max(2000).optional(),
  integrations: z.string().min(0).max(2000).optional(),
  additionalInfo: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Schema completo para submissão de briefing
 * Valida todos os campos obrigatórios
 */
export const briefingSchema = z
  .object({
    serviceType: z.string(),
    companyName: z
      .string()
      .min(2, 'O nome da empresa deve ter no mínimo 2 caracteres')
      .max(100, 'O nome da empresa deve ter no máximo 100 caracteres'),
    segment: z
      .string()
      .min(2, 'O ramo de atividade deve ter no mínimo 2 caracteres')
      .max(100, 'O ramo de atividade deve ter no máximo 100 caracteres'),
    objectives: z
      .string()
      .min(10, 'Descreva os objetivos em pelo menos 10 caracteres')
      .max(2000, 'Os objetivos devem ter no máximo 2000 caracteres'),
    budget: z.string().min(0).max(100).optional(),
    deadline: z.string().min(0).max(100).optional(),
    features: z.string().min(0).max(2000).optional(),
    references: z.string().min(0).max(2000).optional(),
    integrations: z.string().min(0).max(2000).optional(),
    additionalInfo: z.record(z.string(), z.unknown()).optional(),
  })
  .refine(
    (data) => {
      // Validação customizada do serviceType
      return validServiceTypes.includes(data.serviceType);
    },
    {
      message: 'Selecione um tipo de serviço válido',
      path: ['serviceType'],
    }
  );

/**
 * Schema para validação do Step 1: Tipo de Serviço
 */
export const step1Schema = z.object({
  serviceType: z.string().refine((val) => validServiceTypes.includes(val), {
    message: 'Selecione um tipo de serviço',
  }),
});

/**
 * Schema para validação do Step 2: Informações da Empresa
 */
export const step2Schema = z.object({
  companyName: z
    .string()
    .min(2, 'O nome da empresa deve ter no mínimo 2 caracteres')
    .max(100, 'O nome da empresa deve ter no máximo 100 caracteres'),
  segment: z
    .string()
    .min(2, 'O ramo de atividade deve ter no mínimo 2 caracteres')
    .max(100, 'O ramo de atividade deve ter no máximo 100 caracteres'),
});

/**
 * Schema para validação do Step 3: Objetivos
 */
export const step3Schema = z.object({
  objectives: z
    .string()
    .min(10, 'Descreva os objetivos em pelo menos 10 caracteres')
    .max(2000, 'Os objetivos devem ter no máximo 2000 caracteres'),
});

// Tipos TypeScript inferidos dos schemas
export type BriefingFormData = z.infer<typeof briefingSchema>;
export type BriefingDraftData = z.infer<typeof briefingDraftSchema>;
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;

// Re-exporta o ServiceType para conveniência
export { ServiceType };
