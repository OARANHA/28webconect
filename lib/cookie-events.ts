/**
 * Sistema de eventos global para gerenciamento de cookies
 * Permite abrir o modal/banner de cookies de qualquer lugar da aplicação
 */

const COOKIE_SETTINGS_EVENT = 'open-cookie-settings';
const COOKIE_BANNER_EVENT = 'show-cookie-banner';

/**
 * Abre o modal de configurações de cookies
 */
export function openCookieSettings(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT));
  }
}

/**
 * Mostra o banner de cookies novamente
 */
export function showCookieBanner(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COOKIE_BANNER_EVENT));
  }
}

/**
 * Subscreve ao evento de abrir configurações
 * @param callback Função a ser chamada quando o evento for disparado
 * @returns Função para cancelar a subscrição
 */
export function onOpenCookieSettings(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener(COOKIE_SETTINGS_EVENT, handler);

  return () => {
    window.removeEventListener(COOKIE_SETTINGS_EVENT, handler);
  };
}

/**
 * Subscreve ao evento de mostrar banner
 * @param callback Função a ser chamada quando o evento for disparado
 * @returns Função para cancelar a subscrição
 */
export function onShowCookieBanner(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener(COOKIE_BANNER_EVENT, handler);

  return () => {
    window.removeEventListener(COOKIE_BANNER_EVENT, handler);
  };
}
