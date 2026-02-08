import { z } from 'zod';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth';

/**
 * Tipos de dados para formulários de autenticação
 * Inferidos automaticamente dos schemas Zod para garantir consistência
 */

/** Dados do formulário de cadastro */
export type RegisterFormData = z.infer<typeof registerSchema>;

/** Dados do formulário de login */
export type LoginFormData = z.infer<typeof loginSchema>;

/** Dados do formulário de recuperação de senha */
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/** Dados do formulário de redefinição de senha */
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Resposta padrão de Server Actions
 */
export interface ActionResponse {
  success: boolean;
  error?: string;
  message?: string;
  requiresVerification?: boolean;
}

/**
 * Estado de um formulário controlado
 */
export interface FormState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Props padrão para componentes de formulário de autenticação
 */
export interface AuthFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}
