import Mailgun from 'mailgun.js';
import FormData from 'form-data';

// Validação das variáveis de ambiente
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL || 'noreply@28webconnect.com';
const MAILGUN_FROM_NAME = process.env.MAILGUN_FROM_NAME || '28Web Connect';

if (!MAILGUN_API_KEY) {
  console.error('MAILGUN_API_KEY não configurado');
}

if (!MAILGUN_DOMAIN) {
  console.error('MAILGUN_DOMAIN não configurado');
}

// Inicializar cliente Mailgun
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: MAILGUN_API_KEY || '',
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Envia um email usando Mailgun
 * @param params Parâmetros do email
 * @returns Resultado da operação
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se variáveis estão configuradas
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      console.error('Mailgun não configurado corretamente');
      return {
        success: false,
        error: 'Serviço de email não configurado',
      };
    }

    const result = await mg.messages.create(MAILGUN_DOMAIN, {
      from: `${MAILGUN_FROM_NAME} <${MAILGUN_FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
      text,
    });

    console.log('Email enviado com sucesso:', result.id);
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email:', error);

    // Tratamento específico de erros
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return {
          success: false,
          error: 'Erro de autenticação com serviço de email',
        };
      }
      if (error.message.includes('404')) {
        return {
          success: false,
          error: 'Domínio não encontrado no Mailgun',
        };
      }
      if (error.message.includes('429')) {
        return {
          success: false,
          error: 'Limite de envio excedido. Tente novamente mais tarde',
        };
      }
    }

    return {
      success: false,
      error: 'Erro ao enviar email. Tente novamente',
    };
  }
}

/**
 * Verifica se o serviço de email está configurado
 * @returns true se configurado
 */
export function isEmailServiceConfigured(): boolean {
  return !!MAILGUN_API_KEY && !!MAILGUN_DOMAIN;
}
