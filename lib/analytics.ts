import { shouldLoadAnalytics } from './cookies';

/**
 * Tipos para o objeto global window.umami
 */
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
      trackView: (url: string, referrer?: string) => void;
    };
  }
}

/**
 * Verifica se o Umami está disponível
 * @returns true se window.umami está definido
 */
function isUmamiAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.umami !== 'undefined';
}

/**
 * Rastreia uma visualização de página
 * @param url URL da página (opcional, usa location.pathname como padrão)
 * @returns true se o evento foi enviado, false caso contrário
 */
export function trackPageView(url?: string): boolean {
  // Verificar consentimento
  if (!shouldLoadAnalytics()) {
    return false;
  }

  // Verificar se Umami está disponível
  if (!isUmamiAvailable()) {
    console.warn('Analytics: Umami não está carregado');
    return false;
  }

  try {
    const pageUrl = url || window.location.pathname;
    window.umami?.trackView(pageUrl, document.referrer);
    return true;
  } catch (error) {
    console.error('Analytics: Erro ao rastrear pageview:', error);
    return false;
  }
}

/**
 * Rastreia um evento customizado
 * @param eventName Nome do evento (use snake_case)
 * @param eventData Dados adicionais do evento (opcional)
 * @returns true se o evento foi enviado, false caso contrário
 */
export function trackEvent(eventName: string, eventData?: Record<string, unknown>): boolean {
  // Validar nome do evento
  if (!eventName || typeof eventName !== 'string') {
    console.warn('Analytics: Nome do evento inválido');
    return false;
  }

  // Verificar consentimento
  if (!shouldLoadAnalytics()) {
    return false;
  }

  // Verificar se Umami está disponível
  if (!isUmamiAvailable()) {
    console.warn('Analytics: Umami não está carregado');
    return false;
  }

  try {
    window.umami?.track(eventName, eventData);
    return true;
  } catch (error) {
    console.error('Analytics: Erro ao rastrear evento:', error);
    return false;
  }
}

/**
 * Eventos predefinidos para uso na aplicação
 */
export const AnalyticsEvents = {
  // Autenticação
  CADASTRO_INICIADO: 'cadastro_iniciado',
  CADASTRO_COMPLETADO: 'cadastro_completado',
  LOGIN_SUCESSO: 'login_sucesso',
  LOGOUT: 'logout',

  // Navegação
  SERVICO_VISUALIZADO: 'servico_visualizado',
  PAGINA_CONTATO_ABERTA: 'pagina_contato_aberta',
  FAQ_ACESSADA: 'faq_acessada',

  // Interações (Fase 2)
  CHAT_ABERTO: 'chat_aberto',
  CHAT_MENSAGEM_ENVIADA: 'chat_mensagem_enviada',

  // Briefing e Projetos (Fase 3)
  BRIEFING_ENVIADO: 'briefing_enviado',
  ARQUIVO_UPLOAD: 'arquivo_upload',
  PROJETO_CRIADO: 'projeto_criado',
} as const;

/**
 * Tipo para eventos de analytics
 */
export type AnalyticsEvent = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

/**
 * Verifica o status do analytics
 * Útil para debugging
 */
export function getAnalyticsStatus(): {
  consentimento: boolean;
  umamiCarregado: boolean;
  websiteId: string | undefined;
  umamiUrl: string | undefined;
} {
  return {
    consentimento: shouldLoadAnalytics(),
    umamiCarregado: isUmamiAvailable(),
    websiteId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    umamiUrl: process.env.NEXT_PUBLIC_UMAMI_URL,
  };
}
