/**
 * Tipos TypeScript para gerenciamento de cookies e preferências de privacidade
 */

/** Categorias de cookies disponíveis */
export type CookieCategory = 'essenciais' | 'analytics' | 'funcionais';

/** Interface das preferências de cookies */
export interface CookiePreferences {
  /** Cookies essenciais - sempre true, necessários para funcionamento do site */
  essenciais: boolean;
  /** Cookies de analytics - requer consentimento */
  analytics: boolean;
  /** Cookies funcionais - requer consentimento */
  funcionais: boolean;
  /** Timestamp de quando o consentimento foi salvo */
  timestamp: number;
}

/** Interface completa do consentimento de cookies */
export interface CookieConsent {
  /** Indica se o usuário já deu algum tipo de consentimento */
  hasConsented: boolean;
  /** Preferências de cookies do usuário */
  preferences: CookiePreferences;
}

/** Configuração de uma categoria de cookie */
export interface CookieCategoryConfig {
  /** Nome da categoria */
  name: string;
  /** Descrição da categoria */
  description: string;
  /** Se é obrigatório (não pode ser desabilitado) */
  required: boolean;
  /** Cookies incluídos nesta categoria */
  cookies?: CookieDefinition[];
}

/** Definição de um cookie específico */
export interface CookieDefinition {
  /** Nome do cookie */
  name: string;
  /** Tipo do cookie */
  type: string;
  /** Finalidade do cookie */
  purpose: string;
  /** Duração do cookie */
  duration: string;
  /** Provedor do cookie */
  provider: string;
}
