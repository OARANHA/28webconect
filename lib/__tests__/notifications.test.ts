/**
 * Unit Tests: Notifications
 *
 * Tests for notification-related functions:
 * - createNotification
 * - sendNotificationEmail
 * - sendPushNotification
 * - markAsRead
 * - markAllAsRead
 * - getDefaultPreferences
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createNotification,
  sendNotificationEmail,
  sendPushNotification,
  markAsRead,
  markAllAsRead,
  getDefaultPreferences,
} from '../notifications';
import { prisma } from '../prisma';
import { sendEmail } from '../email';
import { NotificationType } from '@prisma/client';
import { createMockUser, createMockNotification } from '../test-utils';

describe('Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUserId = 'user-123';

  // ============================================================================
  // CREATE NOTIFICATION
  // ============================================================================

  describe('createNotification', () => {
    it('should create notification with valid data', async () => {
      // Arrange
      const notificationData = {
        type: NotificationType.NOVO_BRIEFING,
        title: 'Novo Briefing',
        message: 'Você recebeu um novo briefing',
        userId: mockUserId,
        channels: ['IN_APP', 'EMAIL'] as const,
        metadata: { briefingId: 'brief-123' },
      };

      vi.mocked(prisma.notificationPreference.findMany).mockResolvedValue([]);
      vi.mocked(prisma.notification.create).mockResolvedValue(
        createMockNotification({
          ...notificationData,
          channel: 'IN_APP',
        }) as any
      );
      vi.mocked(sendEmail).mockResolvedValue({ success: true });

      // Act
      const result = await createNotification(notificationData);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should validate notification data', async () => {
      // Arrange
      const invalidData = {
        type: 'INVALID_TYPE',
        title: '',
        message: '',
        userId: mockUserId,
        channels: [],
      };

      // Act
      const result = await createNotification(invalidData as any);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('inválidos');
    });

    it('should handle missing user preferences gracefully', async () => {
      // Arrange
      const notificationData = {
        type: NotificationType.NOVO_BRIEFING,
        title: 'Novo Briefing',
        message: 'Mensagem de teste',
        userId: mockUserId,
        channels: ['IN_APP'] as const,
      };

      vi.mocked(prisma.notificationPreference.findMany).mockResolvedValue([]);
      vi.mocked(prisma.notification.create).mockResolvedValue(createMockNotification() as any);

      // Act
      const result = await createNotification(notificationData);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should respect user channel preferences', async () => {
      // Arrange
      const notificationData = {
        type: NotificationType.NOVO_BRIEFING,
        title: 'Novo Briefing',
        message: 'Mensagem',
        userId: mockUserId,
        channels: ['IN_APP', 'EMAIL', 'PUSH'] as const,
      };

      // User has disabled email for this notification type
      vi.mocked(prisma.notificationPreference.findMany).mockResolvedValue([
        {
          id: 'pref-1',
          userId: mockUserId,
          type: NotificationType.NOVO_BRIEFING,
          emailEnabled: false,
          pushEnabled: true,
          inAppEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      vi.mocked(prisma.notification.create).mockResolvedValue(createMockNotification() as any);

      // Act
      const result = await createNotification(notificationData);

      // Assert
      expect(result.success).toBe(true);
      // Email should not be sent due to user preference
    });

    it('should not fail if email sending fails', async () => {
      // Arrange
      const notificationData = {
        type: NotificationType.NOVO_BRIEFING,
        title: 'Novo Briefing',
        message: 'Mensagem',
        userId: mockUserId,
        channels: ['IN_APP', 'EMAIL'] as const,
      };

      vi.mocked(prisma.notificationPreference.findMany).mockResolvedValue([]);
      vi.mocked(prisma.notification.create).mockResolvedValue(createMockNotification() as any);
      vi.mocked(sendEmail).mockResolvedValue({ success: false, error: 'SMTP error' });

      // Act
      const result = await createNotification(notificationData);

      // Assert - Should still succeed even if email fails
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // SEND NOTIFICATION EMAIL
  // ============================================================================

  describe('sendNotificationEmail', () => {
    it('should send email notification', async () => {
      // Arrange
      const notification = {
        userId: mockUserId,
        type: NotificationType.NOVO_BRIEFING,
        title: 'Novo Briefing',
        message: 'Você recebeu um novo briefing',
        metadata: {},
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        createMockUser({
          id: mockUserId,
          email: 'teste@example.com',
          name: 'Teste User',
        })
      );
      vi.mocked(sendEmail).mockResolvedValue({ success: true });

      // Act
      const result = await sendNotificationEmail(notification);

      // Assert
      expect(result.success).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'teste@example.com',
          subject: expect.any(String),
          html: expect.any(String),
          text: expect.any(String),
        })
      );
    });

    it('should handle user without email', async () => {
      // Arrange
      const notification = {
        userId: mockUserId,
        type: NotificationType.NOVO_BRIEFING,
        title: 'Test',
        message: 'Test message',
        metadata: {},
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        createMockUser({
          email: null,
        })
      );

      // Act
      const result = await sendNotificationEmail(notification);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('sem email');
    });

    it('should handle email service failure', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(createMockUser());
      vi.mocked(sendEmail).mockResolvedValue({ success: false, error: 'SMTP error' });

      // Act
      const result = await sendNotificationEmail({
        userId: mockUserId,
        type: NotificationType.NOVO_BRIEFING,
        title: 'Test',
        message: 'Test',
        metadata: {},
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Erro ao enviar');
    });
  });

  // ============================================================================
  // SEND PUSH NOTIFICATION
  // ============================================================================

  describe('sendPushNotification', () => {
    it('should return error when VAPID keys not configured', async () => {
      // Arrange
      const originalPublicKey = process.env.VAPID_PUBLIC_KEY;
      const originalPrivateKey = process.env.VAPID_PRIVATE_KEY;
      process.env.VAPID_PUBLIC_KEY = '';
      process.env.VAPID_PRIVATE_KEY = '';

      // Act
      const result = await sendPushNotification(
        {
          userId: mockUserId,
          type: NotificationType.SISTEMA,
          title: 'Test',
          message: 'Test',
          metadata: {},
        },
        { endpoint: 'https://test.com', keys: { p256dh: 'test', auth: 'test' } }
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('VAPID keys não configuradas');

      // Cleanup
      process.env.VAPID_PUBLIC_KEY = originalPublicKey;
      process.env.VAPID_PRIVATE_KEY = originalPrivateKey;
    });
  });

  // ============================================================================
  // MARK AS READ
  // ============================================================================

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      // Arrange
      vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 1 });

      // Act
      const result = await markAsRead('notif-123', mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'notif-123',
          userId: mockUserId,
        },
        data: { read: true },
      });
    });

    it('should return error when notification not found', async () => {
      // Arrange
      vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 0 });

      // Act
      const result = await markAsRead('non-existent', mockUserId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('não encontrada');
    });
  });

  // ============================================================================
  // MARK ALL AS READ
  // ============================================================================

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      // Arrange
      vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 5 });

      // Act
      const result = await markAllAsRead(mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.count).toBe(5);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          read: false,
        },
        data: { read: true },
      });
    });

    it('should handle when no unread notifications', async () => {
      // Arrange
      vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 0 });

      // Act
      const result = await markAllAsRead(mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });
  });

  // ============================================================================
  // GET DEFAULT PREFERENCES
  // ============================================================================

  describe('getDefaultPreferences', () => {
    it('should return defaults for regular notification type', () => {
      // Act
      const result = getDefaultPreferences(NotificationType.NOVO_BRIEFING);

      // Assert
      expect(result).toEqual({
        type: NotificationType.NOVO_BRIEFING,
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
      });
    });

    it('should return in-app only for system notifications', () => {
      // Act
      const result = getDefaultPreferences(NotificationType.SISTEMA);

      // Assert
      expect(result).toEqual({
        type: NotificationType.SISTEMA,
        emailEnabled: false,
        pushEnabled: false,
        inAppEnabled: true,
      });
    });
  });
});
