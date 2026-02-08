import {
  Project,
  ProjectMilestone,
  ProjectFile,
  ProjectComment,
  ProjectStatus,
  UserRole,
  ServiceType,
} from '@prisma/client';

// Tipo de comentário com usuário incluído
export type CommentWithUser = ProjectComment & {
  user: {
    id: string;
    name: string | null;
    role: UserRole;
  };
};

// Resposta paginada de comentários
export type CommentsPaginatedResponse = {
  comments: CommentWithUser[];
  hasMore: boolean;
  nextCursor?: string;
};

// Tipo de projeto com relações populadas
export type ProjectWithRelations = Project & {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  briefing?: {
    id: string;
    serviceType: ServiceType;
    companyName: string;
  } | null;
  milestones: ProjectMilestone[];
  files: ProjectFile[];
  comments: (ProjectComment & {
    user: {
      id: string;
      name: string | null;
      role: UserRole;
    };
  })[];
  _count?: {
    files: number;
    comments: number;
  };
};

// Tipo simplificado para listagem de projetos
export type ProjectListItem = Project & {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  briefing?: {
    id: string;
    serviceType: ServiceType;
    companyName: string;
  } | null;
  milestones: ProjectMilestone[];
  _count?: {
    files: number;
    comments: number;
  };
};

// Tipo para filtros de projeto
export type ProjectFilter = 'all' | 'active' | 'completed' | 'archived';

// Interface para estatísticas de projetos
export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
}

// Tipo para criação de projeto
export type CreateProjectInput = {
  userId: string;
  briefingId?: string;
  name: string;
  description?: string;
};

// Tipo para atualização de milestone
export type UpdateMilestoneInput = {
  id: string;
  completed: boolean;
};

// Exportar enum para uso no frontend
export { ProjectStatus };
