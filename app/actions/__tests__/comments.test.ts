/**
 * Unit Tests: Comments Server Actions
 *
 * Tests for comment-related server actions:
 * - addComment
 * - getCommentsByMilestone
 * - deleteComment
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addComment, getCommentsByMilestone, deleteComment } from '../comments';
import { prisma } from '@/lib/prisma';
import { notifyNewComment } from '@/lib/comment-notifications';
import { UserRole } from '@prisma/client';
import { createMockUser } from '@/lib/test-utils';

describe('Comments Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUserId = 'user-123';
  const mockProjectId = 'project-456';
  const mockMilestoneId = 'milestone-789';

  // ============================================================================
  // ADD COMMENT
  // ============================================================================

  describe('addComment', () => {
    it('should add comment as project owner', async () => {
      // Arrange
      const commentData = {
        projectId: mockProjectId,
        milestoneId: mockMilestoneId,
        content: 'Comentário de teste',
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue({
        id: mockProjectId,
        userId: mockUserId,
        user: {
          id: mockUserId,
          name: 'Cliente',
          email: 'cliente@test.com',
          role: UserRole.CLIENTE,
        },
        milestones: [{ id: mockMilestoneId }],
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        createMockUser({
          id: mockUserId,
          role: UserRole.CLIENTE,
        })
      );

      vi.mocked(prisma.projectComment.create).mockResolvedValue({
        id: 'comment-123',
        ...commentData,
        userId: mockUserId,
        user: { id: mockUserId, name: 'Cliente', role: UserRole.CLIENTE },
        createdAt: new Date(),
      } as any);

      // Act
      const result = await addComment(commentData, mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('adicionado');
      expect(prisma.projectComment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            projectId: mockProjectId,
            milestoneId: mockMilestoneId,
            content: commentData.content,
            userId: mockUserId,
          }),
        })
      );
    });

    it('should add comment as admin', async () => {
      // Arrange
      const adminId = 'admin-123';
      const commentData = {
        projectId: mockProjectId,
        content: 'Resposta do admin',
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue({
        id: mockProjectId,
        userId: 'other-user',
        user: {
          id: 'other-user',
          name: 'Cliente',
          email: 'cliente@test.com',
          role: UserRole.CLIENTE,
        },
        milestones: [],
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        createMockUser({
          id: adminId,
          role: UserRole.ADMIN,
        })
      );

      vi.mocked(prisma.projectComment.create).mockResolvedValue({
        id: 'comment-123',
        ...commentData,
        milestoneId: null,
        userId: adminId,
        user: { id: adminId, name: 'Admin', role: UserRole.ADMIN },
        createdAt: new Date(),
      } as any);

      // Act
      const result = await addComment(commentData, adminId);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should reject comment from unauthorized user', async () => {
      // Arrange
      const unauthorizedUserId = 'hacker-123';
      const commentData = {
        projectId: mockProjectId,
        content: 'Comentário não autorizado',
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue({
        id: mockProjectId,
        userId: 'owner-123', // Different user
        user: { id: 'owner-123', name: 'Owner', email: 'owner@test.com', role: UserRole.CLIENTE },
        milestones: [],
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        createMockUser({
          id: unauthorizedUserId,
          role: UserRole.CLIENTE,
        })
      );

      // Act
      const result = await addComment(commentData, unauthorizedUserId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('permissão');
    });

    it('should validate comment content', async () => {
      // Arrange
      const invalidData = {
        projectId: mockProjectId,
        content: '', // Empty content
      };

      // Act
      const result = await addComment(invalidData, mockUserId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('inválidos');
    });

    it('should reject comment for non-existent milestone', async () => {
      // Arrange
      const commentData = {
        projectId: mockProjectId,
        milestoneId: 'invalid-milestone',
        content: 'Comentário',
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue({
        id: mockProjectId,
        userId: mockUserId,
        user: {
          id: mockUserId,
          name: 'Cliente',
          email: 'cliente@test.com',
          role: UserRole.CLIENTE,
        },
        milestones: [{ id: 'different-milestone' }], // Different milestone
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        createMockUser({
          id: mockUserId,
          role: UserRole.CLIENTE,
        })
      );

      // Act
      const result = await addComment(commentData, mockUserId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Etapa');
    });
  });

  // ============================================================================
  // GET COMMENTS BY MILESTONE
  // ============================================================================

  describe('getCommentsByMilestone', () => {
    it('should return comments with pagination', async () => {
      // Arrange
      const comments = [
        {
          id: 'comment-1',
          content: 'Primeiro comentário',
          userId: mockUserId,
          user: { id: mockUserId, name: 'Cliente', role: UserRole.CLIENTE },
          createdAt: new Date(),
        },
        {
          id: 'comment-2',
          content: 'Segundo comentário',
          userId: 'admin-123',
          user: { id: 'admin-123', name: 'Admin', role: UserRole.ADMIN },
          createdAt: new Date(),
        },
      ];

      vi.mocked(prisma.project.findUnique).mockResolvedValue({
        id: mockProjectId,
        userId: mockUserId,
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        createMockUser({
          id: mockUserId,
          role: UserRole.CLIENTE,
        })
      );

      vi.mocked(prisma.projectComment.findMany).mockResolvedValue(comments as any);

      // Act
      const result = await getCommentsByMilestone(mockProjectId, mockMilestoneId, mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.comments).toHaveLength(2);
      expect(result.data?.hasMore).toBe(false);
    });

    it('should reject access to unauthorized project', async () => {
      // Arrange
      vi.mocked(prisma.project.findUnique).mockResolvedValue({
        id: mockProjectId,
        userId: 'other-user',
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        createMockUser({
          id: mockUserId,
          role: UserRole.CLIENTE,
        })
      );

      // Act
      const result = await getCommentsByMilestone(mockProjectId, mockMilestoneId, mockUserId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('permissão');
    });
  });

  // ============================================================================
  // DELETE COMMENT
  // ============================================================================

  describe('deleteComment', () => {
    it('should allow author to delete comment', async () => {
      // Arrange
      vi.mocked(prisma.projectComment.findUnique).mockResolvedValue({
        id: 'comment-123',
        userId: mockUserId,
        user: { id: mockUserId, role: UserRole.CLIENTE },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        createMockUser({
          id: mockUserId,
          role: UserRole.CLIENTE,
        })
      );

      vi.mocked(prisma.projectComment.delete).mockResolvedValue({} as any);

      // Act
      const result = await deleteComment({ commentId: 'comment-123' }, mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('removido');
    });

    it('should allow admin to delete any comment', async () => {
      // Arrange
      const adminId = 'admin-123';

      vi.mocked(prisma.projectComment.findUnique).mockResolvedValue({
        id: 'comment-123',
        userId: 'other-user', // Different user
        user: { id: 'other-user', role: UserRole.CLIENTE },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        createMockUser({
          id: adminId,
          role: UserRole.ADMIN,
        })
      );

      vi.mocked(prisma.projectComment.delete).mockResolvedValue({} as any);

      // Act
      const result = await deleteComment({ commentId: 'comment-123' }, adminId);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should reject deletion by non-author non-admin', async () => {
      // Arrange
      const unauthorizedUserId = 'hacker-123';

      vi.mocked(prisma.projectComment.findUnique).mockResolvedValue({
        id: 'comment-123',
        userId: 'author-123',
        user: { id: 'author-123', role: UserRole.CLIENTE },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        createMockUser({
          id: unauthorizedUserId,
          role: UserRole.CLIENTE,
        })
      );

      // Act
      const result = await deleteComment({ commentId: 'comment-123' }, unauthorizedUserId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('permissão');
    });

    it('should return error for non-existent comment', async () => {
      // Arrange
      vi.mocked(prisma.projectComment.findUnique).mockResolvedValue(null);

      // Act
      const result = await deleteComment({ commentId: 'non-existent' }, mockUserId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('não encontrado');
    });
  });
});
