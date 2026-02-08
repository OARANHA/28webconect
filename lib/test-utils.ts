/**
 * Test Utilities
 *
 * Helper functions for creating mock data in tests.
 * Use these functions to ensure consistency across test files.
 */

import {
  UserRole,
  BriefingStatus,
  ProjectStatus,
  ServiceType,
  NotificationType,
  NotificationChannel,
} from '@prisma/client';

/**
 * Creates a mock user for testing
 * @param overrides - Optional properties to override defaults
 * @returns Mock user object
 *
 * @example
 * const user = createMockUser({ name: 'John Doe' });
 */
export function createMockUser(overrides?: Partial<MockUser>): MockUser {
  return {
    id: 'user-' + Math.random().toString(36).substring(2, 11),
    name: 'Usuário Teste',
    email: 'teste@example.com',
    emailVerified: new Date(),
    password: '$2a$12$hashedpasswordhere',
    role: UserRole.CLIENTE,
    company: 'Empresa Teste',
    phone: '(11) 99999-9999',
    marketingConsent: true,
    lastLoginAt: new Date(),
    warningSentAt: null,
    doNotDelete: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock session for testing
 * @param overrides - Optional properties to override defaults
 * @returns Mock session object
 *
 * @example
 * const session = createMockSession({ user: { role: UserRole.ADMIN } });
 */
export function createMockSession(overrides?: Partial<MockSession>): MockSession {
  const user = createMockUser(overrides?.user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      ...overrides?.user,
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

/**
 * Creates a mock briefing for testing
 * @param overrides - Optional properties to override defaults
 * @returns Mock briefing object
 *
 * @example
 * const briefing = createMockBriefing({ status: BriefingStatus.APROVADO });
 */
export function createMockBriefing(overrides?: Partial<MockBriefing>): MockBriefing {
  const id = 'briefing-' + Math.random().toString(36).substring(2, 11);

  return {
    id,
    userId: 'user-' + Math.random().toString(36).substring(2, 11),
    projectId: null,
    serviceType: ServiceType.ERP_BASICO,
    companyName: 'Empresa Teste',
    segment: 'Tecnologia',
    objectives: 'Criar um sistema ERP completo',
    budget: 'R$ 10.000 - R$ 50.000',
    deadline: '3 meses',
    features: 'Gestão de estoque, relatórios financeiros',
    references: 'Sistema similar ao SAP',
    integrations: 'API de pagamentos, WhatsApp Business',
    additionalInfo: { notes: 'Informações adicionais' },
    status: BriefingStatus.ENVIADO,
    rejectionReason: null,
    submittedAt: new Date(),
    reviewedAt: null,
    isContractual: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: createMockUser(),
    project: null,
    ...overrides,
  };
}

/**
 * Creates a mock project for testing
 * @param overrides - Optional properties to override defaults
 * @returns Mock project object
 *
 * @example
 * const project = createMockProject({ status: ProjectStatus.EM_ANDAMENTO });
 */
export function createMockProject(overrides?: Partial<MockProject>): MockProject {
  const id = 'project-' + Math.random().toString(36).substring(2, 11);

  return {
    id,
    name: 'Projeto Teste',
    description: 'Descrição do projeto de teste',
    status: ProjectStatus.AGUARDANDO_APROVACAO,
    progress: 0,
    userId: 'user-' + Math.random().toString(36).substring(2, 11),
    briefingId: 'briefing-' + Math.random().toString(36).substring(2, 11),
    isContractual: true,
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: createMockUser(),
    briefing: createMockBriefing(),
    milestones: [],
    files: [],
    comments: [],
    ...overrides,
  };
}

/**
 * Creates a mock project milestone for testing
 * @param overrides - Optional properties to override defaults
 * @returns Mock milestone object
 */
export function createMockMilestone(overrides?: Partial<MockMilestone>): MockMilestone {
  return {
    id: 'milestone-' + Math.random().toString(36).substring(2, 11),
    projectId: 'project-' + Math.random().toString(36).substring(2, 11),
    title: 'Etapa de Teste',
    description: 'Descrição da etapa',
    status: 'PENDENTE',
    order: 1,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock notification for testing
 * @param overrides - Optional properties to override defaults
 * @returns Mock notification object
 */
export function createMockNotification(overrides?: Partial<MockNotification>): MockNotification {
  return {
    id: 'notification-' + Math.random().toString(36).substring(2, 11),
    userId: 'user-' + Math.random().toString(36).substring(2, 11),
    type: NotificationType.SISTEMA,
    title: 'Notificação de Teste',
    message: 'Esta é uma notificação de teste',
    channel: NotificationChannel.IN_APP,
    read: false,
    metadata: {},
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock project file for testing
 * @param overrides - Optional properties to override defaults
 * @returns Mock project file object
 */
export function createMockProjectFile(overrides?: Partial<MockProjectFile>): MockProjectFile {
  return {
    id: 'file-' + Math.random().toString(36).substring(2, 11),
    projectId: 'project-' + Math.random().toString(36).substring(2, 11),
    userId: 'user-' + Math.random().toString(36).substring(2, 11),
    milestoneId: null,
    filename: 'documento.pdf',
    filepath: 'uploads/projects/project-123/documento.pdf',
    filesize: 1024 * 1024, // 1MB
    mimetype: 'application/pdf',
    description: null,
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock verification token for testing
 * @param overrides - Optional properties to override defaults
 * @returns Mock verification token object
 */
export function createMockVerificationToken(
  overrides?: Partial<MockVerificationToken>
): MockVerificationToken {
  return {
    identifier: 'test@example.com',
    token: 'token-' + Math.random().toString(36).substring(2, 15),
    type: 'VERIFICATION',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    createdAt: new Date(),
    ...overrides,
  };
}

// Type definitions for mock objects
export interface MockUser {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  password: string | null;
  role: UserRole;
  company: string | null;
  phone: string | null;
  marketingConsent: boolean;
  lastLoginAt: Date | null;
  warningSentAt: Date | null;
  doNotDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockSession {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
    emailVerified: Date | null;
  };
  expires: string;
}

export interface MockBriefing {
  id: string;
  userId: string;
  projectId: string | null;
  serviceType: ServiceType;
  companyName: string;
  segment: string;
  objectives: string;
  budget: string | null;
  deadline: string | null;
  features: string | null;
  references: string | null;
  integrations: string | null;
  additionalInfo: Record<string, unknown> | null;
  status: BriefingStatus;
  rejectionReason: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  isContractual: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: MockUser;
  project: MockProject | null;
}

export interface MockProject {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  progress: number;
  userId: string;
  briefingId: string;
  isContractual: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: MockUser;
  briefing: MockBriefing;
  milestones: MockMilestone[];
  files: MockProjectFile[];
  comments: unknown[];
}

export interface MockMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  order: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  read: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface MockProjectFile {
  id: string;
  projectId: string;
  userId: string;
  milestoneId: string | null;
  filename: string;
  filepath: string;
  filesize: number;
  mimetype: string;
  description: string | null;
  createdAt: Date;
}

export interface MockVerificationToken {
  identifier: string;
  token: string;
  type: string;
  expires: Date;
  createdAt: Date;
}

/**
 * Utility to create a mock date with offset from now
 * @param days - Number of days to offset (negative for past, positive for future)
 * @returns Date object
 */
export function mockDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Utility to create a mock date with months offset from now
 * @param months - Number of months to offset (negative for past, positive for future)
 * @returns Date object
 */
export function mockDateMonths(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}

/**
 * Utility to create a mock date with years offset from now
 * @param years - Number of years to offset (negative for past, positive for future)
 * @returns Date object
 */
export function mockDateYears(years: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return date;
}
