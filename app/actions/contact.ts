'use server';

import { z } from 'zod';
import { sendEmail } from '@/lib/email';

const contactSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  subject: z.string().min(5, 'Assunto deve ter no mínimo 5 caracteres'),
  message: z
    .string()
    .min(10, 'Mensagem deve ter no mínimo 10 caracteres')
    .max(5000, 'Mensagem muito longa'),
});

interface ContactFormResponse {
  success: boolean;
  error?: string;
}

/**
 * Server Action para envio de formulário de contato
 * Envia email para a equipe com as informações do formulário
 */
export async function sendContactForm(formData: FormData): Promise<ContactFormResponse> {
  try {
    // Extrair dados do FormData
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    // Validar dados com Zod
    const validation = contactSchema.safeParse(data);
    if (!validation.success) {
      const errors = validation.error.issues
        .map((issue: { message: string }) => issue.message)
        .join(', ');
      return {
        success: false,
        error: errors,
      };
    }

    const { name, email, subject, message } = validation.data;

    // Sanitização básica (prevenir XSS)
    const sanitizedName = name.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    const sanitizedSubject = subject.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ''
    );
    const sanitizedMessage = message.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ''
    );

    // Email da equipe (padrão ou variável de ambiente)
    const contactEmail = process.env.CONTACT_EMAIL || 'contato@28webconnect.com';

    // Criar template HTML do email
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Mensagem de Contato</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0f0f0f; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 15px; }
    .field-label { font-weight: bold; color: #ff6b35; margin-bottom: 5px; }
    .field-value { background: #fff; padding: 10px; border-radius: 4px; border-left: 3px solid #ff6b35; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Nova Mensagem de Contato</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">Nome:</div>
        <div class="field-value">${sanitizedName}</div>
      </div>
      <div class="field">
        <div class="field-label">Email:</div>
        <div class="field-value"><a href="mailto:${email}">${email}</a></div>
      </div>
      <div class="field">
        <div class="field-label">Assunto:</div>
        <div class="field-value">${sanitizedSubject}</div>
      </div>
      <div class="field">
        <div class="field-label">Mensagem:</div>
        <div class="field-value" style="white-space: pre-wrap;">${sanitizedMessage}</div>
      </div>
      <div class="footer">
        <p>Enviado em: ${new Date().toLocaleString('pt-BR')}</p>
        <p>Formulário de contato - 28Web Connect</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Versão texto plano
    const text = `
Nova Mensagem de Contato - 28Web Connect

Nome: ${sanitizedName}
Email: ${email}
Assunto: ${sanitizedSubject}
Mensagem:
${sanitizedMessage}

---
Enviado em: ${new Date().toLocaleString('pt-BR')}
    `.trim();

    // Enviar email
    const emailResult = await sendEmail({
      to: contactEmail,
      subject: `[Contato Site] ${sanitizedSubject}`,
      html,
      text,
    });

    if (!emailResult.success) {
      console.error('Erro ao enviar email de contato:', emailResult.error);
      return {
        success: false,
        error: 'Erro ao enviar mensagem. O serviço de email pode estar indisponível.',
      };
    }

    // Log da tentativa (para analytics/auditoria)
    console.log(`Contato recebido de ${email} em ${new Date().toISOString()}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erro no sendContactForm:', error);
    return {
      success: false,
      error: 'Erro inesperado ao processar formulário. Tente novamente mais tarde.',
    };
  }
}
