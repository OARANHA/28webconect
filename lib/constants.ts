// Blog categories
export const blogCategories = [
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'negocios', label: 'Negócios' },
  { value: 'tutoriais', label: 'Tutoriais' },
  { value: 'novidades', label: 'Novidades' },
  { value: 'cases', label: 'Cases' },
];

// Project categories
export const projectCategories = [
  { value: 'erp', label: 'ERP' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'landing-page', label: 'Landing Page' },
  { value: 'sistema-customizado', label: 'Sistema Customizado' },
  { value: 'app-mobile', label: 'Aplicativo Mobile' },
  { value: 'integracao', label: 'Integração' },
];

// Post statuses
export const postStatuses = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
];

// User roles
export const userRoles = [
  { value: 'CLIENTE', label: 'Cliente' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
];

// Cookies list for policy page
export const COOKIES_LIST = [
  {
    name: 'next-auth.session-token',
    type: 'Essencial',
    purpose: 'Autenticação e sessão de usuário',
    duration: 'Session',
    provider: '28Web Connect',
  },
  {
    name: 'next-auth.csrf-token',
    type: 'Essencial',
    purpose: 'Proteção CSRF (Cross-Site Request Forgery)',
    duration: 'Session',
    provider: '28Web Connect',
  },
  {
    name: 'cookie_consent',
    type: 'Essencial',
    purpose: 'Armazenar consentimento de cookies',
    duration: '1 ano',
    provider: '28Web Connect',
  },
  {
    name: 'umami_id',
    type: 'Analytics',
    purpose: 'Identificador único para analytics (anônimo)',
    duration: '2 anos',
    provider: 'Umami Analytics',
  },
  {
    name: 'chat_history',
    type: 'Funcional',
    purpose: 'Histórico de conversas do Chat IA',
    duration: '30 dias',
    provider: '28Web Connect',
  },
  {
    name: 'user_preferences',
    type: 'Funcional',
    purpose: 'Preferências de UI e notificações',
    duration: '1 ano',
    provider: '28Web Connect',
  },
] as const;

// Cookie help links for browser documentation
export const COOKIE_HELP_LINKS = {
  chrome: 'https://support.google.com/chrome/answer/95647?hl=pt-BR',
  firefox: 'https://support.mozilla.org/pt-BR/kb/cookies-information-websites-store',
  safari: 'https://support.apple.com/pt-br/guide/safari/sfri11471/mac',
  edge: 'https://support.microsoft.com/pt-br/microsoft-edge/delete-cookies-5e3b578c-641c-4f8c-5374-2ae536c2a597',
} as const;

// Legal information for LGPD compliance
export const LEGAL = {
  companyName: '28Web Connect',
  companyEmail: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'contato@28webconnect.com',
  dpoEmail: process.env.NEXT_PUBLIC_DPO_EMAIL || 'dpo@28webconnect.com',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://28webconnect.com',
  lastUpdated: '04 de Fevereiro de 2026',
} as const;
