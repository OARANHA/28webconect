import { z } from 'zod';

// Regex para formato de telefone brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

/**
 * Schema de validação para atualização de perfil
 * - name: 2-100 caracteres
 * - email: formato válido
 * - phone: opcional, formato brasileiro
 * - company: opcional, max 100 caracteres
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome deve ter no mínimo 2 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .email('Digite um email válido')
    .max(255, 'O email deve ter no máximo 255 caracteres'),
  phone: z
    .string()
    .regex(phoneRegex, 'Digite um telefone válido no formato (XX) XXXXX-XXXX')
    .optional()
    .or(z.literal('')),
  company: z
    .string()
    .max(100, 'A empresa deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
});

/**
 * Schema de validação para alteração de senha
 * - currentPassword: mínimo 8 caracteres
 * - newPassword: mínimo 8 caracteres
 * - confirmPassword: deve corresponder à nova senha
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, 'A senha atual deve ter no mínimo 8 caracteres'),
    newPassword: z
      .string()
      .min(8, 'A nova senha deve ter no mínimo 8 caracteres')
      .max(100, 'A nova senha deve ter no máximo 100 caracteres'),
    confirmPassword: z.string().min(8, 'A confirmação deve ter no mínimo 8 caracteres'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não correspondem',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'A nova senha deve ser diferente da senha atual',
    path: ['newPassword'],
  });

/**
 * Schema de validação para exclusão de conta
 * - password: senha atual (mínimo 8 caracteres)
 * - confirmation: texto exato "EXCLUIR CONTA"
 */
export const deleteAccountSchema = z.object({
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  confirmation: z.string().refine((val) => val === 'EXCLUIR CONTA', {
    message: 'Digite EXCLUIR CONTA para confirmar',
  }),
});

/**
 * Schema de validação para solicitações LGPD
 * - requestType: tipo de solicitação (enum)
 * - description: descrição da solicitação (10-1000 caracteres)
 */
export const lgpdRequestSchema = z.object({
  requestType: z.enum(['ACESSO', 'RETIFICACAO', 'PORTABILIDADE', 'OPOSICAO', 'OUTRO'], {
    errorMap: () => ({ message: 'Selecione um tipo de solicitação válido' }),
  }),
  description: z
    .string()
    .min(10, 'A descrição deve ter no mínimo 10 caracteres')
    .max(1000, 'A descrição deve ter no máximo 1000 caracteres'),
});

// Tipos inferidos dos schemas
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type DeleteAccountData = z.infer<typeof deleteAccountSchema>;
export type LGPDRequestData = z.infer<typeof lgpdRequestSchema>;
