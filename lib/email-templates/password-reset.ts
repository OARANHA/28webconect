/**
 * Template de email para recuperação de senha
 * Design: Dark theme com identidade visual 28Web Connect
 */

export function getPasswordResetEmailTemplate(
  name: string,
  resetUrl: string
): { html: string; text: string; subject: string } {
  const subject = 'Redefinir Senha - 28Web Connect';

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha</title>
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
                Redefinir Senha
              </h1>
            </td>
          </tr>
          
          <!-- Descrição -->
          <tr>
            <td align="center" style="padding: 0 40px 20px;">
              <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0;">
                Olá ${name},
              </p>
            </td>
          </tr>
          
          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0;">
                Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
              </p>
            </td>
          </tr>
          
          <!-- Botão CTA -->
          <tr>
            <td align="center" style="padding: 20px 40px 30px;">
              <a href="${resetUrl}" class="button" style="display: inline-block; background-color: #ff6b35; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; transition: background-color 0.2s;">
                Redefinir Senha
              </a>
            </td>
          </tr>
          
          <!-- Link alternativo -->
          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <p style="color: #999999; font-size: 14px; line-height: 1.5; margin: 0;">
                Ou copie e cole este link no seu navegador:<br>
                <a href="${resetUrl}" style="color: #ff8c42; text-decoration: underline; word-break: break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Aviso de segurança -->
          <tr>
            <td align="center" style="padding: 0 40px 20px;">
              <div style="background-color: rgba(255, 107, 53, 0.1); border-radius: 8px; padding: 16px;">
                <p style="color: #ff8c42; font-size: 14px; margin: 0;">
                  🔒 Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Expiração -->
          <tr>
            <td align="center" style="padding: 20px 40px 20px;">
              <p style="color: #ff6b35; font-size: 14px; margin: 0;">
                ⏱️ Este link expira em 1 hora
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
                Você está recebendo este email porque solicitou a redefinição de senha em 28webconnect.com
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
Redefinir Senha - 28Web Connect

Olá ${name},

Recebemos uma solicitação para redefinir a senha da sua conta. Para criar uma nova senha, acesse o link abaixo:

${resetUrl}

🔒 Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada.

⏱️ Este link expira em 1 hora.

---
Política de Privacidade: ${process.env.NEXTAUTH_URL}/politica-privacidade
Contato: ${process.env.NEXTAUTH_URL}/contato
  `.trim();

  return { html, text, subject };
}
