import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllProjects,
  getProjectByIdAdmin,
  updateProjectStatus,
  toggleMilestone,
  addProjectNote,
  getProjectStats,
} from '../admin-projects';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { ProjectStatus } from '@prisma/client';

// Mocks
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    projectMilestone: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
    projectComment: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/lib/notifications', () => ({
  createNotification: vi.fn(),
}));

describe('Admin Projects Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllProjects', () => {
    it('should return all projects with stats', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Projeto Teste',
          status: 'ATIVO',
          progress: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-1',
            name: 'João Silva',
            email: 'joao@example.com',
            company: 'Empresa Teste',
          },
          briefing: {
            id: 'briefing-1',
            serviceType: 'ERP_BASICO',
            companyName: 'Empresa Teste',
          },
          milestones: [],
          _count: { files: 2, comments: 3 },
        },
      ];

      vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects as any);
      vi.mocked(prisma.project.count).mockResolvedValue(1);

      const result = await getAllProjects();

      expect(result.success).toBe(true);
      expect(result.data?.projects).toHaveLength(1);
      expect(result.data?.stats.total).toBe(1);
    });

    it('should filter projects by status', async () => {
      vi.mocked(prisma.project.findMany).mockResolvedValue([]);
      vi.mocked(prisma.project.count).mockResolvedValue(0);

      await getAllProjects({ status: 'ATIVO' });

      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'ATIVO' },
        })
      );
    });

    it('should filter projects by search term', async () => {
      vi.mocked(prisma.project.findMany).mockResolvedValue([]);
      vi.mocked(prisma.project.count).mockResolvedValue(0);

      await getAllProjects({ searchTerm: 'projeto teste' });

      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      );
    });

    it('should return error on database failure', async () => {
      vi.mocked(prisma.project.findMany).mockRejectedValue(new Error('DB Error'));

      const result = await getAllProjects();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro ao buscar projetos. Tente novamente.');
    });
  });

  describe('getProjectByIdAdmin', () => {
    it('should return project with all relations', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Projeto Teste',
        status: 'ATIVO',
        user: {
          id: 'user-1',
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '(11) 99999-9999',
          company: 'Empresa Teste',
        },
        briefing: null,
        milestones: [],
        files: [],
        comments: [],
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);

      const result = await getProjectByIdAdmin('project-1');

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Projeto Teste');
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        include: expect.any(Object),
      });
    });

    it('should return error for invalid project id', async () => {
      const result = await getProjectByIdAdmin('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('ID de projeto inválido');
    });

    it('should return error when project not found', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      const result = await getProjectByIdAdmin('cuid1234567890123456789012');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Projeto não encontrado');
    });
  });

  describe('updateProjectStatus', () => {
    it('should update status with valid transition', async () => {
      const mockSession = { user: { id: 'admin-1' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const mockProject = {
        id: 'project-1',
        status: 'AGUARDANDO_APROVACAO',
        name: 'Projeto Teste',
        userId: 'user-1',
        startedAt: null,
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);
      vi.mocked(prisma.project.update).mockResolvedValue({} as any);

      const result = await updateProjectStatus('project-1', 'ATIVO');

      expect(result.success).toBe(true);
      expect(result.data?.oldStatus).toBe('AGUARDANDO_APROVACAO');
      expect(result.data?.newStatus).toBe('ATIVO');
    });

    it('should set startedAt when activating project', async () => {
      const mockSession = { user: { id: 'admin-1', role: 'ADMIN' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const mockProject = {
        id: 'project-1',
        status: 'AGUARDANDO_APROVACAO',
        name: 'Projeto Teste',
        userId: 'user-1',
        startedAt: null,
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);
      vi.mocked(prisma.project.update).mockResolvedValue({} as any);

      await updateProjectStatus('project-1', 'ATIVO');

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: expect.objectContaining({
          status: 'ATIVO',
          startedAt: expect.any(Date),
        }),
      });
    });

    it('should send notification when completing project', async () => {
      const mockSession = { user: { id: 'admin-1', role: 'ADMIN' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const mockProject = {
        id: 'project-1',
        status: 'ATIVO',
        name: 'Projeto Teste',
        userId: 'user-1',
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);
      vi.mocked(prisma.project.update).mockResolvedValue({} as any);
      vi.mocked(createNotification).mockResolvedValue({ success: true });

      const result = await updateProjectStatus('project-1', 'CONCLUIDO');

      expect(result.success).toBe(true);
      expect(createNotification).toHaveBeenCalledWith({
        userId: 'user-1',
        type: 'PROJETO_CONCLUIDO',
        title: 'Projeto Concluído! 🚀',
        message: expect.stringContaining('Projeto Teste'),
        channels: ['IN_APP', 'EMAIL', 'PUSH'],
        metadata: expect.any(Object),
      });
    });

    it('should return error when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await updateProjectStatus('project-1', 'ATIVO');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Não autenticado');
    });

    it('should return error when user is not admin', async () => {
      const mockSession = { user: { id: 'user-1', role: 'CLIENTE' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const result = await updateProjectStatus('project-1', 'ATIVO');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Acesso negado');
    });

    it('should return error for invalid transition', async () => {
      const mockSession = { user: { id: 'admin-1', role: 'ADMIN' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const mockProject = {
        id: 'project-1',
        status: 'CANCELADO',
        name: 'Projeto Teste',
        userId: 'user-1',
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);

      const result = await updateProjectStatus('project-1', 'ATIVO');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Transição de status inválida');
    });
  });

  describe('toggleMilestone', () => {
    it('should toggle milestone and recalculate progress', async () => {
      const mockSession = { user: { id: 'admin-1', role: 'ADMIN' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const mockMilestone = {
        id: 'milestone-1',
        projectId: 'project-1',
        name: 'Planejamento',
        completed: false,
        project: {
          id: 'project-1',
          name: 'Projeto Teste',
          userId: 'user-1',
        },
      };

      const mockMilestones = [
        { id: 'milestone-1', completed: true, order: 1 },
        { id: 'milestone-2', completed: false, order: 2 },
        { id: 'milestone-3', completed: false, order: 3 },
        { id: 'milestone-4', completed: false, order: 4 },
      ];

      vi.mocked(prisma.projectMilestone.findUnique).mockResolvedValue(mockMilestone as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return await callback({
          projectMilestone: {
            update: vi.fn().mockResolvedValue({}),
            findMany: vi.fn().mockResolvedValue(mockMilestones),
          },
          project: { update: vi.fn().mockResolvedValue({}) },
        });
      });
      vi.mocked(createNotification).mockResolvedValue({ success: true });

      // Mock para retornar milestones atualizados
      const result = await toggleMilestone('milestone-1', true);

      // Verificar que a função retornou sucesso
      expect(result.success).toBe(true);
    });

    it('should return error when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await toggleMilestone('milestone-1', true);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Não autenticado');
    });

    it('should return error when user is not admin', async () => {
      const mockSession = { user: { id: 'user-1', role: 'CLIENTE' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const result = await toggleMilestone('milestone-1', true);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Acesso negado');
    });

    it('should return error when milestone not found', async () => {
      const mockSession = { user: { id: 'admin-1', role: 'ADMIN' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.projectMilestone.findUnique).mockResolvedValue(null);

      const result = await toggleMilestone('milestone-1', true);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Milestone não encontrada');
    });
  });

  describe('addProjectNote', () => {
    it('should add note and send notification', async () => {
      const mockSession = { user: { id: 'admin-1', role: 'ADMIN' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const mockProject = {
        id: 'project-1',
        name: 'Projeto Teste',
        userId: 'user-1',
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);
      vi.mocked(prisma.projectComment.create).mockResolvedValue({} as any);
      vi.mocked(prisma.project.update).mockResolvedValue({} as any);
      vi.mocked(createNotification).mockResolvedValue({ success: true });

      const result = await addProjectNote('project-1', 'Esta é uma nota de teste para o projeto');

      expect(result.success).toBe(true);
      expect(prisma.projectComment.create).toHaveBeenCalledWith({
        data: {
          projectId: 'project-1',
          userId: 'admin-1',
          content: 'Esta é uma nota de teste para o projeto',
        },
      });
      expect(createNotification).toHaveBeenCalled();
    });

    it('should return error when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await addProjectNote('project-1', 'Nota de teste');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Não autenticado');
    });

    it('should return error when user is not admin', async () => {
      const mockSession = { user: { id: 'user-1', role: 'CLIENTE' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const result = await addProjectNote('project-1', 'Nota de teste válida');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Acesso negado');
    });

    it('should return error for content too short', async () => {
      const mockSession = { user: { id: 'admin-1', role: 'ADMIN' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const result = await addProjectNote('project-1', 'Curto');

      expect(result.success).toBe(false);
      expect(result.error).toContain('mínimo 10 caracteres');
    });

    it('should return error when project not found', async () => {
      const mockSession = { user: { id: 'admin-1', role: 'ADMIN' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      const result = await addProjectNote('project-1', 'Nota de teste válida');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Projeto não encontrado');
    });
  });

  describe('getProjectStats', () => {
    it('should return global project statistics', async () => {
      vi.mocked(prisma.project.count).mockResolvedValue(10);
      vi.mocked(prisma.project.findMany).mockResolvedValue([
        { startedAt: new Date('2024-01-01'), completedAt: new Date('2024-01-15') },
        { startedAt: new Date('2024-02-01'), completedAt: new Date('2024-02-20') },
      ] as any);

      const result = await getProjectStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('total');
      expect(result.data).toHaveProperty('ativos');
      expect(result.data).toHaveProperty('concluidosEsteMes');
      expect(result.data).toHaveProperty('taxaConclusao');
      expect(result.data).toHaveProperty('tempoMedioConclusao');
    });

    it('should return error on database failure', async () => {
      vi.mocked(prisma.project.count).mockRejectedValue(new Error('DB Error'));

      const result = await getProjectStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro ao buscar estatísticas. Tente novamente.');
    });
  });
});
