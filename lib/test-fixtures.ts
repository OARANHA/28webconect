/**
 * Test Fixtures
 *
 * Reusable test data fixtures for consistent testing across the application.
 * These fixtures provide realistic test data that can be used in unit and integration tests.
 */

import {
  UserRole,
  BriefingStatus,
  ProjectStatus,
  ServiceType,
  NotificationType,
  PricingPlanFeature,
} from '@prisma/client';
import type { MockUser, MockBriefing, MockProject, MockMilestone } from './test-utils';

// ============================================================================
// USER FIXTURES
// ============================================================================

/**
 * Standard client user fixture
 */
export const clientUserFixture: Partial<MockUser> = {
  name: 'João Silva',
  email: 'joao.silva@empresa.com',
  role: UserRole.CLIENTE,
  company: 'Empresa Silva LTDA',
  phone: '(11) 98765-4321',
  marketingConsent: true,
};

/**
 * Admin user fixture
 */
export const adminUserFixture: Partial<MockUser> = {
  name: 'Maria Admin',
  email: 'admin@28webconnect.com',
  role: UserRole.ADMIN,
  company: '28Web Connect',
  phone: '(11) 99999-8888',
  marketingConsent: false,
};

/**
 * Super admin user fixture
 */
export const superAdminUserFixture: Partial<MockUser> = {
  name: 'Super Admin',
  email: 'super@28webconnect.com',
  role: UserRole.SUPER_ADMIN,
  company: '28Web Connect',
  phone: '(11) 99999-9999',
  marketingConsent: false,
};

/**
 * Unverified user fixture (email not verified)
 */
export const unverifiedUserFixture: Partial<MockUser> = {
  name: 'Usuário Não Verificado',
  email: 'naoverificado@example.com',
  role: UserRole.CLIENTE,
  emailVerified: null,
  company: 'Empresa Teste',
  phone: '(11) 91111-2222',
  marketingConsent: true,
};

/**
 * Inactive user fixture (no login for 11 months)
 */
export const inactiveUserFixture: Partial<MockUser> = {
  name: 'Usuário Inativo',
  email: 'inativo@example.com',
  role: UserRole.CLIENTE,
  lastLoginAt: new Date(Date.now() - 11 * 30 * 24 * 60 * 60 * 1000), // ~11 months ago
  company: 'Empresa Inativa',
  phone: '(11) 92222-3333',
  marketingConsent: true,
};

// ============================================================================
// BRIEFING FIXTURES
// ============================================================================

/**
 * ERP Básico briefing fixture
 */
export const erpBasicoBriefingFixture: Partial<MockBriefing> = {
  serviceType: ServiceType.ERP_BASICO,
  companyName: 'Empresa ERP Básico',
  segment: 'Varejo',
  objectives: 'Automatizar processos de estoque, vendas e financeiro',
  budget: 'R$ 10.000 - R$ 30.000',
  deadline: '2-3 meses',
  features: 'Controle de estoque, PDV, relatórios financeiros básicos',
  references: 'Sistema similar ao Tiny ERP',
  integrations: 'PagSeguro, Mercado Pago',
  additionalInfo: {
    currentSystem: 'Planilhas Excel',
    teamSize: '5-10 funcionários',
  },
  status: BriefingStatus.ENVIADO,
};

/**
 * ERP E-commerce briefing fixture
 */
export const erpEcommerceBriefingFixture: Partial<MockBriefing> = {
  serviceType: ServiceType.ERP_ECOMMERCE,
  companyName: 'Loja Virtual Plus',
  segment: 'E-commerce',
  objectives: 'Integrar loja virtual com ERP para gestão completa',
  budget: 'R$ 30.000 - R$ 80.000',
  deadline: '4-6 meses',
  features: 'Integração com marketplaces, gestão de pedidos, logística, API',
  references: 'Loja Integrada, Bling',
  integrations: 'Shopify, WooCommerce, Mercado Livre, Amazon',
  additionalInfo: {
    currentPlatform: 'Shopify',
    monthlyOrders: '1000+',
    marketplaces: ['Mercado Livre', 'Amazon', 'Magalu'],
  },
  status: BriefingStatus.ENVIADO,
};

/**
 * Approved briefing fixture
 */
export const approvedBriefingFixture: Partial<MockBriefing> = {
  ...erpBasicoBriefingFixture,
  status: BriefingStatus.APROVADO,
  reviewedAt: new Date(),
};

/**
 * Rejected briefing fixture
 */
