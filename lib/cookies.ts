import type { CookiePreferences, CookieConsent } from '@/types/cookies';

// Re-exportar tipos para uso em outros módulos
export type { CookiePreferences, CookieConsent };

const COOKIE_CONSENT_KEY = 'cookie-consent';

/**
 * Obtém o consentimento de cookies do localStorage
 * @returns CookieConsent ou null se não existir
 */
export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as CookieConsent;
    return parsed;
  } catch (error) {
    console.error('Erro ao ler cookie consent:', error);
    return null;
  }
}

/**
 * Salva as preferências de cookies no localStorage
 * @param preferences Preferências de cookies a serem salvas
 */
export function setCookieConsent(preferences: Omit<CookiePreferences, 'timestamp'>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const consent: CookieConsent = {
      hasConsented: true,
      preferences: {
        ...preferences,
        essenciais: true, // Sempre ativo
        timestamp: Date.now(),
      },
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  } catch (error) {
    console.error('Erro ao salvar cookie consent:', error);
  }
}

/**
 * Verifica se o usuário já deu consentimento
 * @returns true se já consentiu
 */
export function hasUserConsented(): boolean {
  const consent = getCookieConsent();
  return consent?.hasConsented ?? false;
}

/**
 * Aceita todas as categorias de cookies
 */
export function acceptAllCookies(): void {
  setCookieConsent({
    essenciais: true,
    analytics: true,
    funcionais: true,
  });
}

/**
 * Aceita apenas cookies essenciais (rejeita não-essenciais)
 */
export function rejectNonEssentialCookies(): void {
  setCookieConsent({
    essenciais: true,
    analytics: false,
    funcionais: false,
  });
}

/**
 * Verifica se pode carregar analytics (Umami)
 * @returns true se usuário consentiu analytics
 */
export function shouldLoadAnalytics(): boolean {
  const consent = getCookieConsent();
  if (!consent?.hasConsented) return false;
  return consent.preferences.analytics ?? false;
}

/**
 * Verifica se pode carregar chat IA
 * @returns true se usuário consentiu funcionais
 */
export function shouldLoadChat(): boolean {
  const consent = getCookieConsent();
  if (!consent?.hasConsented) return false;
  return consent.preferences.funcionais ?? false;
}

/**
 * Obtém as preferências atuais ou valores padrão
 * @returns CookiePreferences
 */
export function getCurrentPreferences(): CookiePreferences {
  const consent = getCookieConsent();

  if (consent?.hasConsented) {
    return consent.preferences;
  }

  // Valores padrão (antes do consentimento: apenas essenciais)
  return {
    essenciais: true,
    analytics: false,
    funcionais: false,
    timestamp: 0,
  };
}

/**
 * Remove o consentimento (para testes ou reset)
 */
export function clearCookieConsent(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  } catch (error) {
    console.error('Erro ao limpar cookie consent:', error);
  }
}
