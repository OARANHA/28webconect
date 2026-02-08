/**
 * Template de email para aviso de inatividade (11 meses sem login)
 * Design: Dark theme com identidade visual 28Web Connect
 */

export function getInactivityWarningEmailTemplate(
  name: string,
  lastLoginDate: string,
  daysUntilDeletion: number
): { html: string; text: string; subject: string } {
  const subject = '⚠️ Sua conta será excluída em breve - 28Web Connect';
  const loginUrl = `${process.env.NEXTAUTH_URL}/login`;

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
              <h1 class="title" style="color: #ff6b35; font-size: 26px; font-weight: 700; margin: 0; line-height: 1.3;">
                ⚠️ Aviso de Inatividade
              </h1>
            </td>
          </tr>
          
          <!-- Saudação -->
          <tr>
            <td align="center" style="padding: 0 40px 20px;">
              <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0;">
                Olá, ${name}!
              </p>
            </td>
          </tr>
          
          <!-- Mensagem Principal -->
          <tr>
            <td align="left" style="padding: 0 40px 20px;">
              <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 15px;">
                Notamos que você não acessa sua conta na 28Web Connect há <strong style="color: #ff8c42;">${lastLoginDate}</strong>.
              </p>
              <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 15px;">
                De acordo com nossa <strong>Política de Retenção de Dados (LGPD)</strong>, contas inativas por mais de 12 meses são automaticamente excluídas para proteger sua privacidade.
              </p>
              <p style="color: #ff6b35; font-size: 18px; font-weight: 600; line-height: 1.6; margin: 0;">
                Sua conta será excluída em aproximadamente <strong>${daysUntilDeletion} dias</strong> se você não fizer login.
              </p>
            </td>
          </tr>
          
          <!-- O que será excluído -->
          <tr>
            <td align="left" style="padding: 20px 40px;">
              <div style="background-color: rgba(255, 107, 53, 0.1); border-left: 4px solid #ff6b35; padding: 20px; border-radius: 8px;">
                <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 10px;">
                  📋 O que será excluído:
                </p>
                <ul style="color: #e0e0e0; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Dados da conta (nome, email, telefone)</li>
                  <li>Briefings e rascunhos</li>
                  <li>Projetos e arquivos</li>
                  <li>Comentários e notificações</li>
                  <li>Preferências e configurações</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Como evitar -->
          <tr>
            <td align="center" style="padding: 20px 40px;">
              <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                <strong>Como evitar a exclusão?</strong><br>
                Basta fazer login na sua conta clicando no botão abaixo:
              </p>
            </td>
          </tr>
          
          <!-- Botão CTA -->
          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <a href="${loginUrl}" class="button" style="display: inline-block; background-color: #ff6b35; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; transition: background-color 0.2s;">
                Fazer Login Agora
              </a>
            </td>
          </tr>
          
          <!-- Link alternativo -->
          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <p style="color: #999999; font-size: 14px; line-height: 1.5; margin: 0;">
                Ou copie e cole este link no seu navegador:<br>
                <a href="${loginUrl}" style="color: #ff8c42; text-decoration: underline; word-break: break-all;">${loginUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 20px 40px;">
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.1);"></div>
            </td>
          </tr>
          
          <!-- Informações LGPD -->
          <tr>
            <td align="left" style="padding: 0 40px 20px;">
              <p style="color: #888888; font-size: 13px; line-height: 1.6; margin: 0 0 10px;">
                <strong style="color: #ffffff;">Seus Direitos (LGPD):</strong>
              </p>
              <p style="color: #888888; font-size: 13px; line-height: 1.6; margin: 0;">
                Você pode solicitar a exclusão imediata ou manutenção dos seus dados entrando em contato com nosso DPO: <a href="mailto:dpo@28webconnect.com" style="color: #ff8c42; text-decoration: underline;">dpo@28webconnect.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <p style="color: #888888; font-size: 12px; line-height: 1.5; margin: 0 0 10px;">
                28Web Connect - Protegendo seus dados, impulsionando seu negócio
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
⚠️ AVISO DE INATIVIDADE - 28Web Connect

Olá, ${name}!

Notamos que você não acessa sua conta há ${lastLoginDate}.

De acordo com nossa Política de Retenção de Dados (LGPD), contas inativas por mais de 12 meses são automaticamente excluídas para proteger sua privacidade.

⚠️ SUA CONTA SERÁ EXCLUÍDA EM APROXIMADAMENTE ${daysUntilDeletion} DIAS SE VOCÊ NÃO FIZER LOGIN.

O QUE SERÁ EXCLUÍDO:
- Dados da conta (nome, email, telefone)
- Briefings e rascunhos
- Projetos e arquivos
- Comentários e notificações
- Preferências e configurações

COMO EVITAR A EXCLUSÃO?
Basta fazer login na sua conta: ${loginUrl}

SEUS DIREITOS (LGPD):
Você pode solicitar a exclusão imediata ou manutenção dos seus dados entrando em contato com nosso DPO: dpo@28webconnect.com

---
28Web Connect - Protegendo seus dados, impulsionando seu negócio
Política de Privacidade: ${process.env.NEXTAUTH_URL}/politica-privacidade
Contato: ${process.env.NEXTAUTH_URL}/contato
  `.trim();

  return { html, text, subject };
}
