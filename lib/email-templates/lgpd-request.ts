import { LEGAL } from '@/lib/constants';

/**
 * Template de email para solicitações LGPD ao DPO
 * Design: Profissional com todas as informações necessárias
 */

export function getLGPDRequestEmailTemplate(
  userName: string,
  userEmail: string,
  requestType: string,
  description: string
): { html: string; text: string; subject: string } {
  const timestamp = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const subject = `[LGPD] Solicitação de ${requestType} - ${userName}`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitação LGPD</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .title { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="max-width: 600px; width: 100%; background-color: #1a1a1a; border-radius: 16px; border: 2px dashed rgba(255, 107, 53, 0.3);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 30px 40px 20px; background-color: #ff6b35; border-radius: 14px 14px 0 0;">
              <h1 class="title" style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">
                🛡️ Solicitação LGPD
              </h1>
            </td>
          </tr>
          
          <!-- Tipo de Solicitação -->
          <tr>
            <td align="center" style="padding: 30px 40px 10px;">
              <span style="display: inline-block; background-color: rgba(255, 107, 53, 0.2); color: #ff6b35; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">
                ${requestType}
              </span>
            </td>
          </tr>
          
          <!-- Informações do Usuário -->
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 15px 0;">Informações do Titular</h2>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(255,255,255,0.05); border-radius: 8px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="color: #e0e0e0; margin: 0 0 8px 0;"><strong style="color: #ff6b35;">Nome:</strong> ${userName}</p>
                    <p style="color: #e0e0e0; margin: 0;"><strong style="color: #ff6b35;">Email:</strong> ${userEmail}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Descrição -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 15px 0;">Descrição da Solicitação</h2>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(255,255,255,0.05); border-radius: 8px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="color: #e0e0e0; margin: 0; line-height: 1.6; white-space: pre-wrap;">${description}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Timestamp -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <p style="color: #888888; font-size: 14px; margin: 0;">
                <strong>Data/Hora da solicitação:</strong> ${timestamp}
              </p>
            </td>
          </tr>
          
          <!-- Prazo Legal -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(255, 193, 7, 0.1); border-left: 4px solid #ffc107; border-radius: 4px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="color: #ffc107; margin: 0; font-size: 14px;">
                      <strong>⏰ Prazo Legal:</strong> Responder em até 15 dias úteis (Art. 19, §1º da LGPD)
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Ações -->
          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <a href="mailto:${userEmail}?subject=Re: Solicitação LGPD - ${requestType}" style="display: inline-block; background-color: #ff6b35; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600;">
                Responder ao Titular
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 20px 40px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #666666; font-size: 12px; margin: 0;">
                Este email foi gerado automaticamente pelo sistema de LGPD da ${LEGAL.companyName}
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
SOLICITAÇÃO LGPD - ${requestType}

Informações do Titular:
- Nome: ${userName}
- Email: ${userEmail}

Descrição da Solicitação:
${description}

Data/Hora: ${timestamp}

PRAZO LEGAL: Responder em até 15 dias úteis (Art. 19, §1º da LGPD)

Para responder diretamente: mailto:${userEmail}

---
${LEGAL.companyName}
Sistema de LGPD
  `.trim();

  return { html, text, subject };
}
