import { UserRole, BriefingStatus, ProjectStatus, ServiceType } from '@prisma/client';

/**
 * Cliente com estatísticas agregadas para listagem
 */
export interface AdminClientListItem {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
  lastLoginAt: Date | null;
  emailVerified: Date | null;
  _count: {
    briefings: number;
    projects: number;
  };
  projects: {
    status: ProjectStatus;
  }[];
}

/**
 * Cliente completo com histórico detalhado
 */
export interface AdminClientWithHistory {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  emailVerified: Date | null;
  image: string | null;
  briefings: {
    id: string;
    serviceType: ServiceType;
    companyName: string;
    status: BriefingStatus;
    createdAt: Date;
    submittedAt: Date | null;
    project: {
      id: string;
      name: string;
      status: ProjectStatus;
    } | null;
  }[];
  projects: {
    id: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
    progress: number;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
    milestones: {
      id: string;
      name: string;
      completed: boolean;
    }[];
    _count: {
      files: number;
      comments: number;
    };
  }[];
  projectComments: {
    id: string;
    content: string;
    createdAt: Date;
    project: {
      id: string;
      name: string;
    };
  }[];
  projectFiles: {
    id: string;
    filename: string;
    mimetype: string;
    filesize: number;
    uploadedAt: Date;
    project: {
      id: string;
      name: string;
    };
  }[];
}

/**
 * Filtros para listagem de clientes
 */
export interface AdminClientFilters {
  status?: 'active' | 'inactive';
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Estatísticas gerais de clientes
 */
export interface AdminClientStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

/**
 * Dados para gráfico de leads por mês
 */
export interface LeadsByMonth {
  month: string;
  count: number;
}

/**
 * Dados para gráfico de conversão por serviço
 */
export interface ConversionByService {
  serviceType: string;
  briefings: number;
  aprovados: number;
  taxa: number;
}

/**
 * Dados para gráfico de projetos por status
 */
export interface ProjectsByStatus {
  status: ProjectStatus;
  count: number;
}

/**
 * Métricas do dashboard administrativo
 */
export interface AdminMetrics {
  leads: {
    current: number;
    previous: number;
    variation: number;
  };
  conversions: {
    current: number;
    previous: number;
    variation: number;
  };
  activeProjects: {
    current: number;
    previous: number;
    variation: number;
  };
  estimatedRevenue: {
    current: number;
    previous: number;
    variation: number;
  };
  leadsByMonth: LeadsByMonth[];
  conversionByService: ConversionByService[];
  projectsByStatus: ProjectsByStatus[];
}

/**
 * Resposta padrão para actions de admin
 */
export interface AdminClientActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Dados para exportação CSV
 */
export interface ClientCSVData {
  nome: string;
  email: string;
  empresa: string;
  telefone: string;
  dataCadastro: string;
  ultimoLogin: string;
  totalBriefings: number;
  projetosAtivos: number;
}
