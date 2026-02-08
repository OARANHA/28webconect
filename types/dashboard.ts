import { UserRole } from './index';

/**
 * Item de navegação do dashboard
 */
export type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresRole?: UserRole[];
};

/**
 * Estatísticas do dashboard
 */
export type DashboardStats = {
  projectsActive: number;
  briefingsSent: number;
  messagesUnread: number;
};

/**
 * Props do usuário para componentes do dashboard
 */
export type DashboardUser = {
  name: string | null;
  email: string;
  role: UserRole | string;
  emailVerified?: Date | null;
};

/**
 * Estado de um projeto
 */
export type ProjectStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * Resumo de projeto para lista
 */
export type ProjectSummary = {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  lastUpdated: Date;
};
