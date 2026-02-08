/**
 * Unit Tests: Data Retention (LGPD Compliance)
 *
 * Tests for LGPD data retention functions:
 * - checkInactiveUsers
 * - sendInactivityWarning
 * - deleteInactiveData
 * - anonymizeBriefings
 * - runDataRetention
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkInactiveUsers,
  sendInactivityWarning,
  deleteInactiveData,
  anonymizeBriefings,
  runDataRetention,
} from '../data-retention';
import { prisma } from '../prisma';
import { sendEmail } from '../email';
import { UserRole } from '@prisma/client';
import { createMockUser, mockDateMonths } from '../test-utils';

describe('Data Retention (LGPD)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // CHECK INACTIVE USERS
  // ============================================================================

  describe('checkInactiveUsers', () => {
    it('should find users inactive for 11-12 months', async () => {
      // Arrange
      const elevenMonthsAgo = mockDateMonths(-11);
      const twelveMonthsAgo = mockDateMonths(-12);

      const inactiveUsers = [
        createMockUser({
          id: 'user-1',
          lastLoginAt: new Date(elevenMonthsAgo.getTime() + 7 * 24 * 60 * 60 * 1000), // 11 months + 7 days
          warningSentAt: null,
        }),
      ];

      vi.mocked(prisma.user.findMany).mockResolvedValue(inactiveUsers);
      vi.mocked(prisma.user.update).mockResolvedValue(inactiveUsers[0]);
      vi.mocked(sendEmail).mockResolvedValue({ success: true });

      // Act
      const result = await checkInactiveUsers();

      // Assert
      expect(result.success).toBe(true);
      expect(result.warningsSent).toBe(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: UserRole.CLIENTE,
            doNotDelete: false,
            warningSentAt: null,
          }),
        })
      );
    });

    it('should skip users with warning already sent', async () => {
      // Arrange
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);

      // Act
      const result = await checkInactiveUsers();

      // Assert
      expect(result.warningsSent).toBe(0);
    });

    it('should handle users who never logged in', async () => {
      // Arrange
      const users = [
        createMockUser({
          lastLoginAt: null,
          createdAt: mockDateMonths(-11),
          warningSentAt: null,
        }),
      ];

      vi.mocked(prisma.user.findMany).mockResolvedValue(users);
      vi.mocked(prisma.user.update).mockResolvedValue(users[0]);
      vi.mocked(sendEmail).mockResolvedValue({ success: true });

      // Act
      const result = await checkInactiveUsers();

      // Assert
      expect(result.warningsSent).toBe(1);
    });

    it('should handle email sending errors gracefully', async () => {
      // Arrange
      const users = [
        createMockUser({
          lastLoginAt: mockDateMonths(-11),
          warningSentAt: null,
        }),
      ];

      vi.mocked(prisma.user.findMany).mockResolvedValue(users);
      vi.mocked(sendEmail).mockResolvedValue({ success: false, error: 'SMTP error' });

      // Act
      const result = await checkInactiveUsers();

      // Assert
      expect(result.warningsSent).toBe(0);
      expect(result.errors).toHaveLength(1);
    });
  });

  // ============================================================================
  // DELETE INACTIVE DATA
  // ============================================================================

  describe('deleteInactiveData', () => {
    it('should delete data for users inactive over 12 months', async () => {
      // Arrange
      const users = [
        createMockUser({
          id: 'user-1',
          lastLoginAt: mockDateMonths(-13),
        }),
      ];

      vi.mocked(prisma.user.findMany).mockResolvedValue(users);
      vi.mocked(prisma.project.findMany).mockResolvedValue([]);
      vi.mocked(prisma.briefing.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        if (typeof callback === 'function') {
          return callback(prisma);
        }
        return Promise.resolve([]);
      });

      // Act
      const result = await deleteInactiveData();

      // Assert
      expect(result.success).toBe(true);
      expect(result.usersDeleted).toBe(1);
    });

    it('should preserve contractual data for 5 years', async () => {
      // Arrange
      const users = [
        createMockUser({
          id: 'user-1',
          lastLoginAt: mockDateMonths(-13),
        }),
      ];

      vi.mocked(prisma.user.findMany).mockResolvedValue(users);
      // User has contractual projects
      vi.mocked(prisma.project.findMany).mockResolvedValue([{ id: 'proj-1' }] as any);
      vi.mocked(prisma.briefing.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        if (typeof callback === 'function') {
          return callback(prisma);
        }
        return Promise.resolve([]);
      });

      // Act
      const result = await deleteInactiveData();

      // Assert
      expect(result.success).toBe(true);
      expect(result.contractualPreserved).toBe(1);
    });

    it('should handle users who never logged in but created over 12 months ago', async () => {
      // Arrange
      const users = [
        createMockUser({
          id: 'user-1',
          lastLoginAt: null,
          createdAt: mockDateMonths(-13),
        }),
      ];

      vi.mocked(prisma.user.findMany).mockResolvedValue(users);
      vi.mocked(prisma.project.findMany).mockResolvedValue([]);
      vi.mocked(prisma.briefing.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        if (typeof callback === 'function') {
          return callback(prisma);
        }
        return Promise.resolve([]);
      });

      // Act
      const result = await deleteInactiveData();

      // Assert
      expect(result.usersDeleted).toBe(1);
    });
  });

  // ============================================================================
  // ANONYMIZE BRIEFINGS
  // ============================================================================

  describe('anonymizeBriefings', () => {
    it('should anonymize briefings not converted after 2 years', async () => {
      // Arrange
      const oldBriefings = [
        {
          id: 'briefing-1',
          companyName: 'Empresa Antiga',
          userId: 'user-1',
          objectives: 'Objetivos antigos',
          createdAt: mockDateMonths(-25),
        },
      ];

      vi.mocked(prisma.briefing.findMany).mockResolvedValue(oldBriefings as any);
      vi.mocked(prisma.briefing.update).mockResolvedValue({} as any);

      // Act
      const result = await anonymizeBriefings();

      // Assert
      expect(result.success).toBe(true);
      expect(result.briefingsAnonymized).toBe(1);
      expect(prisma.briefing.update).toHaveBeenCalledWith({
        where: { id: 'briefing-1' },
        data: expect.objectContaining({
          companyName: '[ANONIMIZADO]',
          userId: null,
        }),
      });
    });

    it('should not anonymize briefings with projects', async () => {
      // Arrange - Only return briefings without projects
      vi.mocked(prisma.briefing.findMany).mockResolvedValue([]);

      // Act
      const result = await anonymizeBriefings();

      // Assert
      expect(result.briefingsAnonymized).toBe(0);
    });

    it('should handle anonymization errors', async () => {
      // Arrange
      const oldBriefings = [{ id: 'briefing-1', companyName: 'Test', userId: 'user-1' }];

      vi.mocked(prisma.briefing.findMany).mockResolvedValue(oldBriefings as any);
      vi.mocked(prisma.briefing.update).mockRejectedValue(new Error('DB Error'));

      // Act
      const result = await anonymizeBriefings();

      // Assert
      expect(result.success).toBe(true); // Still reports success
      expect(result.errors).toHaveLength(1);
    });
  });

  // ============================================================================
  // RUN DATA RETENTION
  // ============================================================================

  describe('runDataRetention', () => {
    it('should run all retention policies', async () => {
      // Arrange
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      vi.mocked(prisma.briefing.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        if (typeof callback === 'function') {
          return callback(prisma);
        }
        return Promise.resolve([]);
      });

      // Act
      const result = await runDataRetention();

      // Assert
      expect(result.success).toBe(true);
      expect(result.summary).toEqual({
        warningsSent: 0,
        usersDeleted: 0,
        contractualPreserved: 0,
        briefingsAnonymized: 0,
      });
    });

    it('should aggregate errors from all operations', async () => {
      // Arrange
      vi.mocked(prisma.user.findMany).mockRejectedValue(new Error('DB Error'));

      // Act
      const result = await runDataRetention();

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