export const rejectedBriefingFixture: Partial<MockBriefing> = {
  ...erpBasicoBriefingFixture,
  status: BriefingStatus.REJEITADO,
  rejectionReason: 'Orçamento insuficiente para o escopo solicitado',
  reviewedAt: new Date(),
};

/**
 * In analysis briefing fixture
 */
export const emAnaliseBriefingFixture: Partial<MockBriefing> = {
  ...erpBasicoBriefingFixture,
  status: BriefingStatus.EM_ANALISE,
};

// ============================================================================
// PROJECT FIXTURES
// ============================================================================

/**
 * Standard project fixture (waiting approval)
 */
export const waitingApprovalProjectFixture: Partial<MockProject> = {
  name: 'Projeto ERP - Empresa Teste',
  description: 'Sistema ERP completo para gestão empresarial',
  status: ProjectStatus.AGUARDANDO_APROVACAO,
  progress: 0,
  isContractual: true,
};

/**
 * In progress project fixture
 */
export const inProgressProjectFixture: Partial<MockProject> = {
  name: 'Projeto ERP - Em Andamento',
  description: 'Sistema ERP em desenvolvimento',
  status: ProjectStatus.EM_ANDAMENTO,
  progress: 25,
  isContractual: true,
  startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
};

/**
 * Completed project fixture
 */
export const completedProjectFixture: Partial<MockProject> = {
  name: 'Projeto ERP - Concluído',
  description: 'Sistema ERP entregue e em produção',
  status: ProjectStatus.CONCLUIDO,
  progress: 100,
  isContractual: true,
  startedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
  completedAt: new Date(),
};

// ============================================================================
// MILESTONE FIXTURES
// ============================================================================

/**
 * Standard milestones for ERP projects (4 milestones = 25% each)
 */
export const standardMilestonesFixture: Partial<MockMilestone>[] = [
  {
    title: 'Fase 1: Levantamento e Prototipagem',
    description: 'Análise de requisitos, wireframes e protótipos',
    status: 'PENDENTE',
    order: 1,
  },
  {
    title: 'Fase 2: Desenvolvimento do Core',
    description: 'Desenvolvimento das funcionalidades principais',
    status: 'PENDENTE',
    order: 2,
  },
  {
    title: 'Fase 3: Integrações e Testes',
    description: 'Integrações com APIs e testes de qualidade',
    status: 'PENDENTE',
    order: 3,
  },
  {
    title: 'Fase 4: Deploy e Treinamento',
    description: 'Publicação em produção e treinamento da equipe',
    status: 'PENDENTE',
    order: 4,
  },
];

/**
 * Milestones with first completed
 */
export const milestonesFirstCompletedFixture: Partial<MockMilestone>[] = [
  {
    ...standardMilestonesFixture[0],
    status: 'CONCLUIDA',
    completedAt: new Date(),
  },
  standardMilestonesFixture[1]!,
  standardMilestonesFixture[2]!,
  standardMilestonesFixture[3]!,
];

// ============================================================================
// PRICING PLAN FIXTURES
// ============================================================================

export const erpBasicoPlanFixture = {
  id: 'plan-erp-basico',
  name: 'ERP Básico',
  description: 'Sistema ERP completo para pequenas e médias empresas',
  serviceType: ServiceType.ERP_BASICO,
  basePrice: 15000,
  setupFee: 2500,
  monthlyFee: 299,
  storageLimit: 10, // GB
  features: [
    PricingPlanFeature.ESTOQUE,
    PricingPlanFeature.FINANCEIRO,
    PricingPlanFeature.VENDAS,
    PricingPlanFeature.RELATORIOS,
    PricingPlanFeature.SUPORTE_EMAIL,
  ] as PricingPlanFeature[],
  isActive: true,
  order: 1,
};

export const erpEcommercePlanFixture = {
  id: 'plan-erp-ecommerce',
  name: 'ERP E-commerce',
  description: 'ERP integrado com e-commerce e marketplaces',
  serviceType: ServiceType.ERP_ECOMMERCE,
  basePrice: 45000,
  setupFee: 5000,
  monthlyFee: 599,
  storageLimit: 50, // GB
  features: [
    PricingPlanFeature.ESTOQUE,
    PricingPlanFeature.FINANCEIRO,
    PricingPlanFeature.VENDAS,
    PricingPlanFeature.RELATORIOS,
    PricingPlanFeature.ECOMMERCE,
    PricingPlanFeature.MARKETPLACES,
    PricingPlanFeature.API,
    PricingPlanFeature.SUPORTE_PRIORITARIO,
  ] as PricingPlanFeature[],
  isActive: true,
  order: 2,
};

