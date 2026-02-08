'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword, comparePassword } from '@/lib/auth-utils';
import { sendEmail } from '@/lib/email';
import { getLGPDRequestEmailTemplate } from '@/lib/email-templates/lgpd-request';
import { getVerificationEmailTemplate } from '@/lib/email-templates/verification-email';
import { createNotification } from '@/lib/notifications';
import { LEGAL } from '@/lib/constants';
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
  lgpdRequestSchema,
  UpdateProfileData,
  ChangePasswordData,
  LGPDRequestData,
} from '@/lib/validations/settings';
import { NotificationType, NotificationChannel } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { signOut } from '@/lib/auth';
import { z } from 'zod';

// Tipo de resposta padrão para actions
interface ActionResponse {
  success: boolean;
  error?: string;
  message?: string;
  requiresVerification?: boolean;
  data?: unknown;
}

/**
 * Atualiza o perfil do usuário
 * @param userId ID do usuário
 * @param data Dados do perfil
 * @returns Resultado da operação
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileData
): Promise<ActionResponse> {
  try {
    // Validar dados com Zod
    const validatedData = updateProfileSchema.parse(data);

    // Buscar usuário atual
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // Verificar se email já existe (se alterado)
    if (validatedData.email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        return { success: false, error: 'Este email já está em uso' };
      }
    }

    const emailChanged = validatedData.email !== currentUser.email;

    // Atualizar usuário
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        company: validatedData.company || null,
        // Se email alterado, marcar como não verificado
        ...(emailChanged && { emailVerified: null }),
      },
    });

    // Se email alterado, enviar email de verificação
    if (emailChanged) {
      // Deletar tokens antigos
      await prisma.verificationToken.deleteMany({
        where: { identifier: validatedData.email },
      });

      // Criar novo token
      const token = crypto.randomUUID();
      await prisma.verificationToken.create({
        data: {
          identifier: validatedData.email,
          token,
          type: 'VERIFICATION',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      // Enviar email de verificação
      const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
      const { html, text, subject } = getVerificationEmailTemplate(
        validatedData.name,
        verificationUrl
      );

      await sendEmail({
        to: validatedData.email,
        subject,
        html,
        text,
      });

      // Criar notificação in-app
      await createNotification({
        type: NotificationType.SISTEMA,
        title: 'Email alterado - Verificação necessária',
        message: `Seu email foi alterado para ${validatedData.email}. Verifique sua caixa de entrada para confirmar.`,
        userId,
        channels: [NotificationChannel.IN_APP],
      });

      return {
        success: true,
        message: 'Perfil atualizado! Verifique seu novo email.',
        requiresVerification: true,
      };
    }

    // Revalidate only in production/next context
    try {
      revalidatePath('/configuracoes');
    } catch {
      // Ignore revalidate errors in test environment
    }

    return { success: true, message: 'Perfil atualizado com sucesso!' };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);

    // Tratar erros de validação Zod
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { success: false, error: firstError?.message || 'Dados inválidos' };
    }

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { success: false, error: 'Este email já está em uso' };
    }

    return { success: false, error: 'Erro ao atualizar perfil. Tente novamente.' };
  }
}

/**
 * Altera a senha do usuário
 * @param userId ID do usuário
 * @param data Dados de alteração de senha
 * @returns Resultado da operação
 */
export async function changePassword(
  userId: string,
  data: ChangePasswordData
): Promise<ActionResponse> {
  try {
    // Validar dados com Zod
    const validatedData = changePasswordSchema.parse(data);

    // Buscar usuário com senha
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // Verificar senha atual
    const isPasswordValid = await comparePassword(validatedData.currentPassword, user.password);

    if (!isPasswordValid) {
      return { success: false, error: 'Senha atual incorreta' };
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(validatedData.newPassword);

    // Atualizar senha
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidar sessões antigas (deletar outras sessions)
    await prisma.session.deleteMany({
      where: {
        userId,
        // Manter apenas a session atual seria ideal, mas precisaríamos do sessionToken
        // Deletar todas força re-login em outros dispositivos
      },
    });

    // Criar notificação in-app
    await createNotification({
      type: NotificationType.SISTEMA,
      title: 'Senha alterada',
      message:
        'Sua senha foi alterada com sucesso. Se não foi você, entre em contato imediatamente.',
      userId,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });

    return { success: true, message: 'Senha alterada com sucesso!' };
  } catch (error) {
    console.error('Erro ao alterar senha:', error);

    // Tratar erros de validação Zod
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { success: false, error: firstError?.message || 'Dados inválidos' };
    }

    if (error instanceof Error && error.message.includes('8 caracteres')) {
      return { success: false, error: 'A senha deve ter no mínimo 8 caracteres' };
    }

    return { success: false, error: 'Erro ao alterar senha. Tente novamente.' };
  }
}

