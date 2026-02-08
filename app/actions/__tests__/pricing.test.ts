/**
 * Unit Tests: Pricing Server Actions
 *
 * Tests for pricing-related server actions:
 * - getPricingPlans
 * - getAllPricingPlans
 * - updatePlan
 * - createPlan
 * - togglePlanActive
 * - reorderPlans
 * - hasActiveClients
 * - countActiveClients
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPricingPlans,
  getAllPricingPlans,
  updatePlan,
  createPlan,
  togglePlanActive,
  reorderPlans,
  hasActiveClients,
  countActiveClients,
} from '../pricing';
import { prisma } from '@/lib/prisma';
import { ServiceType, BriefingStatus, PricingPlanFeature } from '@prisma/client';

describe('Pricing Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPlan = {
    id: 'plan-123',
    name: 'ERP Básico',
    serviceType: ServiceType.ERP_BASICO,
    price: 15000,
    features: [PricingPlanFeature.ESTOQUE, PricingPlanFeature.FINANCEIRO],
    storageLimit: 10,
    isActive: true,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // ============================================================================
  // GET PRICING PLANS
  // ============================================================================

  describe('getPricingPlans', () => {
    it('should return only active plans ordered by order', async () => {
      // Arrange
      const plans = [
        { ...mockPlan, order: 1 },
        { ...mockPlan, id: 'plan-456', order: 2 },
      ];
      vi.mocked(prisma.pricingPlan.findMany).mockResolvedValue(plans as any);

      // Act
      const result = await getPricingPlans();

      // Assert
      expect(result).toHaveLength(2);
      expect(prisma.pricingPlan.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
    });

    it('should return empty array on error', async () => {
      // Arrange
      vi.mocked(prisma.pricingPlan.findMany).mockRejectedValue(new Error('DB Error'));

      // Act
      const result = await getPricingPlans();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getAllPricingPlans', () => {
    it('should return all plans including inactive', async () => {
      // Arrange
      const plans = [
        { ...mockPlan, isActive: true },
        { ...mockPlan, id: 'plan-456', isActive: false },
      ];
      vi.mocked(prisma.pricingPlan.findMany).mockResolvedValue(plans as any);

      // Act
      const result = await getAllPricingPlans();

      // Assert
      expect(result).toHaveLength(2);
      expect(prisma.pricingPlan.findMany).toHaveBeenCalledWith({
        orderBy: { order: 'asc' },
      });
    });
  });

  // ============================================================================
  // UPDATE PLAN
  // ============================================================================

  describe('updatePlan', () => {
    it('should update existing plan', async () => {
      // Arrange
      const updateData = {
        name: 'ERP Básico Atualizado',
        price: 20000,
        features: [PricingPlanFeature.ESTOQUE],
        storageLimit: 20,
      };

      vi.mocked(prisma.pricingPlan.findUnique).mockResolvedValue(mockPlan as any);
      vi.mocked(prisma.pricingPlan.update).mockResolvedValue({ ...mockPlan, ...updateData } as any);

      // Act
      const result = await updatePlan('plan-123', updateData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('atualizado');
      expect(prisma.pricingPlan.update).toHaveBeenCalledWith({
        where: { id: 'plan-123' },
        data: expect.objectContaining({
          name: updateData.name,
          price: updateData.price,
          features: updateData.features,
          storageLimit: updateData.storageLimit,
        }),
      });
    });

    it('should return error for non-existing plan', async () => {
      // Arrange
      vi.mocked(prisma.pricingPlan.findUnique).mockResolvedValue(null);

      // Act
      const result = await updatePlan('non-existent', {
        name: 'Test',
        price: 1000,
        features: [],
        storageLimit: 10,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('não encontrado');
    });

    it('should handle validation errors', async () => {
      // Arrange
      vi.mocked(prisma.pricingPlan.findUnique).mockResolvedValue(mockPlan as any);

      // Act - Invalid data (negative price)
      const result = await updatePlan('plan-123', {
        name: 'Test',
        price: -100,
        features: [],
        storageLimit: 10,
      });

      // Assert
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // CREATE PLAN
  // ============================================================================

  describe('createPlan', () => {
    it('should create new plan with correct order', async () => {
      // Arrange
      const newPlanData = {
        name: 'Novo Plano',
        serviceType: 'ERP_ECOMMERCE',
        price: 30000,
        features: [PricingPlanFeature.ECOMMERCE],
        storageLimit: 50,
      };

      vi.mocked(prisma.pricingPlan.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.pricingPlan.findFirst).mockResolvedValue({ ...mockPlan, order: 5 } as any);
      vi.mocked(prisma.pricingPlan.create).mockResolvedValue({
        id: 'new-plan',
        ...newPlanData,
        serviceType: ServiceType.ERP_ECOMMERCE,
        isActive: true,
        order: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // Act
      const result = await createPlan(newPlanData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.planId).toBe('new-plan');
      expect(prisma.pricingPlan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: newPlanData.name,
            order: 6, // Last order + 1
            isActive: true,
          }),
        })
      );
    });

    it('should reject duplicate service type', async () => {
      // Arrange
      vi.mocked(prisma.pricingPlan.findUnique).mockResolvedValue(mockPlan as any);

      // Act
      const result = await createPlan({
        name: 'Duplicate',
        serviceType: ServiceType.ERP_BASICO,
        price: 1000,
        features: [],
        storageLimit: 10,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Já existe');
    });
  });

  // ============================================================================
  // TOGGLE PLAN ACTIVE
  // ============================================================================

  describe('togglePlanActive', () => {
    it('should deactivate plan without active clients', async () => {
      // Arrange
      vi.mocked(prisma.pricingPlan.findUnique).mockResolvedValue({
        ...mockPlan,
        isActive: true,
      } as any);
      vi.mocked(prisma.briefing.count).mockResolvedValue(0);
      vi.mocked(prisma.pricingPlan.update).mockResolvedValue({
        ...mockPlan,
        isActive: false,
      } as any);

      // Act
      const result = await togglePlanActive('plan-123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('desativado');
    });

    it('should prevent deactivation with active clients', async () => {
      // Arrange
      vi.mocked(prisma.pricingPlan.findUnique).mockResolvedValue({
        ...mockPlan,
        isActive: true,
      } as any);
      vi.mocked(prisma.briefing.count).mockResolvedValue(3);

      // Act
      const result = await togglePlanActive('plan-123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('3 clientes');
    });

    it('should activate inactive plan', async () => {
      // Arrange
      vi.mocked(prisma.pricingPlan.findUnique).mockResolvedValue({
        ...mockPlan,
        isActive: false,
      } as any);
      vi.mocked(prisma.pricingPlan.update).mockResolvedValue({
        ...mockPlan,
        isActive: true,
      } as any);

      // Act
      const result = await togglePlanActive('plan-123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('ativado');
    });
  });

  // ============================================================================
  // REORDER PLANS
  // ============================================================================

  describe('reorderPlans', () => {
    it('should update order of all plans', async () => {
      // Arrange
      const planIds = ['plan-c', 'plan-a', 'plan-b'];
      vi.mocked(prisma.$transaction).mockResolvedValue([]);

      // Act
      const result = await reorderPlans(planIds);

      // Assert
      expect(result.success).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      // Act
      const result = await reorderPlans([]);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // ACTIVE CLIENTS
  // ============================================================================

  describe('hasActiveClients', () => {
    it('should return true when clients exist', async () => {
      // Arrange
      vi.mocked(prisma.briefing.count).mockResolvedValue(5);

      // Act
      const result = await hasActiveClients(ServiceType.ERP_BASICO);

      // Assert
      expect(result).toBe(true);
      expect(prisma.briefing.count).toHaveBeenCalledWith({
        where: {
          serviceType: ServiceType.ERP_BASICO,
          status: BriefingStatus.APROVADO,
        },
      });
    });

    it('should return false when no clients', async () => {
      // Arrange
      vi.mocked(prisma.briefing.count).mockResolvedValue(0);

      // Act
      const result = await hasActiveClients(ServiceType.ERP_BASICO);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('countActiveClients', () => {
    it('should return correct count', async () => {
      // Arrange
      vi.mocked(prisma.briefing.count).mockResolvedValue(10);

      // Act
      const result = await countActiveClients(ServiceType.ERP_ECOMMERCE);

      // Assert
      expect(result).toBe(10);
    });

    it('should return 0 on error', async () => {
      // Arrange
      vi.mocked(prisma.briefing.count).mockRejectedValue(new Error('DB Error'));

      // Act
      const result = await countActiveClients(ServiceType.ERP_BASICO);

      // Assert
      expect(result).toBe(0);
    });
  });
});
