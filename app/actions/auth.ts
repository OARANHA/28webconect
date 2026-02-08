'use server';

import { signIn } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePassword } from '@/lib/auth-utils';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  RegisterFormData,
  LoginFormData,
  ForgotPasswordFormData,
} from '@/lib/validations/auth';
import { Prisma, VerificationTokenType } from '@prisma/client';
import { sendEmail } from '@/lib/email';
import { getVerificationEmailTemplate } from '@/lib/email-templates/verification-email';
import { getPasswordResetEmailTemplate } from '@/lib/email-templates/password-reset';

// Tipo de resposta padrão para actions
interface ActionResponse {
  success: boolean;
  error?: string;
  message?: string;
  requiresVerification?: boolean;
}

/**
 * Envia email de verificação para o usuário
 * @param email Email do usuário
 * @returns Resultado da operação
 */
export async function sendVerificationEmail(email: string): Promise<ActionResponse> {
  try {
    // 1. Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Não revelar se email existe (segurança)
      return {
        success: true,
        message: 'Se o email existir, você receberá instruções em breve.',
      };
    }

    // 2. Verificar se email já está verificado
    if (user.emailVerified) {
      return {
        success: false,
        error: 'Email já verificado',
      };
    }

    // 3. Deletar tokens de VERIFICAÇÃO antigos do usuário (não afeta tokens de reset)
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: user.email,
        type: VerificationTokenType.VERIFICATION,
      },
    });

    // 4. Gerar novo token UUID com validade de 24h e tipo VERIFICATION
    const token = crypto.randomUUID();
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        type: VerificationTokenType.VERIFICATION,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // 5. Construir URL de verificação
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

    // 6. Obter template do email
    const { html, text, subject } = getVerificationEmailTemplate(
      user.name || 'Usuário',
      verificationUrl
    );

    // 7. Enviar email
    const emailResult = await sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });

    if (!emailResult.success) {
      console.error('Erro ao enviar email de verificação:', emailResult.error);
      return {
        success: false,
        error: 'Erro ao enviar email. Tente novamente mais tarde.',
      };
    }

    return {
      success: true,
      message: 'Email de verificação enviado! Verifique sua caixa de entrada.',
    };
  } catch (error) {
    console.error('Erro ao enviar email de verificação:', error);
    return {
      success: false,
      error: 'Erro ao enviar email. Tente novamente.',
    };
  }
}

/**
 * Registra um novo usuário no sistema
 * @param data Dados do formulário de registro
 * @returns Resultado da operação
 */
export async function registerUser(data: RegisterFormData): Promise<ActionResponse> {
  try {
    // 1. Validar dados com Zod
    const validatedData = registerSchema.parse(data);

    // 2. Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'Este email já está cadastrado. Faça login ou use outro email.',
      };
    }

    // 3. Hash da senha
    const hashedPassword = await hashPassword(validatedData.password);

    // 4. Criar usuário
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        company: validatedData.company || null,
        phone: validatedData.phone || null,
        marketingConsent: validatedData.marketingConsent,
        role: 'CLIENTE',
      },
    });

    // 5. Enviar email de verificação
    const emailResult = await sendVerificationEmail(user.email);

    if (!emailResult.success) {
      console.error('Erro ao enviar email de verificação:', emailResult.error);
      // Não bloquear cadastro - usuário pode reenviar depois
    }

    return {
      success: true,
      message: 'Conta criada! Verifique seu email para ativar',
    };
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);

    // Tratamento específico de erros
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 = unique constraint violation
      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'Este email já está cadastrado.',
        };
      }
    }

    if (error instanceof Error && error.message.includes('8 caracteres')) {
      return {
        success: false,
        error: 'A senha deve ter no mínimo 8 caracteres.',
      };
    }

    return {
      success: false,
      error: 'Erro ao criar conta. Tente novamente mais tarde.',
    };
  }
}

/**
 * Realiza login do usuário
 * @param data Dados do formulário de login
 * @returns Resultado da operação
 */
