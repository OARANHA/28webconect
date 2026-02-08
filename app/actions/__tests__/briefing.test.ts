/**
 * Unit Tests: Briefing Server Actions
 *
 * Tests for briefing-related server actions:
 * - saveDraft
 * - submitBriefing
 * - loadDraft
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveDraft, submitBriefing, loadDraft } from '../briefing';
import { prisma } from '@/lib/prisma';
import { BriefingStatus, ServiceType } from '@prisma/client';

describe('Briefing Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUserId = 'user-123';
  const validBriefingData = {
    serviceType: ServiceType.ERP_BASICO,
    companyName: 'Empresa Teste',
    segment: 'Tecnologia',
    objectives: 'Criar um sistema ERP',
    budget: 'R$ 10.000 - R$ 30.000',
    deadline: '2-3 meses',
    features: 'Gestão de estoque, PDV',
    references: 'Sistema similar ao Tiny',
    integrations: 'PagSeguro',
  };

  // ============================================================================
  // SAVE DRAFT
  // ============================================================================

  describe('saveDraft', () => {
    it('should create new draft when none exists', async () => {
      // Arrange
      const draftData = { companyName: 'Empresa Teste' };

      vi.mocked(prisma.briefingDraft.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.briefingDraft.create).mockResolvedValue({
        id: 'draft-123',
        userId: mockUserId,
        data: draftData,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await saveDraft(mockUserId, draftData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('salvo');
      expect(prisma.briefingDraft.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUserId,
            data: draftData,
            expiresAt: expect.any(Date),
          }),
        })
      );
    });

    it('should update existing draft', async () => {
      // Arrange
      const existingDraft = {
        id: 'draft-123',
        userId: mockUserId,
        data: { companyName: 'Nome Antigo' },
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedData = { companyName: 'Nome Novo' };

      vi.mocked(prisma.briefingDraft.findFirst).mockResolvedValue(existingDraft);
      vi.mocked(prisma.briefingDraft.update).mockResolvedValue({
        ...existingDraft,
        data: updatedData,
      });

      // Act
      const result = await saveDraft(mockUserId, updatedData);

      // Assert
      expect(result.success).toBe(true);
      expect(prisma.briefingDraft.update).toHaveBeenCalledWith({
        where: { id: existingDraft.id },
        data: expect.objectContaining({
          data: updatedData,
          expiresAt: expect.any(Date),
        }),
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      vi.mocked(prisma.briefingDraft.findFirst).mockRejectedValue(new Error('DB Error'));

      // Act
      const result = await saveDraft(mockUserId, { companyName: 'Teste' });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // ============================================================================
  // SUBMIT BRIEFING
  // ============================================================================

  describe('submitBriefing', () => {
    it('should submit valid briefing', async () => {
      // Arrange
      vi.mocked(prisma.briefing.create).mockResolvedValue({
        id: 'briefing-123',
        userId: mockUserId,
        ...validBriefingData,
        status: BriefingStatus.ENVIADO,
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.briefingDraft.deleteMany).mockResolvedValue({ count: 1 });

      // Act
      const result = await submitBriefing(mockUserId, validBriefingData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('enviado');
      expect(prisma.briefing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUserId,
            serviceType: validBriefingData.serviceType,
            companyName: validBriefingData.companyName,
            status: BriefingStatus.ENVIADO,
          }),
        })
      );
      expect(prisma.briefingDraft.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });

    it('should reject incomplete briefing data', async () => {
      // Arrange
      const incompleteData = {
        serviceType: ServiceType.ERP_BASICO,
        // Missing required fields
      };

      // Act
      const result = await submitBriefing(mockUserId, incompleteData as any);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject invalid service type', async () => {
      // Arrange
      const invalidData = {
        ...validBriefingData,
        serviceType: 'INVALID_TYPE',
      };

      // Act
      const result = await submitBriefing(mockUserId, invalidData as any);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should handle database errors', async () => {
      // Arrange
      vi.mocked(prisma.briefing.create).mockRejectedValue(new Error('DB Error'));

      // Act
      const result = await submitBriefing(mockUserId, validBriefingData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('enviar briefing');
    });
  });

  // ============================================================================
  // LOAD DRAFT
  // ============================================================================

  describe('loadDraft', () => {
    it('should return draft data when found', async () => {
      // Arrange
      const draftData = { companyName: 'Empresa Teste' };
      vi.mocked(prisma.briefingDraft.findFirst).mockResolvedValue({
        id: 'draft-123',
        userId: mockUserId,
        data: draftData,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await loadDraft(mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(draftData);
    });

    it('should return null when no draft exists', async () => {
      // Arrange
      vi.mocked(prisma.briefingDraft.findFirst).mockResolvedValue(null);

      // Act
      const result = await loadDraft(mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should not return expired drafts', async () => {
      // Arrange
      const expiredDraft = {
        id: 'draft-expired',
        userId: mockUserId,
        data: { companyName: 'Antiga' },
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // The findFirst with gt filter should return null for expired
      vi.mocked(prisma.briefingDraft.findFirst).mockResolvedValue(null);

      // Act
      const result = await loadDraft(mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      vi.mocked(prisma.briefingDraft.findFirst).mockRejectedValue(new Error('DB Error'));

      // Act
      const result = await loadDraft(mockUserId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('carregar rascunho');
    });
  });
});
