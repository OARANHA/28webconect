'use server';

import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { getInactivityWarningEmailTemplate } from '@/lib/email-templates/inactivity-warning';
import { UserRole } from '@prisma/client';

/**
 * Verifica usuários inativos há entre 11 e 12 meses e envia email de aviso
 * Executar diariamente via cron job
 * Usa range >=11 meses e <12 meses com flag para garantir que o aviso sempre seja enviado
 */
export async function checkInactiveUsers(): Promise<{
  success: boolean;
  warningsSent: number;
  errors: string[];
}> {
  try {
    const now = new Date();

    // Calcular limites: >= 11 meses e < 12 meses
    const elevenMonthsAgo = new Date(now);
    elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);

    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Buscar usuários inativos há entre 11 e 12 meses que ainda não receberam aviso
    const inactiveUsers = await prisma.user.findMany({
      where: {
        role: UserRole.CLIENTE, // Apenas clientes
        doNotDelete: false, // Não marcados para preservação
        emailVerified: { not: null }, // Email verificado
        warningSentAt: null, // Ainda não recebeu aviso
        OR: [
          {
            // Usuários com lastLogin entre 11 e 12 meses atrás
            lastLoginAt: {
              gte: twelveMonthsAgo,
              lt: elevenMonthsAgo,
            },
          },
          {
            // Usuários que nunca fizeram login mas criados entre 11 e 12 meses atrás
            lastLoginAt: null,
            createdAt: {
              gte: twelveMonthsAgo,
              lt: elevenMonthsAgo,
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    console.log(
      `[Data Retention] ${inactiveUsers.length} usuários inativos (11-12 meses) encontrados para aviso`
    );

    const errors: string[] = [];
    let warningsSent = 0;

    for (const user of inactiveUsers) {
      try {
        await sendInactivityWarning(
          user.id,
          user.email,
          user.name || 'Usuário',
          user.lastLoginAt || user.createdAt
        );

        // Marcar que o aviso foi enviado para evitar duplicidade
        await prisma.user.update({
          where: { id: user.id },
          data: { warningSentAt: now },
        });

        warningsSent++;
      } catch (error) {
        const errorMsg = `Erro ao enviar aviso para ${user.email}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(`[Data Retention] ${warningsSent} avisos de inatividade enviados`);

    return {
      success: true,
      warningsSent,
      errors,
    };
  } catch (error) {
    console.error('[Data Retention] Erro ao verificar usuários inativos:', error);
    return {
      success: false,
      warningsSent: 0,
      errors: [String(error)],
    };
  }
}

/**
 * Envia email de aviso de inatividade para um usuário
 */
export async function sendInactivityWarning(
  userId: string,
  email: string,
  name: string,
  lastLoginAt: Date
): Promise<void> {
  const now = new Date();
  const daysSinceLastLogin = Math.floor(
    (now.getTime() - lastLoginAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysUntilDeletion = 365 - daysSinceLastLogin; // Aproximadamente 30 dias

  const lastLoginFormatted = lastLoginAt.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const { html, text, subject } = getInactivityWarningEmailTemplate(
    name,
    lastLoginFormatted,
    daysUntilDeletion
  );

  const result = await sendEmail({
    to: email,
    subject,
    html,
    text,
  });

  if (!result.success) {
    throw new Error(result.error || 'Falha ao enviar email');
  }

  console.log(`[Data Retention] Aviso de inatividade enviado para ${email}`);
}

/**
 * Exclui ou anonimiza dados de usuários inativos há 12 meses
 * Preserva dados contratuais/financeiros por 5 anos conforme obrigação legal
 * Executar diariamente via cron job
 */
export async function deleteInactiveData(): Promise<{
  success: boolean;
  usersDeleted: number;
  contractualPreserved: number;
  errors: string[];
}> {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Buscar usuários inativos há 12+ meses
    const inactiveUsers = await prisma.user.findMany({
      where: {
        role: UserRole.CLIENTE,
        doNotDelete: false,
        OR: [
          {
            lastLoginAt: {
              lte: twelveMonthsAgo,
            },
          },
          {
            lastLoginAt: null,
            createdAt: {
              lte: twelveMonthsAgo,
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(
      `[Data Retention] ${inactiveUsers.length} usuários inativos há 12+ meses encontrados para processamento`
    );

    const errors: string[] = [];
    let usersDeleted = 0;
    let contractualPreserved = 0;

    for (const user of inactiveUsers) {
      try {
        const result = await deleteUserData(user.id, user.email, 'Inatividade por 12 meses');
        usersDeleted++;
        if (result.contractualDataPreserved) {
          contractualPreserved++;
        }
      } catch (error) {
        const errorMsg = `Erro ao processar dados de ${user.email}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(
      `[Data Retention] ${usersDeleted} usuários processados (${contractualPreserved} com dados contratuais preservados)`
    );

    return {
      success: true,
      usersDeleted,
      contractualPreserved,
      errors,
    };
  } catch (error) {
    console.error('[Data Retention] Erro ao processar dados inativos:', error);
    return {
      success: false,
      usersDeleted: 0,
      contractualPreserved: 0,
      errors: [String(error)],
    };
  }
}

/**
 * Exclui dados de um usuário, preservando registros contratuais/financeiros por 5 anos
 * Dados contratuais (projetos/briefings com isContractual=true) são mantidos conforme LGPD/Código Civil Art. 205
 */
async function deleteUserData(
  userId: string,
  userEmail: string,
  reason: string,
  deletedBy?: string
): Promise<{ contractualDataPreserved: boolean }> {
  // Verificar se usuário tem dados contratuais/financeiros
  const contractualProjects = await prisma.project.findMany({
    where: {
      userId,
      isContractual: true,
    },
    select: { id: true },
  });

  const contractualBriefings = await prisma.briefing.findMany({
    where: {
      userId,
      isContractual: true,
    },
    select: { id: true },
  });

  const hasContractualData = contractualProjects.length > 0 || contractualBriefings.length > 0;

  // Usar transação para garantir atomicidade
  await prisma.$transaction(async (tx) => {
    // 1. Registrar log de exclusão ANTES de deletar
    const dataTypes = [
      'user',
      'briefings',
      'briefingDrafts',
      'projects',
      'files',
      'comments',
      'notifications',
      'sessions',
      'accounts',
    ];

    // Se há dados contratuais, anotar no log
    if (hasContractualData) {
      dataTypes.push('contractual_data_preserved_5_years');
    }

    await tx.dataDeletionLog.create({
      data: {
        userId,
        userEmail,
        reason,
        deletedBy: deletedBy || null,
        dataTypes,
      },
    });

    // 2. Excluir briefings NÃO contratuais (dados contratuais são mantidos)
    await tx.briefing.deleteMany({
      where: {
        userId,
        isContractual: false,
      },
    });

    // 3. Desvincular briefings contratuais do usuário (preservar por 5 anos, mas sem vínculo PII)
    await tx.briefing.updateMany({
      where: {
        userId,
        isContractual: true,
      },
      data: {
        userId: '', // Será atualizado para null após deletar usuário, ou usar uma abordagem diferente
      },
    });

    // 4. Excluir projetos NÃO contratuais
    await tx.project.deleteMany({
      where: {
        userId,
        isContractual: false,
      },
    });

    // 5. Desvincular projetos contratuais do usuário (preservar por 5 anos)
    await tx.project.updateMany({
      where: {
        userId,
        isContractual: true,
      },
      data: {
        userId: '', // Será atualizado para null após deletar usuário
      },
    });

    // 6. Excluir outros dados relacionados (cascade delete automático para a maioria)
    // - Account, Session (via onDelete: Cascade)
    // - ChatSession, BriefingDraft (via onDelete: Cascade)
    // - Notification, NotificationPreference, PushSubscription (via onDelete: Cascade)
    // - ProjectFile, ProjectComment (via onDelete: Cascade)

    // 7. Excluir usuário (cascade delete cuida do resto)
    // Nota: Projetos/briefings contratuais foram desvinculados acima
    await tx.user.delete({
      where: { id: userId },
    });

    // 8. Atualizar registros contratuais para userId = null (usuário deletado)
    // Isso mantém os dados para obrigação legal mas remove o vínculo PII
    await tx.briefing.updateMany({
      where: { userId: '' },
      data: { userId: null },
    });

    await tx.project.updateMany({
      where: { userId: '' },
      data: { userId: null },
    });
  });

  console.log(
    `[Data Retention] Dados do usuário ${userEmail} excluídos com sucesso${hasContractualData ? ' (dados contratuais preservados por 5 anos)' : ''}`
  );

  return { contractualDataPreserved: hasContractualData };
}

/**
 * Anonimiza briefings não convertidos (sem projeto) após 2 anos
 * Mantém dados estatísticos mas remove informações pessoais
 * Remove o vínculo com o usuário para garantir que não haja acesso ao email/telefone
 */
export async function anonymizeBriefings(): Promise<{
  success: boolean;
  briefingsAnonymized: number;
  errors: string[];
}> {
  try {
    const now = new Date();
    const twoYearsAgo = new Date(now);
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    // Buscar briefings não convertidos (sem projeto) criados há 2+ anos
    const oldBriefings = await prisma.briefing.findMany({
      where: {
        createdAt: {
          lte: twoYearsAgo,
        },
        project: null, // Não convertido em projeto
      },
      select: {
        id: true,
        companyName: true,
        userId: true,
      },
    });

    console.log(
      `[Data Retention] ${oldBriefings.length} briefings não convertidos encontrados para anonimização`
    );

    const errors: string[] = [];
    let briefingsAnonymized = 0;

    for (const briefing of oldBriefings) {
      try {
        // Anonimizar o briefing e remover o vínculo com o usuário
        // Isso garante que não seja possível acessar email/telefone do usuário através do briefing
        await prisma.briefing.update({
          where: { id: briefing.id },
          data: {
            companyName: '[ANONIMIZADO]',
            objectives: '[Dados removidos por política de retenção LGPD]',
            features: null,
            references: null,
            integrations: null,
            additionalInfo: null,
            userId: null, // Remover vínculo com usuário - quebra a relação que permitiria acesso a PII
          },
        });

        briefingsAnonymized++;
      } catch (error) {
        const errorMsg = `Erro ao anonimizar briefing ${briefing.id}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(`[Data Retention] ${briefingsAnonymized} briefings anonimizados`);

    return {
      success: true,
      briefingsAnonymized,
      errors,
    };
  } catch (error) {
    console.error('[Data Retention] Erro ao anonimizar briefings:', error);
    return {
      success: false,
      briefingsAnonymized: 0,
      errors: [String(error)],
    };
  }
}

/**
 * Executa todas as políticas de retenção de dados
 * Função principal para ser chamada pelo cron job
 */
export async function runDataRetention(): Promise<{
  success: boolean;
  summary: {
    warningsSent: number;
    usersDeleted: number;
    contractualPreserved: number;
    briefingsAnonymized: number;
  };
  errors: string[];
}> {
  console.log('[Data Retention] Iniciando execução de políticas de retenção...');

  const allErrors: string[] = [];

  // 1. Verificar usuários inativos há 11 meses e enviar avisos
  const warningsResult = await checkInactiveUsers();
  allErrors.push(...warningsResult.errors);

  // 2. Excluir dados de usuários inativos há 12 meses (preservando contratuais por 5 anos)
  const deletionResult = await deleteInactiveData();
  allErrors.push(...deletionResult.errors);

  // 3. Anonimizar briefings não convertidos após 2 anos
  const anonymizationResult = await anonymizeBriefings();
  allErrors.push(...anonymizationResult.errors);

  const summary = {
    warningsSent: warningsResult.warningsSent,
    usersDeleted: deletionResult.usersDeleted,
    contractualPreserved: deletionResult.contractualPreserved,
    briefingsAnonymized: anonymizationResult.briefingsAnonymized,
  };

  console.log('[Data Retention] Execução concluída:', summary);

  return {
    success: allErrors.length === 0,
    summary,
    errors: allErrors,
  };
}
