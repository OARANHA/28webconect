/**
 * Unit Tests: Upload Server Actions
 *
 * Tests for upload-related server actions:
 * - uploadProjectFile
 * - processChunkedUpload
 * - deleteProjectFile
 * - getProjectFiles
 * - getUserStorageInfo
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  uploadProjectFile,
  processChunkedUpload,
  deleteProjectFile,
  getProjectFiles,
  getUserStorageInfo,
} from '../upload';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import {
  validateFile,
  saveFile,
  deleteFile as deleteFileFromStorage,
  checkStorageLimit,
  saveChunk,
  concatenateChunks,
  cleanupChunks,
} from '@/lib/file-upload';
import {
  createMockProject,
  createMockUser,
  createMockSession,
  createMockProjectFile,
} from '@/lib/test-utils';

describe('Upload Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUserId = 'user-123';
  const mockProjectId = 'project-456';

  // ============================================================================
  // UPLOAD PROJECT FILE
  // ============================================================================

  describe('uploadProjectFile', () => {
    it('should upload file successfully', async () => {
      // Arrange
      const file = new File(['content'], 'documento.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', file);

      vi.mocked(auth).mockResolvedValue(createMockSession({ user: { id: mockUserId } }));
      vi.mocked(prisma.project.findFirst).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockUserId,
        })
      );
      vi.mocked(validateFile).mockResolvedValue({
        valid: true,
        mimeType: 'application/pdf',
      });
      vi.mocked(saveFile).mockResolvedValue({
        filepath: 'uploads/projects/project-456/documento.pdf',
        filename: 'documento.pdf',
        filesize: 1024,
      });
      vi.mocked(prisma.projectFile.create).mockResolvedValue(
        createMockProjectFile({
          id: 'file-123',
          projectId: mockProjectId,
          filename: 'documento.pdf',
        })
      );
      vi.mocked(prisma.notification.create).mockResolvedValue({ id: 'notif-123' } as any);

      // Act
      const result = await uploadProjectFile(formData, mockProjectId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.filename).toBe('documento.pdf');
    });

    it('should reject upload when not authenticated', async () => {
      // Arrange
      const formData = new FormData();
      vi.mocked(auth).mockResolvedValue(null);

      // Act
      const result = await uploadProjectFile(formData, mockProjectId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Não autenticado');
    });

    it('should reject upload for unauthorized project', async () => {
      // Arrange
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', file);

      vi.mocked(auth).mockResolvedValue(createMockSession({ user: { id: mockUserId } }));
      vi.mocked(prisma.project.findFirst).mockResolvedValue(null);

      // Act
      const result = await uploadProjectFile(formData, mockProjectId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Projeto não encontrado');
    });

    it('should reject invalid file', async () => {
      // Arrange
      const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
      const formData = new FormData();
      formData.append('file', file);

      vi.mocked(auth).mockResolvedValue(createMockSession({ user: { id: mockUserId } }));
      vi.mocked(prisma.project.findFirst).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockUserId,
        })
      );
      vi.mocked(validateFile).mockResolvedValue({
        valid: false,
        error: 'Tipo de arquivo não permitido',
      });

      // Act
      const result = await uploadProjectFile(formData, mockProjectId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('não permitido');
    });

    it('should require file in form data', async () => {
      // Arrange
      const formData = new FormData();
      // No file appended

      vi.mocked(auth).mockResolvedValue(createMockSession({ user: { id: mockUserId } }));
      vi.mocked(prisma.project.findFirst).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockUserId,
        })
      );

      // Act
      const result = await uploadProjectFile(formData, mockProjectId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Arquivo não fornecido');
    });
  });

  // ============================================================================
  // PROCESS CHUNKED UPLOAD
  // ============================================================================

  describe('processChunkedUpload', () => {
    it('should process intermediate chunk', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('uploadId', 'upload-123');
      formData.append('chunkIndex', '0');
      formData.append('totalChunks', '3');
      formData.append('filename', 'large-file.pdf');
      formData.append('projectId', mockProjectId);
      formData.append('mimetype', 'application/pdf');
      formData.append('chunk', new Blob(['chunk data']));

      vi.mocked(auth).mockResolvedValue(createMockSession({ user: { id: mockUserId } }));
      vi.mocked(prisma.project.findFirst).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockUserId,
        })
      );
      vi.mocked(saveChunk).mockResolvedValue('/tmp/chunk-0');

      // Act
      const result = await processChunkedUpload(formData);

      // Assert
      expect(result.success).toBe(true);
      expect(saveChunk).toHaveBeenCalled();
    });

    it('should finalize upload on last chunk', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('uploadId', 'upload-123');
      formData.append('chunkIndex', '2'); // Last chunk (0-indexed, total 3)
      formData.append('totalChunks', '3');
      formData.append('filename', 'large-file.pdf');
      formData.append('projectId', mockProjectId);
      formData.append('mimetype', 'application/pdf');
      formData.append('chunk', new Blob(['final chunk']));

      vi.mocked(auth).mockResolvedValue(createMockSession({ user: { id: mockUserId } }));
      vi.mocked(prisma.project.findFirst).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockUserId,
          name: 'Projeto Teste',
        })
      );
      vi.mocked(saveChunk).mockResolvedValue('/tmp/chunk-2');
      vi.mocked(concatenateChunks).mockResolvedValue(Buffer.from('complete file'));
      vi.mocked(validateFile).mockResolvedValue({ valid: true, mimeType: 'application/pdf' });
      vi.mocked(saveFile).mockResolvedValue({
        filepath: 'uploads/projects/project-456/large-file.pdf',
        filename: 'large-file.pdf',
        filesize: 1024000,
      });
      vi.mocked(prisma.projectFile.create).mockResolvedValue(
        createMockProjectFile({
          id: 'file-123',
          filename: 'large-file.pdf',
        })
      );
      vi.mocked(cleanupChunks).mockResolvedValue();
      vi.mocked(prisma.notification.create).mockResolvedValue({ id: 'notif-123' } as any);

      // Act
      const result = await processChunkedUpload(formData);

      // Assert
      expect(result.success).toBe(true);
      expect(concatenateChunks).toHaveBeenCalled();
      expect(cleanupChunks).toHaveBeenCalled();
    });

    it('should require all chunk parameters', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('uploadId', 'upload-123');
      // Missing other required fields

      vi.mocked(auth).mockResolvedValue(createMockSession({ user: { id: mockUserId } }));

      // Act
      const result = await processChunkedUpload(formData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('incompletos');
    });
  });

  // ============================================================================
  // DELETE PROJECT FILE
  // ============================================================================

  describe('deleteProjectFile', () => {
    it('should delete file as owner', async () => {
      // Arrange
      vi.mocked(prisma.projectFile.findFirst).mockResolvedValue(
        createMockProjectFile({
          id: 'file-123',
          userId: mockUserId,
          projectId: mockProjectId,
          filepath: 'uploads/test.pdf',
        })
      );
      vi.mocked(deleteFileFromStorage).mockResolvedValue();
      vi.mocked(prisma.projectFile.delete).mockResolvedValue({} as any);

      // Act
      const result = await deleteProjectFile('file-123', mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(deleteFileFromStorage).toHaveBeenCalledWith('uploads/test.pdf');
      expect(prisma.projectFile.delete).toHaveBeenCalledWith({ where: { id: 'file-123' } });
    });

    it('should reject deletion of non-existent file', async () => {
      // Arrange
      vi.mocked(prisma.projectFile.findFirst).mockResolvedValue(null);

      // Act
      const result = await deleteProjectFile('non-existent', mockUserId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('não encontrado');
    });
  });

  // ============================================================================
  // GET PROJECT FILES
  // ============================================================================

  describe('getProjectFiles', () => {
    it('should return files for authorized project', async () => {
      // Arrange
      const files = [
        createMockProjectFile({ id: 'file-1', filename: 'doc1.pdf' }),
        createMockProjectFile({ id: 'file-2', filename: 'doc2.pdf' }),
      ];

      vi.mocked(prisma.project.findFirst).mockResolvedValue(
        createMockProject({
          id: mockProjectId,
          userId: mockUserId,
        })
      );
      vi.mocked(prisma.projectFile.findMany).mockResolvedValue(files);

      // Act
      const result = await getProjectFiles(mockProjectId, mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(prisma.projectFile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: mockProjectId },
          orderBy: { uploadedAt: 'desc' },
        })
      );
    });

    it('should reject access to unauthorized project', async () => {
      // Arrange
      vi.mocked(prisma.project.findFirst).mockResolvedValue(null);

      // Act
      const result = await getProjectFiles(mockProjectId, mockUserId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('não encontrado');
    });
  });

  // ============================================================================
  // GET USER STORAGE INFO
  // ============================================================================

  describe('getUserStorageInfo', () => {
    it('should return storage information', async () => {
      // Arrange
      vi.mocked(checkStorageLimit).mockResolvedValue({
        valid: true,
        storageInfo: { used: 1000000, limit: 10000000000, available: 9999000000 },
        percentage: 0.01,
      });

      // Act
      const result = await getUserStorageInfo(mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        used: 1000000,
        limit: 10000000000,
        available: 9999000000,
        percentage: 0.01,
      });
    });

    it('should handle storage check failure', async () => {
      // Arrange
      vi.mocked(checkStorageLimit).mockResolvedValue({
        valid: false,
        error: 'Erro ao verificar',
        percentage: 0,
      });

      // Act
      const result = await getUserStorageInfo(mockUserId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Erro ao verificar');
    });
  });
});