/**
 * Busca todos os dados do usuário para download LGPD
 * @param userId ID do usuário
 * @returns Dados do usuário em formato JSON
 */
export async function downloadUserData(userId: string): Promise<ActionResponse> {
  try {
    // Buscar todos os dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        briefings: true,
        projects: {
          include: {
            milestones: true,
            files: true,
            comments: true,
          },
        },
        notifications: true,
        notificationPreferences: true,
      },
    });

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // Estruturar dados para exportação
    const userData = {
      geradoEm: new Date().toISOString(),
      usuario: {
        id: user.id,
        nome: user.name,
        email: user.email,
        telefone: user.phone,
        empresa: user.company,
        role: user.role,
        marketingConsent: user.marketingConsent,
        criadoEm: user.createdAt.toISOString(),
        ultimoLogin: user.lastLoginAt?.toISOString() || null,
      },
      briefings: user.briefings.map((b) => ({
        id: b.id,
        servicoTipo: b.serviceType,
        nomeEmpresa: b.companyName,
        segmento: b.segment,
        objetivos: b.objectives,
        orcamento: b.budget,
        prazo: b.deadline,
        funcionalidades: b.features,
        referencias: b.references,
        integracoes: b.integrations,
        status: b.status,
        criadoEm: b.createdAt.toISOString(),
        enviadoEm: b.submittedAt?.toISOString() || null,
      })),
      projetos: user.projects.map((p) => ({
        id: p.id,
        nome: p.name,
        descricao: p.description,
        status: p.status,
        progresso: p.progress,
        criadoEm: p.createdAt.toISOString(),
        milestones: p.milestones.map((m) => ({
          id: m.id,
          nome: m.name,
          descricao: m.description,
          concluido: m.completed,
          criadoEm: m.createdAt.toISOString(),
          concluidoEm: m.completedAt?.toISOString() || null,
        })),
        comentarios: p.comments.map((c) => ({
          id: c.id,
          conteudo: c.content,
          criadoEm: c.createdAt.toISOString(),
        })),
        arquivos: p.files.map((f) => ({
          id: f.id,
          nomeArquivo: f.filename,
          tamanho: f.filesize,
          tipo: f.mimetype,
          uploadEm: f.uploadedAt.toISOString(),
        })),
      })),
      notificacoes: user.notifications.map((n) => ({
        tipo: n.type,
        titulo: n.title,
        mensagem: n.message,
        lida: n.read,
        canal: n.channel,
        criadoEm: n.createdAt.toISOString(),
      })),
      preferenciasNotificacao: user.notificationPreferences.map((p) => ({
        tipo: p.type,
        emailAtivado: p.emailEnabled,
        pushAtivado: p.pushEnabled,
        inAppAtivado: p.inAppEnabled,
      })),
      contatoDPO: {
        email: LEGAL.dpoEmail,
        informacao: 'Para questões sobre estes dados, entre em contato com nosso DPO',
      },
    };

    return { success: true, data: userData };
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return { success: false, error: 'Erro ao gerar arquivo de dados' };
  }
}

/**
 * Exclui a conta do usuário
 * @param userId ID do usuário
 * @param password Senha atual
 * @param confirmation Confirmação "EXCLUIR CONTA"
 * @returns Resultado da operação
 */
export async function deleteAccount(
  userId: string,
  password: string,
  confirmation: string
): Promise<ActionResponse> {
  try {
    // Validar dados
    const validatedData = deleteAccountSchema.parse({ password, confirmation });

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // Verificar senha
    const isPasswordValid = await comparePassword(validatedData.password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: 'Senha incorreta' };
    }

    // Enviar email de confirmação antes de deletar
    await sendEmail({
      to: user.email,
      subject: 'Conta excluída - 28Web Connect',
      html: `
        <h1>Conta Excluída</h1>
        <p>Olá ${user.name || 'Usuário'},</p>
        <p>Sua conta na 28Web Connect foi excluída permanentemente.</p>
        <p>Se você não solicitou esta exclusão, entre em contato imediatamente: ${LEGAL.dpoEmail}</p>
        <p>Data da exclusão: ${new Date().toLocaleString('pt-BR')}</p>
      `,
      text: `Sua conta na 28Web Connect foi excluída. Se não foi você, contate: ${LEGAL.dpoEmail}`,
    });

    // Deletar usuário (cascade deletará relacionamentos)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Encerrar sessão atual
    await signOut();

    return { success: true, message: 'Conta excluída com sucesso' };
  } catch (error) {
    console.error('Erro ao excluir conta:', error);

    // Tratar erros de validação Zod
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { success: false, error: firstError?.message || 'Dados inválidos' };
    }

    if (error instanceof Error && error.message.includes('Invalid enum value')) {
      return { success: false, error: 'Confirmação inválida' };
    }

    return { success: false, error: 'Erro ao excluir conta. Tente novamente.' };
  }
}

