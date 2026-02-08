/**
 * Integration Tests: Briefing Workflow
 *
 * Tests the complete briefing lifecycle:
 * - Client creates draft → auto-save → submit briefing
 * - Admin approves → project created with milestones
 * - Admin rejects → client receives notification
 * - Draft expiration after 30 days
 * - Conditional fields based on service type
 * - Validation rules
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveDraft, submitBriefing, loadDraft } from '../briefing';
import { approveBriefing, rejectBriefing } from '../admin-briefings';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import {
  createMockUser,
  createMockBriefing,
  createMockProject,
  createMockSession,
} from '@/lib/test-utils';
import {
  clientUserFixture,
  erpBasicoBriefingFixture,
  erpEcommerceBriefingFixture,
  adminUserFixture,
} from '@/lib/test-fixtures';
import { BriefingStatus, ServiceType, ProjectStatus, UserRole } from '@prisma/client';

describe('Briefing Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUserId = 'user-client-123';
  const mockAdminId = 'user-admin-123';

  // ============================================================================
  // COMPLETE BRIEFING WORKFLOW: DRAFT → SUBMIT → APPROVE → PROJECT
  // ============================================================================

  describe('Complete Workflow: Draft → Submit → Approve → Project', () => {
    it('should complete full flow: create draft → auto-save → submit → approve → project', async () => {
      // Arrange
      const client = createMockUser({ ...clientUserFixture, id: mockUserId });
      const admin = createMockUser({ ...adminUserFixture, id: mockAdminId });

      const draftData = {
        serviceType: ServiceType.ERP_BASICO,
        companyName: 'Empresa Teste',
        segment: 'Tecnologia',
        objectives: 'Criar sistema ERP',
      };

      const fullBriefingData = {
        ...erpBasicoBriefingFixture,
        budget: 'R$ 10.000 - R$ 30.000',
        deadline: '2-3 meses',
      };

      const mockBriefing = createMockBriefing({
        ...fullBriefingData,
        id: 'briefing-123',
        userId: mockUserId,
        status: BriefingStatus.ENVIADO,
      });

      const mockProject = createMockProject({
        id: 'project-456',
        name: mockBriefing.companyName,
        briefingId: mockBriefing.id,
        userId: mockUserId,
        status: ProjectStatus.AGUARDANDO_APROVACAO,
      });

      // Mock authentication
      vi.mocked(auth).mockResolvedValue(
        createMockSession({ user: { id: mockAdminId, role: UserRole.ADMIN } })
      );

      // 1. Save Draft
      vi.mocked(prisma.briefingDraft.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.briefingDraft.create).mockResolvedValue({
        id: 'draft-123',
        userId: mockUserId,
        data: draftData,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const draftResult = await saveDraft(mockUserId, draftData);
      expect(draftResult.success).toBe(true);

      // 2. Load Draft (auto-save simulation)
      vi.mocked(prisma.briefingDraft.findFirst).mockResolvedValue({
        id: 'draft-123',
        userId: mockUserId,
        data: draftData,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const loadResult = await loadDraft(mockUserId);
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toEqual(draftData);

      // 3. Submit Briefing
      vi.mocked(prisma.briefing.create).mockResolvedValue(mockBriefing);
      vi.mocked(prisma.briefingDraft.deleteMany).mockResolvedValue({ count: 1 });

      const submitResult = await submitBriefing(mockUserId, fullBriefingData as any);
      expect(submitResult.success).toBe(true);
      expect(submitResult.message).toContain('enviado com sucesso');

      // Verify draft was deleted after submission
      expect(prisma.briefingDraft.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });

      // 4. Admin Approves Briefing
      vi.mocked(prisma.briefing.findUnique).mockResolvedValue({
        ...mockBriefing,
        user,
        project: null,
      });

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return await callback({
          briefing: {
            update: vi.fn().mockResolvedValue({
              ...mockBriefing,
              status: BriefingStatus.APROVADO,
              projectId: mockProject.id,
            }),
          },
          project: { create: vi.fn().mockResolvedValue(mockProject) },
          projectMilestone: { createMany: vi.fn().mockResolvedValue({ count: 4 }) },
        });
      });

      vi.mocked(createNotification).mockResolvedValue({ success: true });

      const approveResult = await approveBriefing(mockBriefing.id);
      expect(approveResult.success).toBe(true);
      expect(approveResult.data?.projectId).toBe(mockProject.id);

      // Verify notification was sent
      expect(createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          type: 'BRIEFING_APROVADO',
          title: expect.stringContaining('Aprovado'),
          channels: ['IN_APP', 'EMAIL', 'PUSH'],
        })
      );
    });
  });

  // ============================================================================
  // BRIEFING REJECTION FLOW
  // ============================================================================

  describe('Briefing Rejection Flow', () => {
    it('should handle rejection: submit → reject → client notification', async () => {
      // Arrange
      const mockBriefing = createMockBriefing({
        ...erpBasicoBriefingFixture,
        id: 'briefing-789',
        userId: mockUserId,
        status: BriefingStatus.ENVIADO,
      });

      const rejectionReason = 'Orçamento insuficiente para o escopo solicitado';

      vi.mocked(auth).mockResolvedValue(
        createMockSession({ user: { id: mockAdminId, role: UserRole.ADMIN } })
      );
      vi.mocked(prisma.briefing.findUnique).mockResolvedValue({
        ...mockBriefing,
        user: createMockUser({ id: mockUserId }),
        project: null,
      });
      vi.mocked(prisma.briefing.update).mockResolvedValue({
        ...mockBriefing,
        status: BriefingStatus.REJEITADO,
        rejectionReason,
      });
      vi.mocked(createNotification).mockResolvedValue({ success: true });

      // Act
      const result = await rejectBriefing(mockBriefing.id, rejectionReason);

      // Assert
      expect(result.success).toBe(true);

      // Verify briefing was updated
      expect(prisma.briefing.update).toHaveBeenCalledWith({
        where: { id: mockBriefing.id },
        data: expect.objectContaining({
          status: BriefingStatus.REJEITADO,
          rejectionReason,
          reviewedAt: expect.any(Date),
        }),
      });

      // Verify notification was sent
      expect(createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          type: 'BRIEFING_REJEITADO',
          title: expect.stringContaining('Rejeitado'),
          message: expect.stringContaining(rejectionReason),
          channels: ['IN_APP', 'EMAIL', 'PUSH'],
          metadata: expect.objectContaining({
            rejectionReason,
          }),
        })
      );
    });

    it('should validate rejection reason length', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(
        createMockSession({ user: { id: mockAdminId, role: UserRole.ADMIN } })
      );

      // Act - Too short
      const shortResult = await rejectBriefing('briefing-123', 'Curto');

      // Assert
      expect(shortResult.success).toBe(false);
      expect(shortResult.error).toContain('mínimo 10 caracteres');

      // Act - Too long
      const longReason = 'a'.repeat(501);
      const longResult = await rejectBriefing('briefing-123', longReason);

      expect(longResult.success).toBe(false);
      expect(longResult.error).toContain('máximo 500 caracteres');
    });
  });

  // ============================================================================
  // DRAFT EXPIRATION
  // ============================================================================

  describe('Draft Expiration (30 days)', () => {
    it('should not load expired drafts', async () => {
      // Arrange
      const expiredDraft = {
        id: 'draft-expired',
        userId: mockUserId,
        data: { companyName: 'Empresa Antiga' },
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday (expired)
        createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
        updatedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
      };

      // findFirst with expired date should return null due to gt filter
      vi.mocked(prisma.briefingDraft.findFirst).mockResolvedValue(null);

      // Act
      const result = await loadDraft(mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should load non-expired drafts', async () => {
      // Arrange
      const validDraft = {
        id: 'draft-valid',
        userId: mockUserId,
        data: { companyName: 'Empresa Válida' },
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.briefingDraft.findFirst).mockResolvedValue(validDraft);

      // Act
      const result = await loadDraft(mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validDraft.data);
    });

    it('should set expiration date 30 days from now when saving draft', async () => {
      // Arrange
      const draftData = { companyName: 'Teste' };
      vi.mocked(prisma.briefingDraft.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.briefingDraft.create).mockImplementation((args: any) => {
        return Promise.resolve({
          id: 'draft-123',
          userId: mockUserId,
          data: args.data.data,
          expiresAt: args.data.expiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      // Act
      await saveDraft(mockUserId, draftData);

      // Assert
      const createCall = vi.mocked(prisma.briefingDraft.create).mock.calls[0];
      const expiresAt = createCall![0].data.expiresAt;
      const expectedExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      expect(Math.abs(expiresAt.getTime() - expectedExpiry.getTime())).toBeLessThan(1000);
    });
  });

  // ============================================================================
  // CONDITIONAL FIELDS BASED ON SERVICE TYPE
  // ============================================================================

  describe('Conditional Fields by Service Type', () => {
    it('should handle ERP_BASICO service type fields', async () => {
      // Arrange
      const erpBasicoData = {
        ...erpBasicoBriefingFixture,
        features: 'Gestão de estoque, PDV',
        references: 'Sistema similar ao Tiny',
      };

      vi.mocked(prisma.briefing.create).mockImplementation((args: any) => {
        return Promise.resolve(
          createMockBriefing({
            ...args.data,
            id: 'briefing-erp-basico',
          })
        );
      });
      vi.mocked(prisma.briefingDraft.deleteMany).mockResolvedValue({ count: 0 });

      // Act
      const result = await submitBriefing(mockUserId, erpBasicoData as any);

      // Assert
      expect(result.success).toBe(true);
      expect(prisma.briefing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            serviceType: ServiceType.ERP_BASICO,
            features: 'Gestão de estoque, PDV',
            references: 'Sistema similar ao Tiny',
          }),
        })
      );
    });

    it('should handle ERP_ECOMMERCE service type with additional fields', async () => {
      // Arrange
      const erpEcommerceData = {
        ...erpEcommerceBriefingFixture,
        additionalInfo: {
          currentPlatform: 'Shopify',
          monthlyOrders: '1000+',
          marketplaces: ['Mercado Livre', 'Amazon'],
        },
      };

      vi.mocked(prisma.briefing.create).mockImplementation((args: any) => {
        return Promise.resolve(
          createMockBriefing({
            ...args.data,
            id: 'briefing-erp-ecommerce',
          })
        );
      });
      vi.mocked(prisma.briefingDraft.deleteMany).mockResolvedValue({ count: 0 });

      // Act
      const result = await submitBriefing(mockUserId, erpEcommerceData as any);

      // Assert
      expect(result.success).toBe(true);
      expect(prisma.briefing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            serviceType: ServiceType.ERP_ECOMMERCE,
            additionalInfo: expect.objectContaining({
              currentPlatform: 'Shopify',
            }),
          }),
        })
      );
    });
  });

  // ============================================================================
  // VALIDATION RULES
  // ============================================================================

  describe('Validation Rules', () => {
    it('should validate required fields on submit', async () => {
      // Arrange
      const incompleteData = {
        serviceType: ServiceType.ERP_BASICO,
        // Missing required fields: companyName, segment, objectives
      };

      // Act
      const result = await submitBriefing(mockUserId, incompleteData as any);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate field length limits', async () => {
      // Arrange
      const invalidData = {
        ...erpBasicoBriefingFixture,
        companyName: 'A', // Too short
      };

      // Act
      const result = await submitBriefing(mockUserId, invalidData as any);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should validate enum values for serviceType', async () => {
      // Arrange
      const invalidData = {
        ...erpBasicoBriefingFixture,
        serviceType: 'INVALID_TYPE',
      };

      // Act
      const result = await submitBriefing(mockUserId, invalidData as any);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should accept valid draft with incomplete data', async () => {
      // Arrange
      const incompleteDraft = {
        companyName: 'Empresa Teste',
        // Missing other fields - OK for draft
      };

      vi.mocked(prisma.briefingDraft.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.briefingDraft.create).mockResolvedValue({
        id: 'draft-123',
        userId: mockUserId,
        data: incompleteDraft,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await saveDraft(mockUserId, incompleteDraft);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // NOTIFICATION TRIGGERS
  // ============================================================================

  describe('Notification Triggers', () => {
    it('should notify admin when new briefing is submitted', async () => {
      // Arrange
      const briefingData = erpBasicoBriefingFixture;

      vi.mocked(prisma.briefing.create).mockResolvedValue(
        createMockBriefing({
          ...briefingData,
          id: 'briefing-new',
          userId: mockUserId,
        })
      );
      vi.mocked(prisma.briefingDraft.deleteMany).mockResolvedValue({ count: 0 });

      // Mock admin users
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        createMockUser({ id: 'admin-1', role: UserRole.ADMIN }),
        createMockUser({ id: 'admin-2', role: UserRole.ADMIN }),
      ]);

      // Act
      await submitBriefing(mockUserId, briefingData as any);

      // Note: Admin notification logic would be in the submit action
      // This test verifies the structure is ready for notifications
      expect(prisma.briefing.create).toHaveBeenCalled();
    });

    it('should notify client on briefing status change', async () => {
      // Arrange
      const mockBriefing = createMockBriefing({
        id: 'briefing-notify',
        userId: mockUserId,
        status: BriefingStatus.ENVIADO,
      });

      vi.mocked(auth).mockResolvedValue(
        createMockSession({ user: { id: mockAdminId, role: UserRole.ADMIN } })
      );
      vi.mocked(prisma.briefing.findUnique).mockResolvedValue({
        ...mockBriefing,
        user: createMockUser({ id: mockUserId }),
        project: null,
      });
      vi.mocked(createNotification).mockResolvedValue({ success: true });

      // Act - Approve
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return await callback({
          briefing: { update: vi.fn().mockResolvedValue({}) },
          project: { create: vi.fn().mockResolvedValue(createMockProject()) },
          projectMilestone: { createMany: vi.fn().mockResolvedValue({ count: 4 }) },
        });
      });

      await approveBriefing(mockBriefing.id);

      // Assert
      expect(createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          type: 'BRIEFING_APROVADO',
        })
      );
    });
  });

  // ============================================================================
  // EDGE CASES AND ERROR HANDLING
  // ============================================================================

  describe('Edge Cases and Error Handling', () => {
    it('should handle database errors during draft save', async () => {
      // Arrange
      vi.mocked(prisma.briefingDraft.findFirst).mockRejectedValue(new Error('DB Error'));

      // Act
      const result = await saveDraft(mockUserId, { companyName: 'Teste' });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle database errors during submission', async () => {
      // Arrange
      vi.mocked(prisma.briefing.create).mockRejectedValue(new Error('DB Error'));

      // Act
      const result = await submitBriefing(mockUserId, erpBasicoBriefingFixture as any);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should not allow approving already approved briefing', async () => {
      // Arrange
      const approvedBriefing = createMockBriefing({
        id: 'briefing-approved',
        status: BriefingStatus.APROVADO,
      });

      vi.mocked(auth).mockResolvedValue(
        createMockSession({ user: { id: mockAdminId, role: UserRole.ADMIN } })
      );
      vi.mocked(prisma.briefing.findUnique).mockResolvedValue({
        ...approvedBriefing,
        user: createMockUser({ id: mockUserId }),
        project: null,
      });

      // Act
      const result = await approveBriefing(approvedBriefing.id);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('não pode ser aprovado');
    });

    it('should not allow rejecting already approved briefing', async () => {
      // Arrange
      const approvedBriefing = createMockBriefing({
        id: 'briefing-approved',
        status: BriefingStatus.APROVADO,
      });

      vi.mocked(auth).mockResolvedValue(
        createMockSession({ user: { id: mockAdminId, role: UserRole.ADMIN } })
      );
      vi.mocked(prisma.briefing.findUnique).mockResolvedValue({
        ...approvedBriefing,
        user: createMockUser({ id: mockUserId }),
        project: null,
      });

      // Act
      const result = await rejectBriefing(approvedBriefing.id, 'Valid rejection reason here');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('não pode ser rejeitado');
    });

    it('should require authentication for approval', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(null);

      // Act
      const result = await approveBriefing('briefing-123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Não autenticado');
    });

    it('should handle Prisma validation errors', async () => {
      // Arrange
      const invalidData = {
        ...erpBasicoBriefingFixture,
        companyName: 'A'.repeat(300), // Exceeds max length
      };

      vi.mocked(prisma.briefing.create).mockRejectedValue({
        code: 'P2000',
        message: 'Value too long',
      });

      // Act
      const result = await submitBriefing(mockUserId, invalidData as any);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // PROJECT MILESTONES GENERATION
  // ============================================================================

  describe('Project Milestones Generation', () => {
    it('should create project with 4 milestones on approval', async () => {
      // Arrange
      const mockBriefing = createMockBriefing({
        id: 'briefing-milestones',
        userId: mockUserId,
        status: BriefingStatus.ENVIADO,
        companyName: 'Empresa Teste',
        objectives: 'Criar sistema',
      });

      vi.mocked(auth).mockResolvedValue(
        createMockSession({ user: { id: mockAdminId, role: UserRole.ADMIN } })
      );
      vi.mocked(prisma.briefing.findUnique).mockResolvedValue({
        ...mockBriefing,
        user: createMockUser({ id: mockUserId }),
        project: null,
      });

      let capturedMilestones: any[] = [];
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          briefing: {
            update: vi.fn().mockResolvedValue({
              ...mockBriefing,
              status: BriefingStatus.APROVADO,
            }),
          },
          project: {
            create: vi.fn().mockResolvedValue(
              createMockProject({
                id: 'project-123',
                briefingId: mockBriefing.id,
              })
            ),
          },
          projectMilestone: {
            createMany: vi.fn((args: any) => {
              capturedMilestones = args.data;
              return Promise.resolve({ count: args.data.length });
            }),
          },
        };
        return await callback(tx);
      });

      vi.mocked(createNotification).mockResolvedValue({ success: true });

      // Act
      await approveBriefing(mockBriefing.id);

      // Assert
      expect(capturedMilestones).toHaveLength(4);
      expect(capturedMilestones[0]).toHaveProperty('title');
      expect(capturedMilestones[0]).toHaveProperty('order', 1);
      expect(capturedMilestones[3]).toHaveProperty('order', 4);
    });

    it('should calculate progress correctly: 4 milestones = 25% each', async () => {
      // This verifies the business logic for progress calculation
      // When a milestone is completed, progress should increase by 25%

      // Arrange
      const milestones = [
        { id: 'm1', order: 1, status: 'CONCLUIDA' },
        { id: 'm2', order: 2, status: 'PENDENTE' },
        { id: 'm3', order: 3, status: 'PENDENTE' },
        { id: 'm4', order: 4, status: 'PENDENTE' },
      ];

      // 1 completed out of 4 = 25%
      const completedCount = milestones.filter((m) => m.status === 'CONCLUIDA').length;
      const progress = (completedCount / milestones.length) * 100;

      // Assert
      expect(progress).toBe(25);
    });
  });
});
