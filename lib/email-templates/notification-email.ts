import { NotificationData } from '@/types/notifications';
import { NotificationType } from '@prisma/client';

/**
 * Retorna o subject do email baseado no tipo de notificação
 */
function getSubjectByType(type: NotificationType): string {
  const subjects: Record<NotificationType, string> = {
    NOVO_BRIEFING: 'Novo briefing recebido - 28Web Connect',
    PROJETO_ATUALIZADO: 'Atualização no seu projeto - 28Web Connect',
    NOVA_MENSAGEM: 'Nova mensagem para você - 28Web Connect',
    ARQUIVO_SOLICITADO: 'Arquivo solicitado - 28Web Connect',
    PROJETO_CONCLUIDO: 'Projeto concluído! 🎉 - 28Web Connect',
    BRIEFING_APROVADO: 'Seu briefing foi aprovado! ✅ - 28Web Connect',
    BRIEFING_REJEITADO: 'Seu briefing precisa de ajustes - 28Web Connect',
    MILESTONE_CONCLUIDA: 'Milestone concluída! 🎯 - 28Web Connect',
    SISTEMA: 'Notificação do sistema - 28Web Connect',
  };

  return subjects[type] || 'Notificação - 28Web Connect';
}

/**
 * Retorna o texto do botão CTA baseado no tipo de notificação
 */
function getButtonTextByType(type: NotificationType): string {
  const texts: Record<NotificationType, string> = {
    NOVO_BRIEFING: 'Ver Briefing',
    PROJETO_ATUALIZADO: 'Ver Projeto',
    NOVA_MENSAGEM: 'Ver Mensagem',
    ARQUIVO_SOLICITADO: 'Enviar Arquivo',
    PROJETO_CONCLUIDO: 'Acessar Projeto',
    BRIEFING_APROVADO: 'Ver Detalhes',
    BRIEFING_REJEITADO: 'Editar Briefing',
    MILESTONE_CONCLUIDA: 'Ver Progresso',
    SISTEMA: 'Acessar Dashboard',
  };

  return texts[type] || 'Acessar';
}

/**
 * Template de email para notificações
 * Design: Dark theme com identidade visual 28Web Connect
 */
export function getNotificationEmailTemplate(
  notification: NotificationData,
  userName: string
): { html: string; text: string; subject: string } {
  const subject = getSubjectByType(notification.type);
  const buttonText = notification.metadata?.actionText || getButtonTextByType(notification.type);
  const actionUrl = notification.metadata?.actionUrl || `${process.env.NEXTAUTH_URL}/dashboard`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .title { font-size: 22px !important; }
      .button { width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="max-width: 600px; width: 100%; background-color: #1a1a1a; border-radius: 16px; border: 2px dashed rgba(255, 107, 53, 0.3);">
          
          <!-- Header com Logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <img src="${process.env.NEXTAUTH_URL}/assets/28connect.jpg" alt="28Web Connect" width="120" style="border-radius: 8px;" />
            </td>
          </tr>
          
          <!-- Título -->
          <tr>
            <td align="center" style="padding: 20px 40px;">
              <h1 class="title" style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0; line-height: 1.3;">
                ${notification.title}
              </h1>
            </td>
          </tr>
          
          <!-- Saudação -->
          <tr>
            <td align="center" style="padding: 0 40px 20px;">
              <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0;">
                Olá, ${userName}!
              </p>
            </td>
          </tr>
          
          <!-- Mensagem -->
          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0;">
                ${notification.message}
              </p>
            </td>
          </tr>
          
          <!-- Botão CTA -->
          <tr>
            <td align="center" style="padding: 20px 40px 30px;">
              <a href="${actionUrl}" class="button" style="display: inline-block; background-color: #ff6b35; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; transition: background-color 0.2s;">
                ${buttonText}
              </a>
            </td>
          </tr>
          
          <!-- Link alternativo -->
          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <p style="color: #999999; font-size: 14px; line-height: 1.5; margin: 0;">
                Ou copie e cole este link no seu navegador:<br>
                <a href="${actionUrl}" style="color: #ff8c42; text-decoration: underline; word-break: break-all;">${actionUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 20px 40px;">
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.1);"></div>
            </td>
          </tr>
          
          <!-- Preferências -->
          <tr>
            <td align="center" style="padding: 0 40px 20px;">
              <p style="color: #888888; font-size: 12px; line-height: 1.5; margin: 0;">
                Você está recebendo este email porque configurou notificações em 28webconnect.com.<br>
                Para gerenciar suas preferências, <a href="${process.env.NEXTAUTH_URL}/dashboard/notificacoes" style="color: #ff8c42; text-decoration: underline;">clique aqui</a>.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <p style="color: #888888; font-size: 12px; line-height: 1.5; margin: 0 0 10px;">
                28Web Connect - Soluções digitais para seu negócio
              </p>
              <p style="color: #666666; font-size: 12px; margin: 0;">
                <a href="${process.env.NEXTAUTH_URL}/politica-privacidade" style="color: #888888; text-decoration: underline;">Política de Privacidade</a> | 
                <a href="${process.env.NEXTAUTH_URL}/contato" style="color: #888888; text-decoration: underline;">Contato</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Olá, ${userName}!

${notification.title}

${notification.message}

${buttonText}: ${actionUrl}

---
Você está recebendo este email porque configurou notificações em 28webconnect.com.
Para gerenciar suas preferências, acesse: ${process.env.NEXTAUTH_URL}/dashboard/notificacoes

28Web Connect - Soluções digitais para seu negócio
Política de Privacidade: ${process.env.NEXTAUTH_URL}/politica-privacidade
Contato: ${process.env.NEXTAUTH_URL}/contato
  `.trim();

  return { html, text, subject };
}