// ============================================================================
// NOTIFICATION FIXTURES
// ============================================================================

export const notificationFixtures = {
  newBriefing: {
    type: NotificationType.NOVO_BRIEFING,
    title: 'Novo Briefing Recebido! 📋',
    message: 'Um novo briefing foi enviado e está aguardando análise.',
  },
  briefingApproved: {
    type: NotificationType.BRIEFING_APROVADO,
    title: 'Briefing Aprovado! 🎉',
    message: 'Seu briefing foi aprovado e um projeto foi criado.',
  },
  briefingRejected: {
    type: NotificationType.BRIEFING_REJEITADO,
    title: 'Briefing Rejeitado',
    message: 'Seu briefing não foi aprovado neste momento.',
  },
  projectUpdated: {
    type: NotificationType.PROJETO_ATUALIZADO,
    title: 'Projeto Atualizado',
    message: 'Há novas atualizações no seu projeto.',
  },
  milestoneCompleted: {
    type: NotificationType.MILESTONE_CONCLUIDA,
    title: 'Etapa Concluída! ✅',
    message: 'Uma etapa do seu projeto foi concluída.',
  },
  newMessage: {
    type: NotificationType.NOVA_MENSAGEM,
    title: 'Nova Mensagem',
    message: 'Você recebeu uma nova mensagem.',
  },
  projectCompleted: {
    type: NotificationType.PROJETO_CONCLUIDO,
    title: 'Projeto Concluído! 🎊',
    message: 'Seu projeto foi concluído com sucesso!',
  },
};

// ============================================================================
// FILE FIXTURES
// ============================================================================

export const validFileFixtures = {
  pdf: {
    filename: 'documento.pdf',
    mimetype: 'application/pdf',
    filesize: 2 * 1024 * 1024, // 2MB
  },
  image: {
    filename: 'imagem.png',
    mimetype: 'image/png',
    filesize: 1 * 1024 * 1024, // 1MB
  },
  doc: {
    filename: 'documento.docx',
    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    filesize: 500 * 1024, // 500KB
  },
  spreadsheet: {
    filename: 'planilha.xlsx',
    mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    filesize: 300 * 1024, // 300KB
  },
};

export const invalidFileFixtures = {
  tooLarge: {
    filename: 'grande.pdf',
    mimetype: 'application/pdf',
    filesize: 150 * 1024 * 1024, // 150MB - exceeds limit
  },
  invalidType: {
    filename: 'malware.exe',
    mimetype: 'application/x-msdownload',
    filesize: 1024 * 1024, // 1MB
  },
  emptyFilename: {
    filename: '',
    mimetype: 'application/pdf',
    filesize: 1024 * 1024,
  },
};

// ============================================================================
// FORM DATA FIXTURES
// ============================================================================

export const validRegistrationFixture = {
  name: 'João Silva',
  email: 'joao.silva@empresa.com',
  password: 'SenhaSegura123!',
  company: 'Empresa Silva LTDA',
  phone: '(11) 98765-4321',
  marketingConsent: true,
};

export const invalidRegistrationFixtures = {
  shortPassword: {
    ...validRegistrationFixture,
    password: '123', // Too short
  },
  invalidEmail: {
    ...validRegistrationFixture,
    email: 'email-invalido',
  },
  missingName: {
    ...validRegistrationFixture,
    name: '',
  },
};

export const validLoginFixture = {
  email: 'joao.silva@empresa.com',
  password: 'SenhaSegura123!',
  rememberMe: false,
};

export const validBriefingFormFixture = {
  serviceType: ServiceType.ERP_BASICO,
  companyName: 'Empresa Teste',
  segment: 'Tecnologia',
  objectives: 'Criar um sistema ERP completo para gestão empresarial',
  budget: 'R$ 10.000 - R$ 50.000',
  deadline: '3 meses',
  features: 'Gestão de estoque, relatórios financeiros, controle de vendas',
  references: 'Sistema similar ao SAP Business One',
  integrations: 'API de pagamentos, WhatsApp Business',
  additionalInfo: {
    currentSystem: 'Planilhas Excel',
    teamSize: '10-20 funcionários',
  },
};

// ============================================================================
// API RESPONSE FIXTURES
// ============================================================================

export const successResponseFixture = <T>(data: T) => ({
  success: true,
  data,
});

export const errorResponseFixture = (error: string, code?: string) => ({
  success: false,
  error,
  code,
});

export const paginatedResponseFixture = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number
) => ({
  success: true,
  data: {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  },
});
