import { z } from 'zod';

// Regex para formato de telefone brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

/**
 * Schema de validação para cadastro de usuários
 * - nome: mínimo 2 caracteres
 * - email: formato válido
 * - senha: mínimo 8 caracteres
 * - empresa: opcional
 * - telefone: opcional, formato brasileiro
 * - marketingConsent: boolean (LGPD)
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome deve ter no mínimo 2 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .email('Digite um email válido')
    .max(255, 'O email deve ter no máximo 255 caracteres'),
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .max(100, 'A senha deve ter no máximo 100 caracteres'),
  company: z
    .string()
    .max(100, 'A empresa deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(phoneRegex, 'Digite um telefone válido no formato (XX) XXXXX-XXXX')
    .optional()
    .or(z.literal('')),
  marketingConsent: z.boolean(),
});

/**
 * Schema de validação para login
 * - email: formato válido
 * - senha: mínimo 8 caracteres
 */
export const loginSchema = z.object({
  email: z.string().email('Digite um email válido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
});

/**
 * Schema de validação para recuperação de senha
 * - email: formato válido
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Digite um email válido'),
});

/**
 * Schema de validação para redefinição de senha
 * - senha: mínimo 8 caracteres
 * - confirmPassword: deve corresponder à senha
 * - token: string obrigatória
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres')
      .max(100, 'A senha deve ter no máximo 100 caracteres'),
    confirmPassword: z.string().min(8, 'A confirmação deve ter no mínimo 8 caracteres'),
    token: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não correspondem',
    path: ['confirmPassword'],
  });

// Tipos inferidos dos schemas
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
