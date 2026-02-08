import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllBriefings,
  getBriefingById,
  approveBriefing,
  rejectBriefing,
  updateBriefingStatus,
} from '../admin-briefings';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { BriefingStatus, ProjectStatus } from '@prisma/client';

// Mocks
vi.mocked(auth);
vi.mocked(prisma.briefing.findMany);
vi.mocked(prisma.briefing.findUnique);
vi.mocked(prisma.briefing.count);
vi.mocked(prisma.briefing.update);
vi.mocked(prisma.project.create);
vi.mocked(prisma.projectMilestone.createMany);
vi.mocked(createNotification);

describe('Admin Briefings Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllBriefings', () => {
    it('should return all briefings with stats', async () => {
      const mockBriefings = [
        {
          id: 'briefing-1',
          serviceType: 'ERP_BASICO',
          companyName: 'Empresa Teste',
          status: 'ENVIADO',
          createdAt: new Date(),
          submittedAt: new Date(),
          user: {
            id: 'user-1',
            name: 'João Silva',
            email: 'joao@example.com',
            company: 'Empresa Teste',
          },
          project: null,
        },
      ];

      vi.mocked(prisma.briefing.findMany).mockResolvedValue(mockBriefings as any);
      vi.mocked(prisma.briefing.count).mockResolvedValue(1);

      const result = await getAllBriefings();

      expect(result.success).toBe(true);
      expect(result.data?.briefings).toHaveLength(1);
      expect(result.data?.stats.total).toBe(1);
      expect(prisma.briefing.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should filter briefings by status', async () => {
      const mockBriefings = [
        {
          id: 'briefing-1',
          serviceType: 'ERP_BASICO',
          companyName: 'Empresa Teste',
          status: 'APROVADO',
          createdAt: new Date(),
          submittedAt: new Date(),
          user: {
            id: 'user-1',
            name: 'João Silva',
            email: 'joao@example.com',
            company: 'Empresa Teste',
          },
          project: null,
        },
      ];

      vi.mocked(prisma.briefing.findMany).mockResolvedValue(mockBriefings as any);
      vi.mocked(prisma.briefing.count).mockResolvedValue(1);

      const result = await getAllBriefings({ status: 'APROVADO' });

      expect(result.success).toBe(true);
      expect(result.data?.briefings).toHaveLength(1);
      expect(prisma.briefing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'APROVADO' },
        })
      );
    });

    it('should filter briefings by search term', async () => {
      vi.mocked(prisma.briefing.findMany).mockResolvedValue([]);
      vi.mocked(prisma.briefing.count).mockResolvedValue(0);

      await getAllBriefings({ searchTerm: 'empresa xyz' });

      expect(prisma.briefing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      );
    });

    it('should filter briefings by date range', async () => {
      vi.mocked(prisma.briefing.findMany).mockResolvedValue([]);
      vi.mocked(prisma.briefing.count).mockResolvedValue(0);

      const dateFrom = new Date('2024-01-01');
      const dateTo = new Date('2024-12-31');

      await getAllBriefings({ dateFrom, dateTo });

      expect(prisma.briefing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          }),
        })
      );
    });

    it('should return error on database failure', async () => {
      vi.mocked(prisma.briefing.findMany).mockRejectedValue(new Error('DB Error'));

      const result = await getAllBriefings();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro ao buscar briefings. Tente novamente.');
    });
  });

  describe('getBriefingById', () => {
    it('should return briefing by id with relations', async () => {
      const mockBriefing = {
        id: 'briefing-1',
        serviceType: 'ERP_BASICO',
        companyName: 'Empresa Teste',
        status: 'ENVIADO',
        segment: 'Tecnologia',
        objectives: 'Criar um sistema ERP',
        budget: 'R$ 10.000',
        deadline: '3 meses',
        features: null,
        references: null,
        integrations: null,
        additionalInfo: null,
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        submittedAt: new Date(),
        reviewedAt: null,
        userId: 'user-1',
        projectId: null,
        user: {
          id: 'user-1',
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '(11) 99999-9999',
          company: 'Empresa Teste',
        },
        project: null,
      };

      vi.mocked(prisma.briefing.findUnique).mockResolvedValue(mockBriefing as any);

      const result = await getBriefingById('briefing-1');

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('briefing-1');
      expect(result.data?.user.email).toBe('joao@example.com');
    });

    it('should return error for invalid briefing id', async () => {
      const result = await getBriefingById('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('ID de briefing inválido');
    });

    it('should return error when briefing not found', async () => {
      vi.mocked(prisma.briefing.findUnique).mockResolvedValue(null);

      const result = await getBriefingById('cuid1234567890123456789012');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Briefing não encontrado');
    });
  });

  describe('approveBriefing', () => {
    it('should approve briefing and create project with milestones', async () => {
      const mockSession = { user: { id: 'admin-1' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const mockBriefing = {
        id: 'briefing-1',
        userId: 'user-1',
        companyName: 'Empresa Teste',
        objectives: 'Criar um sistema ERP',
        status: 'ENVIADO',
        projectId: null,
        user: {
          id: 'user-1',
          email: 'joao@example.com',
          name: 'João',
        },
      };

      const mockProject = {
        id: 'project-1',
        name: 'Empresa Teste',
        description: 'Criar um sistema ERP',
        status: ProjectStatus.AGUARDANDO_APROVACAO,
        userId: 'user-1',
        briefingId: 'briefing-1',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: null,
        completedAt: null,
      };

      vi.mocked(prisma.briefing.findUnique).mockResolvedValue(mockBriefing as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return await callback({
          briefing: { update: vi.fn().mockResolvedValue({}) },
          project: { create: vi.fn().mockResolvedValue(mockProject) },
          projectMilestone: { createMany: vi.fn().mockResolvedValue({ count: 4 }) },
        });
      });
      vi.mocked(createNotification).mockResolvedValue({ success: true });

      const result = await approveBriefing('briefing-1');

      expect(result.success).toBe(true);
      expect(result.data?.projectId).toBe('project-1');
      expect(createNotification).toHaveBeenCalledWith({
        userId: 'user-1',
        type: 'BRIEFING_APROVADO',
        title: 'Briefing Aprovado! 🎉',
        message: expect.stringContaining('Empresa Teste'),
        channels: ['IN_APP', 'EMAIL', 'PUSH'],
        metadata: {
          briefingId: 'briefing-1',
          projectId: 'project-1',
          companyName: 'Empresa Teste',
        },
      });
    });

    it('should return error when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await approveBriefing('briefing-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Não autenticado');
    });

    it('should return error for invalid briefing id', async () => {
      const mockSession = { user: { id: 'admin-1' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const result = await approveBriefing('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('ID de briefing inválido');
    });

    it('should return error when briefing not found', async () => {
      const mockSession = { user: { id: 'admin-1' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.briefing.findUnique).mockResolvedValue(null);

      const result = await approveBriefing('cuid1234567890123456789012');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Briefing não encontrado');
    });

    it('should return error when briefing already approved', async () => {
      const mockSession = { user: { id: 'admin-1' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const mockBriefing = {
        id: 'briefing-1',
        status: 'APROVADO',
        projectId: null,
        user: { id: 'user-1' },
      };

      vi.mocked(prisma.briefing.findUnique).mockResolvedValue(mockBriefing as any);

      const result = await approveBriefing('briefing-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('não pode ser aprovado');
    });

    it('should return error when briefing already has project', async () => {
      const mockSession = { user: { id: 'admin-1' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const mockBriefing = {
        id: 'briefing-1',
        status: 'ENVIADO',
        projectId: 'project-existing',
        user: { id: 'user-1' },
      };

      vi.mocked(prisma.briefing.findUnique).mockResolvedValue(mockBriefing as any);

      const result = await approveBriefing('briefing-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Este briefing já possui um projeto vinculado');
    });
  });

  describe('rejectBriefing', () => {
    it('should reject briefing with valid reason', async () => {
      const mockSession = { user: { id: 'admin-1' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const mockBriefing = {
        id: 'briefing-1',
        userId: 'user-1',
        companyName: 'Empresa Teste',
        status: 'ENVIADO',
        user: {
          id: 'user-1',
          email: 'joao@example.com',
          name: 'João',
        },
      };

      vi.mocked(prisma.briefing.findUnique).mockResolvedValue(mockBriefing as any);
      vi.mocked(prisma.briefing.update).mockResolvedValue({} as any);
      vi.mocked(createNotification).mockResolvedValue({ success: true });

      const result = await rejectBriefing(
        'briefing-1',
        'Orçamento insuficiente para o escopo solicitado'
      );

      expect(result.success).toBe(true);
      expect(prisma.briefing.update).toHaveBeenCalledWith({
        where: { id: 'briefing-1' },
        data: {
          status: 'REJEITADO',
          rejectionReason: 'Orçamento insuficiente para o escopo solicitado',
          reviewedAt: expect.any(Date),
        },
      });
      expect(createNotification).toHaveBeenCalledWith({
        userId: 'user-1',
        type: 'BRIEFING_REJEITADO',
        title: 'Briefing Rejeitado',
        message: expect.stringContaining('Orçamento insuficiente'),
        channels: ['IN_APP', 'EMAIL', 'PUSH'],
        metadata: {
          briefingId: 'briefing-1',
          rejectionReason: 'Orçamento insuficiente para o escopo solicitado',
          companyName: 'Empresa Teste',
        },
      });
    });

    it('should return error when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await rejectBriefing('briefing-1', 'Motivo válido aqui');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Não autenticado');
    });

    it('should return error for reason too short', async () => {
      const mockSession = { user: { id: 'admin-1' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const result = await rejectBriefing('briefing-1', 'Curto');

      expect(result.success).toBe(false);
      expect(result.error).toContain('mínimo 10 caracteres');
    });

    it('should return error for reason too long', async () => {
      const mockSession = { user: { id: 'admin-1' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const longReason = 'a'.repeat(501);
      const result = await rejectBriefing('briefing-1', longReason);

      expect(result.success).toBe(false);
      expect(result.error).toContain('máximo 500 caracteres');
    });

    it('should return error when briefing not found', async () => {
      const mockSession = { user: { id: 'admin-1' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.briefing.findUnique).mockResolvedValue(null);

      const result = await rejectBriefing(
        'cuid1234567890123456789012',
        'Motivo válido aqui suficiente'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Briefing não encontrado');
    });

    it('should return error when briefing already approved', async () => {
      const mockSession = { user: { id: 'admin-1' } };
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const mockBriefing = {
        id: 'briefing-1',
        status: 'APROVADO',
        user: { id: 'user-1' },
      };

      vi.mocked(prisma.briefing.findUnique).mockResolvedValue(mockBriefing as any);

      const result = await rejectBriefing('briefing-1', 'Motivo válido aqui suficiente');

      expect(result.success).toBe(false);
      expect(result.error).toContain('não pode ser rejeitado');
    });
  });

  describe('updateBriefingStatus', () => {
    it('should update status from ENVIADO to EM_ANALISE', async () => {
      const mockBriefing = {
        id: 'briefing-1',
        status: 'ENVIADO' as BriefingStatus,
        submittedAt: new Date(),
      };

      vi.mocked(prisma.briefing.findUnique).mockResolvedValue(mockBriefing as any);
      vi.mocked(prisma.briefing.update).mockResolvedValue({} as any);

      const result = await updateBriefingStatus('briefing-1', 'EM_ANALISE');

      expect(result.success).toBe(true);
      expect(prisma.briefing.update).toHaveBeenCalledWith({
        where: { id: 'briefing-1' },
        data: {
          status: 'EM_ANALISE',
          updatedAt: expect.any(Date),
          submittedAt: expect.any(Date),
        },
      });
    });

    it('should return error when trying to approve directly', async () => {
      const result = await updateBriefingStatus('briefing-1', 'APROVADO');

      expect(result.success).toBe(false);
      expect(result.error).toContain('ações específicas');
    });

    it('should return error for invalid status transition', async () => {
      const mockBriefing = {
        id: 'briefing-1',
        status: 'APROVADO' as BriefingStatus,
        submittedAt: new Date(),
      };

      vi.mocked(prisma.briefing.findUnique).mockResolvedValue(mockBriefing as any);

      const result = await updateBriefingStatus('briefing-1', 'ENVIADO');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Transição de status inválida');
    });
  });
});