/**
 * Revoga o consentimento de marketing
 * @param userId ID do usuário
 * @returns Resultado da operação
 */
export async function revokeMarketingConsent(userId: string): Promise<ActionResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // Atualizar consentimento
    await prisma.user.update({
      where: { id: userId },
      data: { marketingConsent: false },
    });

    // Criar notificação in-app
    await createNotification({
      type: NotificationType.SISTEMA,
      title: 'Consentimento de marketing revogado',
      message:
        'Você não receberá mais emails promocionais. Pode reativar a qualquer momento nas configurações.',
      userId,
      channels: [NotificationChannel.IN_APP],
    });

    // Enviar email de confirmação
    await sendEmail({
      to: user.email,
      subject: 'Consentimento de Marketing Revogado - 28Web Connect',
      html: `
        <h1>Consentimento Revogado</h1>
        <p>Olá ${user.name || 'Usuário'},</p>
        <p>Seu consentimento para receber comunicações de marketing foi revogado.</p>
        <p>Você continuará recebendo emails importantes sobre sua conta e projetos.</p>
        <p>Para reativar, acesse: ${LEGAL.siteUrl}/configuracoes</p>
      `,
      text: `Seu consentimento de marketing foi revogado. Para reativar: ${LEGAL.siteUrl}/configuracoes`,
    });

    return { success: true, message: 'Consentimento revogado com sucesso' };
  } catch (error) {
    console.error('Erro ao revogar consentimento:', error);
    return { success: false, error: 'Erro ao revogar consentimento' };
  }
}

/**
 * Envia solicitação LGPD ao DPO
 * @param userId ID do usuário
 * @param data Dados da solicitação
 * @returns Resultado da operação
 */
export async function sendLGPDRequest(
  userId: string,
  data: LGPDRequestData
): Promise<ActionResponse> {
  try {
    // Validar dados
    const validatedData = lgpdRequestSchema.parse(data);

    // Buscar informações do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // Preparar dados para email
    const requestTypeLabels: Record<string, string> = {
      ACESSO: 'Acesso aos Dados',
      RETIFICACAO: 'Retificação de Dados',
      PORTABILIDADE: 'Portabilidade de Dados',
      OPOSICAO: 'Oposição ao Tratamento',
      OUTRO: 'Outra Solicitação',
    };

    // Enviar email ao DPO
    const { html, text, subject } = getLGPDRequestEmailTemplate(
      user.name || 'Usuário',
      user.email,
      requestTypeLabels[validatedData.requestType],
      validatedData.description
    );

    const emailResult = await sendEmail({
      to: LEGAL.dpoEmail,
      subject,
      html,
      text,
    });

    if (!emailResult.success) {
      console.error('Erro ao enviar email ao DPO:', emailResult.error);
      return { success: false, error: 'Erro ao enviar solicitação. Tente novamente.' };
    }

    // Criar notificação in-app
    await createNotification({
      type: NotificationType.SISTEMA,
      title: `Solicitação LGPD enviada: ${requestTypeLabels[validatedData.requestType]}`,
      message: 'Sua solicitação foi encaminhada ao nosso DPO. Responderemos em até 15 dias úteis.',
      userId,
      channels: [NotificationChannel.IN_APP],
    });

    return {
      success: true,
      message: 'Solicitação enviada ao DPO! Responderemos em até 15 dias úteis.',
    };
  } catch (error) {
    console.error('Erro ao enviar solicitação LGPD:', error);

    // Tratar erros de validação Zod
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { success: false, error: firstError?.message || 'Dados inválidos' };
    }

    return { success: false, error: 'Erro ao enviar solicitação. Tente novamente.' };
  }
}
