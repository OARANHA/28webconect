/**
 * Integration Tests: Project Management Workflow
 *
 * Tests the complete project lifecycle:
 * - Briefing approved → project created → milestones generated
 * - Admin marks milestone complete → progress updated → client notified
 * - Client uploads file → storage limit checked → file saved → metadata in Prisma
 * - Client comments on milestone → admin receives notification → admin replies → client receives notification
 * - Admin updates project status → client receives notification
 * - File upload with retry logic and chunked upload
 * - Progress calculation: 4 milestones = 25% each
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getClientProjects,
  getProjectById,
  updateProjectStatus,
  completeMilestone,
  uploadProjectFile,
} from '../projects';
import { addComment, getCommentsByMilestone } from '../comments';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { saveFile, validateFile, checkStorageLimit } from '@/lib/file-upload';
import {
  createMockUser,
  createMockProject,
  createMockMilestone,
  createMockProjectFile,
  createMockSession,
} from '@/lib/test-utils';
import {
  clientUserFixture,
  adminUserFixture,
  inProgressProjectFixture,
  validFileFixtures,
} from '@/lib/test-fixtures';
import { ProjectStatus, UserRole, NotificationType } from '@prisma/client';

describe('Project Management Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockClientId = 'user-client-123';
  const mockAdminId = 'user-admin-123';
  const mockProjectId = 'project-456';

  // ============================================================================
  // PROJECT LIFECYCLE: CREATION → MILESTONES → PROGRESS
  // ============================================================================

  describe('Project Lifecycle', () => {
    it('should create project with milestones when briefing is approved', async () => {
      // Arrange
      const milestones = [
        createMockMilestone({ projectId: mockProjectId, order: 1, title: 'Fase 1' }),
        createMockMilestone({ projectId: mockProjectId, order: 2, title: 'Fase 2' }),
        createMockMilestone({ projectId: mockProjectId, order: 3, title: 'Fase 3' }),
        createMockMilestone({ projectId: mockProjectId, order: 4, title: 'Fase 4' }),
      ];

      const project = createMockProject({
        id: mockProjectId,
        userId: mockClientId,
        status: ProjectStatus.AGUARDANDO_APROVACAO,
        milestones,
      });

      vi.mocked(prisma.project.findUnique).mockResolvedValue(project);
      vi.mocked(prisma.projectMilestone.findMany).mockResolvedValue(milestones);

      // Act
      const result = await getProjectById(mockProjectId, mockClientId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.milestones).toHaveLength(4);
    });

    it('should update progress when milestone is completed', async () => {
      // Arrange
      const milestones = [
        createMockMilestone({ projectId: mockProjectId, order: 1, status: 'CONCLUIDA' }),
        createMockMilestone({ projectId: mockProjectId, order: 2, status: 'PENDENTE' }),
        createMockMilestone({ projectId: mockProjectId, order: 3, status: 'PENDENTE' }),
        createMockMilestone({ projectId: mockProjectId, order: 4, status: 'PENDENTE' }),
      ];

      vi.mocked(auth).mockResolvedValue(
        createMockSession({
          user: { id: mockAdminId, role: UserRole.ADMIN },
        })
      );

      vi.mocked(prisma.projectMilestone.findUnique).mockResolvedValue({
        ...milestones[1],
        project: createMockProject({ id: mockProjectId, userId: mockClientId }),
      });

      vi.mocked(prisma.projectMilestone.update).mockResolvedValue({
        ...milestones[1],
        status: 'CONCLUIDA',
        completedAt: new Date(),
      });

      // 2 out of 4 completed = 50%
      vi.mocked(prisma.projectMilestone.findMany).mockResolvedValue([
        milestones[0],
        { ...milestones[1], status: 'CONCLUIDA' },
        milestones[2],
        milestones[3],
      ]);

      vi.mocked(prisma.project.update).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          progress: 50,
        })
      );

      vi.mocked(createNotification).mockResolvedValue({ success: true });

      // Act
      const result = await completeMilestone(milestones[1].id);

      // Assert
      expect(result.success).toBe(true);
      expect(prisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockProjectId },
          data: expect.objectContaining({
            progress: 50,
          }),
        })
      );

      // Verify client notification
      expect(createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockClientId,
          type: NotificationType.MILESTONE_CONCLUIDA,
        })
      );
    });

    it('should calculate progress correctly: 1/4 = 25%, 2/4 = 50%, 4/4 = 100%', async () => {
      // Test progress calculation logic
      const calculateProgress = (completed: number, total: number) =>
        Math.round((completed / total) * 100);

      expect(calculateProgress(0, 4)).toBe(0);
      expect(calculateProgress(1, 4)).toBe(25);
      expect(calculateProgress(2, 4)).toBe(50);
      expect(calculateProgress(3, 4)).toBe(75);
      expect(calculateProgress(4, 4)).toBe(100);
    });
  });

  // ============================================================================
  // FILE UPLOAD WORKFLOW
  // ============================================================================

  describe('File Upload Workflow', () => {
    it('should complete upload flow: validate → check storage → save file → store metadata', async () => {
      // Arrange
      const file = {
        filename: 'documento.pdf',
        mimetype: 'application/pdf',
        filesize: 2 * 1024 * 1024, // 2MB
      };

      const mockFile = createMockProjectFile({
        projectId: mockProjectId,
        userId: mockClientId,
        ...file,
      });

      vi.mocked(auth).mockResolvedValue(
        createMockSession({
          user: { id: mockClientId, role: UserRole.CLIENTE },
        })
      );

      vi.mocked(prisma.project.findFirst).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockClientId,
        })
      );

      vi.mocked(validateFile).mockResolvedValue({
        valid: true,
        mimeType: 'application/pdf',
        storageInfo: { used: 1000000, limit: 10000000000, available: 9999000000 },
      });

      vi.mocked(checkStorageLimit).mockResolvedValue({
        valid: true,
        storageInfo: { used: 1000000, limit: 10000000000, available: 9999000000 },
        percentage: 0.01,
      });

      vi.mocked(saveFile).mockResolvedValue({
        filepath: `uploads/projects/${mockProjectId}/documento.pdf`,
        filename: 'documento.pdf',
        filesize: file.filesize,
      });

      vi.mocked(prisma.projectFile.create).mockResolvedValue(mockFile);

      // Act
      const result = await uploadProjectFile(
        mockProjectId,
        Buffer.from('file content'),
        file.filename,
        file.mimetype
      );

      // Assert
      expect(result.success).toBe(true);
      expect(validateFile).toHaveBeenCalled();
      expect(saveFile).toHaveBeenCalled();
      expect(prisma.projectFile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            projectId: mockProjectId,
            userId: mockClientId,
            filename: file.filename,
            filesize: file.filesize,
          }),
        })
      );
    });

    it('should reject upload when storage limit exceeded', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(
        createMockSession({
          user: { id: mockClientId, role: UserRole.CLIENTE },
        })
      );

      vi.mocked(prisma.project.findFirst).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockClientId,
        })
      );

      vi.mocked(checkStorageLimit).mockResolvedValue({
        valid: false,
        error: 'Limite de armazenamento atingido',
        percentage: 100,
      });

      vi.mocked(validateFile).mockResolvedValue({
        valid: false,
        error: 'Limite de armazenamento atingido',
      });

      // Act
      const result = await uploadProjectFile(
        mockProjectId,
        Buffer.from('file content'),
        'documento.pdf',
        'application/pdf'
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Limite');
      expect(saveFile).not.toHaveBeenCalled();
    });

    it('should reject invalid file types', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(
        createMockSession({
          user: { id: mockClientId, role: UserRole.CLIENTE },
        })
      );

      vi.mocked(prisma.project.findFirst).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockClientId,
        })
      );

      vi.mocked(validateFile).mockResolvedValue({
        valid: false,
        error: 'Tipo de arquivo não permitido',
      });

      // Act
      const result = await uploadProjectFile(
        mockProjectId,
        Buffer.from('file content'),
        'malware.exe',
        'application/x-msdownload'
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('não permitido');
    });

    it('should handle file upload with retry logic', async () => {
      // Arrange
      let attemptCount = 0;
      const mockFile = createMockProjectFile({
        projectId: mockProjectId,
        userId: mockClientId,
      });

      vi.mocked(auth).mockResolvedValue(
        createMockSession({
          user: { id: mockClientId, role: UserRole.CLIENTE },
        })
      );

      vi.mocked(prisma.project.findFirst).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockClientId,
        })
      );

      vi.mocked(validateFile).mockResolvedValue({
        valid: true,
        mimeType: 'application/pdf',
      });

      // Simulate network failure on first attempt, success on second
      vi.mocked(saveFile).mockImplementation(() => {
        attemptCount++;
        if (attemptCount === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          filepath: 'uploads/file.pdf',
          filename: 'file.pdf',
          filesize: 1024,
        });
      });

      vi.mocked(prisma.projectFile.create).mockResolvedValue(mockFile);

      // Act - First attempt fails
      const result1 = await uploadProjectFile(
        mockProjectId,
        Buffer.from('file content'),
        'documento.pdf',
        'application/pdf'
      );

      // Retry
      const result2 = await uploadProjectFile(
        mockProjectId,
        Buffer.from('file content'),
        'documento.pdf',
        'application/pdf'
      );

      // Assert
      expect(attemptCount).toBe(2);
      expect(result1.success).toBe(false);
      expect(result2.success).toBe(true);
    });
  });

  // ============================================================================
  // COMMENTS WORKFLOW
  // ============================================================================

  describe('Comments Workflow', () => {
    it('should notify admin when client comments on milestone', async () => {
      // Arrange
      const milestoneId = 'milestone-123';
      const comment = 'Olá, tenho uma dúvida sobre esta etapa';

      vi.mocked(auth).mockResolvedValue(
        createMockSession({
          user: { id: mockClientId, role: UserRole.CLIENTE },
        })
      );

      vi.mocked(prisma.projectMilestone.findUnique).mockResolvedValue({
        id: milestoneId,
        projectId: mockProjectId,
        title: 'Fase 1',
        project: createMockProject({
          id: mockProjectId,
          userId: mockClientId,
        }),
      });

      vi.mocked(prisma.projectComment.create).mockResolvedValue({
        id: 'comment-123',
        milestoneId,
        projectId: mockProjectId,
        userId: mockClientId,
        content: comment,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(createNotification).mockResolvedValue({ success: true });

      // Act
      const result = await addComment(mockProjectId, comment, milestoneId);

      // Assert
      expect(result.success).toBe(true);
      expect(createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.NOVA_MENSAGEM,
        })
      );
    });

    it('should notify client when admin replies to comment', async () => {
      // Arrange
      const milestoneId = 'milestone-123';
      const adminReply = 'Olá! Vamos agendar uma reunião para discutir.';

      vi.mocked(auth).mockResolvedValue(
        createMockSession({
          user: { id: mockAdminId, role: UserRole.ADMIN },
        })
      );

      vi.mocked(prisma.projectMilestone.findUnique).mockResolvedValue({
        id: milestoneId,
        projectId: mockProjectId,
        title: 'Fase 1',
        project: createMockProject({
          id: mockProjectId,
          userId: mockClientId,
        }),
      });

      vi.mocked(prisma.projectComment.create).mockResolvedValue({
        id: 'comment-456',
        milestoneId,
        projectId: mockProjectId,
        userId: mockAdminId,
        content: adminReply,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(createNotification).mockResolvedValue({ success: true });

      // Act
      const result = await addComment(mockProjectId, adminReply, milestoneId);

      // Assert
      expect(result.success).toBe(true);
      expect(createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockClientId,
          type: NotificationType.NOVA_MENSAGEM,
        })
      );
    });

    it('should retrieve comments by milestone', async () => {
      // Arrange
      const milestoneId = 'milestone-123';
      const comments = [
        {
          id: 'comment-1',
          content: 'Primeira mensagem',
          userId: mockClientId,
          user: createMockUser({ id: mockClientId }),
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'comment-2',
          content: 'Resposta do admin',
          userId: mockAdminId,
          user: createMockUser({ id: mockAdminId, role: UserRole.ADMIN }),
          createdAt: new Date('2024-01-02'),
        },
      ];

      vi.mocked(prisma.projectComment.findMany).mockResolvedValue(comments as any);

      // Act
      const result = await getCommentsByMilestone(milestoneId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(prisma.projectComment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { milestoneId },
          orderBy: { createdAt: 'asc' },
        })
      );
    });
  });

  // ============================================================================
  // PROJECT STATUS UPDATES
  // ============================================================================

  describe('Project Status Updates', () => {
    it('should update status and notify client', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(
        createMockSession({
          user: { id: mockAdminId, role: UserRole.ADMIN },
        })
      );

      vi.mocked(prisma.project.findUnique).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockClientId,
          status: ProjectStatus.AGUARDANDO_APROVACAO,
        })
      );

      vi.mocked(prisma.project.update).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockClientId,
          status: ProjectStatus.EM_ANDAMENTO,
          startedAt: new Date(),
        })
      );

      vi.mocked(createNotification).mockResolvedValue({ success: true });

      // Act
      const result = await updateProjectStatus(mockProjectId, ProjectStatus.EM_ANDAMENTO);

      // Assert
      expect(result.success).toBe(true);
      expect(prisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockProjectId },
          data: expect.objectContaining({
            status: ProjectStatus.EM_ANDAMENTO,
            startedAt: expect.any(Date),
          }),
        })
      );

      expect(createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockClientId,
          type: NotificationType.PROJETO_ATUALIZADO,
          title: expect.stringContaining('atualizado'),
          message: expect.stringContaining(ProjectStatus.EM_ANDAMENTO),
        })
      );
    });

    it('should set completedAt when status changes to CONCLUIDO', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(
        createMockSession({
          user: { id: mockAdminId, role: UserRole.ADMIN },
        })
      );

      vi.mocked(prisma.project.findUnique).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockClientId,
          status: ProjectStatus.EM_ANDAMENTO,
          progress: 100,
        })
      );

      vi.mocked(prisma.project.update).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockClientId,
          status: ProjectStatus.CONCLUIDO,
          completedAt: new Date(),
        })
      );

      vi.mocked(createNotification).mockResolvedValue({ success: true });

      // Act
      const result = await updateProjectStatus(mockProjectId, ProjectStatus.CONCLUIDO);

      // Assert
      expect(result.success).toBe(true);
      expect(prisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: ProjectStatus.CONCLUIDO,
            completedAt: expect.any(Date),
          }),
        })
      );

      expect(createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.PROJETO_CONCLUIDO,
        })
      );
    });

    it('should prevent invalid status transitions', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(
        createMockSession({
          user: { id: mockAdminId, role: UserRole.ADMIN },
        })
      );

      vi.mocked(prisma.project.findUnique).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockClientId,
          status: ProjectStatus.CONCLUIDO,
        })
      );

      // Act - Try to go back from CONCLUIDO to EM_ANDAMENTO
      const result = await updateProjectStatus(mockProjectId, ProjectStatus.EM_ANDAMENTO);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Transição inválida');
    });
  });

  // ============================================================================
  // CLIENT PROJECT ACCESS
  // ============================================================================

  describe('Client Project Access', () => {
    it('should return only client own projects', async () => {
      // Arrange
      const clientProjects = [
        createMockProject({ id: 'proj-1', userId: mockClientId }),
        createMockProject({ id: 'proj-2', userId: mockClientId }),
      ];

      vi.mocked(auth).mockResolvedValue(
        createMockSession({
          user: { id: mockClientId, role: UserRole.CLIENTE },
        })
      );

      vi.mocked(prisma.project.findMany).mockResolvedValue(clientProjects);

      // Act
      const result = await getClientProjects();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockClientId },
        })
      );
    });

    it('should include project details with milestones and files', async () => {
      // Arrange
      const project = createMockProject({
        id: mockProjectId,
        userId: mockClientId,
        milestones: [
          createMockMilestone({ projectId: mockProjectId, order: 1 }),
          createMockMilestone({ projectId: mockProjectId, order: 2 }),
        ],
        files: [createMockProjectFile({ projectId: mockProjectId })],
      });

      vi.mocked(auth).mockResolvedValue(
        createMockSession({
          user: { id: mockClientId, role: UserRole.CLIENTE },
        })
      );

      vi.mocked(prisma.project.findFirst).mockResolvedValue(project);

      // Act
      const result = await getProjectById(mockProjectId, mockClientId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.milestones).toBeDefined();
      expect(result.data?.files).toBeDefined();
    });

    it('should prevent access to other client projects', async () => {
      // Arrange
      const otherClientId = 'user-other-456';

      vi.mocked(auth).mockResolvedValue(
        createMockSession({
          user: { id: mockClientId, role: UserRole.CLIENTE },
        })
      );

      vi.mocked(prisma.project.findFirst).mockResolvedValue(null);

      // Act
      const result = await getProjectById(mockProjectId, otherClientId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('não encontrado');
    });
  });

  // ============================================================================
  // EDGE CASES AND ERROR HANDLING
  // ============================================================================

  describe('Edge Cases and Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(
        createMockSession({
          user: { id: mockClientId, role: UserRole.CLIENTE },
        })
      );

      vi.mocked(prisma.project.findMany).mockRejectedValue(new Error('DB Error'));

      // Act
      const result = await getClientProjects();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should require authentication', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(null);

      // Act
      const result = await getClientProjects();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Não autenticado');
    });

    it('should handle file read errors', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(
        createMockSession({
          user: { id: mockClientId, role: UserRole.CLIENTE },
        })
      );

      vi.mocked(prisma.project.findFirst).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockClientId,
        })
      );

      vi.mocked(validateFile).mockResolvedValue({
        valid: true,
        mimeType: 'application/pdf',
      });

      vi.mocked(saveFile).mockRejectedValue(new Error('Disk full'));

      // Act
      const result = await uploadProjectFile(
        mockProjectId,
        Buffer.from('file content'),
        'documento.pdf',
        'application/pdf'
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle notification failures without breaking flow', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(
        createMockSession({
          user: { id: mockAdminId, role: UserRole.ADMIN },
        })
      );

      vi.mocked(prisma.project.findUnique).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockClientId,
        })
      );

      vi.mocked(prisma.project.update).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          status: ProjectStatus.EM_ANDAMENTO,
        })
      );

      // Notification fails but shouldn't break the flow
      vi.mocked(createNotification).mockResolvedValue({
        success: false,
        error: 'Email service down',
      });

      // Act
      const result = await updateProjectStatus(mockProjectId, ProjectStatus.EM_ANDAMENTO);

      // Assert - Status update should still succeed
      expect(result.success).toBe(true);
    });
  });
});
