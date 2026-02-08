/**
 * Testes unitários para Server Actions de gestão da base de conhecimento
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  uploadDocument,
  deleteDocument,
  reindexDocument,
  reindexAll,
  getDocuments,
  getKnowledgeStats,
} from '../admin-knowledge';

// Mocks
vi.mock('@/lib/prisma', () => ({
  prisma: {
    document: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/embeddings', () => ({
  generateEmbedding: vi.fn(),
  storeDocument: vi.fn(),
}));

vi.mock('@/lib/text-extraction', () => ({
  extractTextFromFile: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn(),
  readFile: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from '@/lib/prisma';
import { generateEmbedding, storeDocument } from '@/lib/embeddings';
import { extractTextFromFile } from '@/lib/text-extraction';

describe('Admin Knowledge Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getKnowledgeStats', () => {
    it('deve retornar estatísticas corretamente', async () => {
      vi.mocked(prisma.document.count).mockResolvedValue(5);
      vi.mocked(prisma.document.findMany).mockResolvedValue([
        {
          metadata: { filesize: 1024, mimetype: 'application/pdf' },
          createdAt: new Date('2026-02-01'),
        },
        {
          metadata: { filesize: 2048, mimetype: 'text/plain' },
          createdAt: new Date('2026-02-02'),
        },
      ] as never);

      const result = await getKnowledgeStats();

      expect(result.success).toBe(true);
      expect(result.stats).toEqual({
        totalDocs: 5,
        totalSize: 3072,
        lastUpdate: '2026-02-02T00:00:00.000Z',
        breakdown: { pdf: 1, docx: 0, txt: 1, md: 0, page: 0 },
        storagePercentage: expect.any(Number),
      });
    });

    it('deve retornar erro em caso de falha', async () => {
      vi.mocked(prisma.document.count).mockRejectedValue(new Error('DB Error'));

      const result = await getKnowledgeStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Falha ao obter estatísticas');
    });
  });

  describe('getDocuments', () => {
    it('deve listar documentos formatados', async () => {
      vi.mocked(prisma.document.findMany).mockResolvedValue([
        {
          id: 'doc-1',
          content: 'Conteúdo',
          metadata: {
            title: 'Documento Teste',
            filename: 'teste.pdf',
            type: 'upload',
            filesize: 1024,
            mimetype: 'application/pdf',
          },
          createdAt: new Date('2026-02-01'),
          updatedAt: new Date('2026-02-01'),
        },
      ] as never);

      const result = await getDocuments();

      expect(result.success).toBe(true);
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0]).toMatchObject({
        id: 'doc-1',
        title: 'Documento Teste',
        filename: 'teste.pdf',
        type: 'upload',
        size: 1024,
        mimetype: 'application/pdf',
      });
    });
  });

  describe('uploadDocument', () => {
    it('deve rejeitar upload sem arquivo', async () => {
      const formData = new FormData();
      const result = await uploadDocument(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Nenhum arquivo fornecido');
    });

    it('deve rejeitar tipo de arquivo inválido', async () => {
      const file = new File(['content'], 'teste.png', { type: 'image/png' });
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadDocument(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('não suportado');
      expect(result.error).toContain('DOC');
    });

    it('deve rejeitar quando limite de documentos atingido', async () => {
      vi.mocked(prisma.document.count).mockResolvedValue(1000);
      vi.mocked(prisma.document.findMany).mockResolvedValue([]);

      const file = new File(['content'], 'teste.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadDocument(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Limite de 1000 documentos');
    });

    it('deve rejeitar quando limite de tamanho atingido', async () => {
      // Simula ~500MB já usado
      const largeMetadata = { filesize: 500 * 1024 * 1024 };
      vi.mocked(prisma.document.count).mockResolvedValue(1);
      vi.mocked(prisma.document.findMany).mockResolvedValue([largeMetadata] as never);

      const file = new File(['x'.repeat(1024)], 'teste.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadDocument(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Limite de armazenamento');
    });

    it('deve processar upload válido com sucesso', async () => {
      vi.mocked(prisma.document.count).mockResolvedValue(0);
      vi.mocked(prisma.document.findMany).mockResolvedValue([]);
      vi.mocked(extractTextFromFile).mockResolvedValue('Texto extraído');
      vi.mocked(generateEmbedding).mockResolvedValue([0.1, 0.2, 0.3]);
      vi.mocked(storeDocument).mockResolvedValue({
        id: 'new-doc',
        content: 'Texto extraído',
        metadata: { title: 'teste' },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      const file = new File(['content'], 'teste.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', 'Meu Documento');

      const result = await uploadDocument(formData);

      expect(result.success).toBe(true);
      expect(storeDocument).toHaveBeenCalled();
    });
  });

  describe('deleteDocument', () => {
    it('deve deletar documento existente', async () => {
      vi.mocked(prisma.document.findUnique).mockResolvedValue({
        id: 'doc-1',
        metadata: { filepath: '123_teste.pdf' },
      } as never);
      vi.mocked(prisma.document.delete).mockResolvedValue({} as never);

      const result = await deleteDocument('doc-1');

      expect(result.success).toBe(true);
      expect(prisma.document.delete).toHaveBeenCalledWith({ where: { id: 'doc-1' } });
    });

    it('deve retornar erro para documento não encontrado', async () => {
      vi.mocked(prisma.document.findUnique).mockResolvedValue(null);

      const result = await deleteDocument('doc-inexistente');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Documento não encontrado');
    });
  });

  describe('reindexDocument', () => {
    it('deve reindexar documento com sucesso', async () => {
      vi.mocked(prisma.document.findUnique).mockResolvedValue({
        id: 'doc-1',
        content: 'Conteúdo antigo',
        metadata: {},
      } as never);
      vi.mocked(generateEmbedding).mockResolvedValue([0.1, 0.2, 0.3]);
      vi.mocked(prisma.document.update).mockResolvedValue({} as never);

      const result = await reindexDocument('doc-1');

      expect(result.success).toBe(true);
      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('deve retornar erro para documento não encontrado', async () => {
      vi.mocked(prisma.document.findUnique).mockResolvedValue(null);

      const result = await reindexDocument('doc-inexistente');

      expect(result.success).toBe(false);
      expect(result.failed).toBe(1);
    });
  });

  describe('reindexAll', () => {
    it('deve reindexar todos os documentos', async () => {
      vi.mocked(prisma.document.findMany).mockResolvedValue([
        { id: 'doc-1' },
        { id: 'doc-2' },
      ] as never);
      vi.mocked(prisma.document.findUnique).mockResolvedValue({
        id: 'doc-1',
        content: 'Texto',
        metadata: {},
      } as never);
      vi.mocked(generateEmbedding).mockResolvedValue([0.1, 0.2, 0.3]);
      vi.mocked(prisma.document.update).mockResolvedValue({} as never);

      const result = await reindexAll();

      expect(result.processed + result.failed).toBeGreaterThan(0);
    });
  });
});