export async function loginUser(data: LoginFormData): Promise<ActionResponse> {
  try {
    // 1. Validar dados
    const validatedData = loginSchema.parse(data);

    // 2. Usar NextAuth signIn
    const result = await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        error: 'Email ou senha incorretos',
      };
    }

    // 3. Atualizar lastLoginAt
    await prisma.user.update({
      where: { email: validatedData.email },
      data: { lastLoginAt: new Date() },
    });

    // 4. Verificar se email está verificado
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: { emailVerified: true },
    });

    return {
      success: true,
      requiresVerification: !user?.emailVerified,
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return {
      success: false,
      error: 'Erro ao fazer login. Tente novamente.',
    };
  }
}

/**
 * Envia email de recuperação de senha
 * @param data Dados do formulário de recuperação
 * @returns Resultado da operação
 */
export async function sendPasswordReset(data: ForgotPasswordFormData): Promise<ActionResponse> {
  try {
    // 1. Validar email
    const validatedData = forgotPasswordSchema.parse(data);

    // 2. Buscar usuário (silencioso - não revelar se existe)
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // 3. Se usuário existir, criar token (1h de validade) e enviar email
    if (user) {
      // Deletar tokens de PASSWORD_RESET antigos do usuário (não afeta tokens de verificação)
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: user.email,
          type: VerificationTokenType.PASSWORD_RESET,
        },
      });

      const token = crypto.randomUUID();
      await prisma.verificationToken.create({
        data: {
          identifier: user.email,
          token,
          type: VerificationTokenType.PASSWORD_RESET,
          expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hora
        },
      });

      // 4. Construir URL de redefinição
      const resetUrl = `${process.env.NEXTAUTH_URL}/redefinir-senha/${token}`;

      // 5. Obter template do email
      const { html, text, subject } = getPasswordResetEmailTemplate(
        user.name || 'Usuário',
        resetUrl
      );

      // 6. Enviar email
      const emailResult = await sendEmail({
        to: user.email,
        subject,
        html,
        text,
      });

      if (!emailResult.success) {
        console.error('Erro ao enviar email de recuperação:', emailResult.error);
      }
    }

    // 7. Retornar sucesso mesmo se email não existir (segurança)
    return {
      success: true,
      message: 'Se o email existir, você receberá instruções em breve.',
    };
  } catch (error) {
    console.error('Erro ao enviar recuperação de senha:', error);
    return {
      success: false,
      error: 'Erro ao processar solicitação. Tente novamente.',
    };
  }
}

/**
 * Valida se um token de redefinição é válido
 * @param token Token a ser validado
 * @returns Resultado da validação
 */
export async function validateResetToken(token: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    // Buscar token apenas do tipo PASSWORD_RESET
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: VerificationTokenType.PASSWORD_RESET,
      },
    });

    if (!tokenRecord) {
      return { valid: false, error: 'Token inválido' };
    }

    if (tokenRecord.expires < new Date()) {
      return { valid: false, error: 'Token expirado' };
    }

    return { valid: true };
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return { valid: false, error: 'Erro ao validar token' };
  }
}

/**
 * Redefine a senha do usuário
 * @param token Token de redefinição
 * @param newPassword Nova senha
 * @returns Resultado da operação
 */
export async function resetPassword(token: string, newPassword: string): Promise<ActionResponse> {
  try {
    // 1. Validar senha
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // 2. Buscar token apenas do tipo PASSWORD_RESET
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: VerificationTokenType.PASSWORD_RESET,
      },
    });

    if (!tokenRecord || tokenRecord.expires < new Date()) {
      return {
        success: false,
        error: 'Token inválido ou expirado',
      };
    }

    // 3. Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: tokenRecord.identifier },
    });

    if (!user) {
      return {
        success: false,
        error: 'Usuário não encontrado',
      };
    }

    // 4. Hash da nova senha
    const hashedPassword = await hashPassword(newPassword);

    // 5. Atualizar senha
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // 6. Deletar token usado
    await prisma.verificationToken.delete({
      where: { token },
    });

    return {
      success: true,
      message: 'Senha redefinida com sucesso',
    };
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return {
      success: false,
      error: 'Erro ao redefinir senha. Tente novamente.',
    };
  }
}
