/**
 * Template de email para verificação de conta
 * Design: Dark theme com identidade visual 28Web Connect
 */

export function getVerificationEmailTemplate(
  name: string,
  verificationUrl: string
): { html: string; text: string; subject: string } {
  const subject = 'Verifique seu email - 28Web Connect';

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificação de Email</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .title { font-size: 24px !important; }
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
              <h1 class="title" style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; line-height: 1.3;">
                Bem-vindo à 28Web Connect, ${name}!
              </h1>
            </td>
          </tr>
          
          <!-- Descrição -->
          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0;">
                Obrigado por se cadastrar! Clique no botão abaixo para verificar seu email e ativar sua conta.
              </p>
            </td>
          </tr>
          
          <!-- Botão CTA -->
          <tr>
            <td align="center" style="padding: 20px 40px 30px;">
              <a href="${verificationUrl}" class="button" style="display: inline-block; background-color: #ff6b35; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; transition: background-color 0.2s;">
                Verificar Email
              </a>
            </td>
          </tr>
          
          <!-- Link alternativo -->
          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <p style="color: #999999; font-size: 14px; line-height: 1.5; margin: 0;">
                Ou copie e cole este link no seu navegador:<br>
                <a href="${verificationUrl}" style="color: #ff8c42; text-decoration: underline; word-break: break-all;">${verificationUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Expiração -->
          <tr>
            <td align="center" style="padding: 0 40px 20px;">
              <p style="color: #ff6b35; font-size: 14px; margin: 0;">
                ⚠️ Este link expira em 24 horas
              </p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 20px 40px;">
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.1);"></div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <p style="color: #888888; font-size: 12px; line-height: 1.5; margin: 0 0 10px;">
                Você está recebendo este email porque criou uma conta em 28webconnect.com
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
Bem-vindo à 28Web Connect, ${name}!

Obrigado por se cadastrar! Para verificar seu email e ativar sua conta, acesse o link abaixo:

${verificationUrl}

Este link expira em 24 horas.

Se você não criou uma conta em 28webconnect.com, ignore este email.

---
Política de Privacidade: ${process.env.NEXTAUTH_URL}/politica-privacidade
Contato: ${process.env.NEXTAUTH_URL}/contato
  `.trim();

  return { html, text, subject };
}
