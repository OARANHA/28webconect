'use server';

/**
 * Server Actions para gestão da base de conhecimento
 */

import { revalidatePath } from 'next/cache';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { generateEmbedding, storeDocument } from '@/lib/embeddings';
import { extractTextFromFile } from '@/lib/text-extraction';
import {
  validateLimits,
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  MAX_DOCUMENTS,
  MAX_TOTAL_SIZE_BYTES,
} from '@/lib/validations/admin-knowledge';
import { scrapePublicPages } from '@/lib/site-scraper';
import type { DocumentUploadResult, ReindexResult, ScrapeResult } from '@/types/admin-knowledge';

// Diretório de upload para documentos da base de conhecimento
const KNOWLEDGE_UPLOAD_DIR = process.env.KNOWLEDGE_UPLOAD_DIR || 'uploads/knowledge';

/**
 * Garante que o diretório de upload existe
 */
async function ensureUploadDir(): Promise<string> {
  const uploadDir = join(process.cwd(), KNOWLEDGE_UPLOAD_DIR);
  await mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

/**
 * Obtém estatísticas da base de conhecimento
 */
export async function getKnowledgeStats() {
  try {
    const [totalDocs, documents] = await Promise.all([
      prisma.document.count(),
      prisma.document.findMany({
        select: {
          metadata: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Calcula tamanho total
    let totalSize = 0;
    const breakdown: Record<string, number> = { pdf: 0, doc: 0, docx: 0, txt: 0, md: 0, page: 0 };

    for (const doc of documents) {
      const metadata = doc.metadata as Record<string, unknown> | null;
      if (metadata?.filesize) {
        totalSize += metadata.filesize as number;
      }
      if (metadata?.mimetype) {
        const mime = metadata.mimetype as string;
        if (mime === 'application/pdf') breakdown.pdf++;
        else if (mime === 'application/msword') breakdown.doc++;
        else if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
          breakdown.docx++;
        else if (mime === 'text/plain') breakdown.txt++;
        else if (mime === 'text/markdown') breakdown.md++;
      }
      if (metadata?.type === 'page') breakdown.page++;
    }

    const lastUpdate = documents.length > 0 ? documents[0].createdAt.toISOString() : null;

    return {
      success: true,
      stats: {
        totalDocs,
        totalSize,
        lastUpdate,
        breakdown,
        storagePercentage: Math.min(100, Math.round((totalSize / MAX_TOTAL_SIZE_BYTES) * 100)),
      },
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return { success: false, error: 'Falha ao obter estatísticas' };
  }
}

/**
 * Lista todos os documentos
 */
export async function getDocuments() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const formattedDocs = documents.map((doc) => {
      const metadata = doc.metadata as Record<string, unknown> | null;
      return {
        id: doc.id,
        title: (metadata?.title as string) || 'Sem título',
        filename: (metadata?.filename as string) || 'unknown',
        type: (metadata?.type as string) || 'upload',
        category: (metadata?.category as string) || null,
        size: (metadata?.filesize as number) || 0,
        mimetype: (metadata?.mimetype as string) || 'application/octet-stream',
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      };
    });

    return { success: true, documents: formattedDocs };
  } catch (error) {
    console.error('Erro ao listar documentos:', error);
    return { success: false, error: 'Falha ao listar documentos' };
  }
}

/**
 * Faz upload e indexa um documento
 */
export async function uploadDocument(formData: FormData): Promise<DocumentUploadResult> {
  try {
    const file = formData.get('file') as File;
    const title = formData.get('title') as string | null;
    const category = formData.get('category') as string | null;
    const tagsJson = formData.get('tags') as string | null;

    if (!file) {
      return { success: false, error: 'Nenhum arquivo fornecido' };
    }

    // Valida tipo MIME
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type as (typeof ALLOWED_DOCUMENT_TYPES)[number])) {
      return {
        success: false,
        error: 'Tipo de arquivo não suportado. Use PDF, DOC, DOCX, TXT ou MD',
      };
    }

    // Valida tamanho
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      return { success: false, error: `Arquivo excede o limite de 10MB` };
    }

    // Verifica limites globais
    const currentCount = await prisma.document.count();
    const currentDocs = await prisma.document.findMany({
      select: { metadata: true },
    });
    const currentSize = currentDocs.reduce((acc, doc) => {
      const metadata = doc.metadata as Record<string, unknown> | null;
      return acc + ((metadata?.filesize as number) || 0);
    }, 0);

    const limitCheck = validateLimits(currentCount, currentSize, file.size);
    if (!limitCheck.valid) {
      return { success: false, error: limitCheck.error };
    }

    // Converte arquivo para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extrai texto
    let extractedText: string;
    try {
      extractedText = await extractTextFromFile(buffer, file.type);
    } catch (error) {
      return { success: false, error: 'Falha ao extrair texto do arquivo' };
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return { success: false, error: 'Arquivo não contém texto extraível' };
    }

    // Gera embedding
    let embedding: number[];
    try {
      embedding = await generateEmbedding(extractedText);
    } catch (error) {
      console.error('Erro ao gerar embedding:', error);
      return { success: false, error: 'Falha ao gerar embedding do documento' };
    }

    // Salva arquivo no disco
    const uploadDir = await ensureUploadDir();
    const timestamp = Date.now();
    const safeFilename = file.name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
    const filename = `${timestamp}_${safeFilename}`;
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Prepara tags
    const tags = tagsJson ? JSON.parse(tagsJson) : [];

    // Cria documento no banco
    const metadata = {
      title: title || file.name.replace(/\.[^/.]+$/, ''),
      filename: file.name,
      type: 'upload' as const,
      category: category || 'geral',
      source: 'upload' as const,
      tags,
      filesize: file.size,
      mimetype: file.type,
      filepath: filename,
    };

    const document = await storeDocument(extractedText, embedding, metadata);

    revalidatePath('/admin/base-conhecimento');

    return {
      success: true,
      document: {
        ...document,
        parsedMetadata: metadata,
      },
      details: {
        extractedTextLength: extractedText.length,
        embeddingGenerated: true,
      },
    };
  } catch (error) {
    console.error('Erro no upload:', error);
    return { success: false, error: 'Erro interno ao processar upload' };
  }
}

/**
 * Deleta um documento
 */
export async function deleteDocument(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc) {
      return { success: false, error: 'Documento não encontrado' };
    }

    // Deleta arquivo físico se existir
    const metadata = doc.metadata as Record<string, unknown> | null;
    const filepath = metadata?.filepath as string | undefined;
    if (filepath) {
      try {
        const fullPath = join(process.cwd(), KNOWLEDGE_UPLOAD_DIR, filepath);
        await unlink(fullPath);
      } catch (e) {
        console.warn('Arquivo físico não encontrado ou já deletado:', filepath);
      }
    }

    // Deleta do banco
    await prisma.document.delete({
      where: { id },
    });

    revalidatePath('/admin/base-conhecimento');

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    return { success: false, error: 'Falha ao deletar documento' };
  }
}

/**
 * Reindexa um documento específico
 */
export async function reindexDocument(id: string): Promise<ReindexResult> {
  try {
    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc) {
      return { success: false, processed: 0, failed: 1, errors: ['Documento não encontrado'] };
    }

    // Para documentos de upload, tenta reextrair do arquivo
    const metadata = doc.metadata as Record<string, unknown> | null;
    const filepath = metadata?.filepath as string | undefined;
    const mimetype = metadata?.mimetype as string | undefined;

    let text = doc.content;
    let embedding: number[];

    if (filepath && mimetype) {
      try {
        const { readFile } = await import('fs/promises');
        const fullPath = join(process.cwd(), KNOWLEDGE_UPLOAD_DIR, filepath);
        const buffer = await readFile(fullPath);
        text = await extractTextFromFile(buffer, mimetype);
      } catch (e) {
        console.warn('Não foi possível reextrair texto, usando conteúdo existente');
      }
    }

    // Regenera embedding
    try {
      embedding = await generateEmbedding(text);
    } catch (error) {
      return { success: false, processed: 0, failed: 1, errors: ['Falha ao gerar embedding'] };
    }

    // Atualiza documento
    await prisma.document.update({
      where: { id },
      data: {
        content: text,
        embedding,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/base-conhecimento');

    return { success: true, processed: 1, failed: 0, errors: [] };
  } catch (error) {
    console.error('Erro ao reindexar documento:', error);
    return { success: false, processed: 0, failed: 1, errors: ['Erro interno'] };
  }
}

/**
 * Reindexa todos os documentos
 */
export async function reindexAll(): Promise<ReindexResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let processed = 0;
  let failed = 0;

  try {
    const documents = await prisma.document.findMany({
      select: { id: true },
    });

    // Processa em lotes de 5 para não sobrecarregar
    const batchSize = 5;
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (doc) => {
          try {
            const result = await reindexDocument(doc.id);
            if (result.success) {
              processed++;
            } else {
              failed++;
              errors.push(...result.errors);
            }
          } catch (e) {
            failed++;
            errors.push(`Erro no documento ${doc.id}`);
          }
        })
      );

      // Delay entre lotes
      if (i + batchSize < documents.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    revalidatePath('/admin/base-conhecimento');

    return {
      success: failed === 0,
      processed,
      failed,
      errors,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Erro na reindexação em massa:', error);
    return { success: false, processed, failed, errors: [...errors, 'Erro interno'] };
  }
}

/**
 * Faz scraping e indexa páginas públicas
 * Respeita limites globais de documentos e tamanho
 */
export async function scrapeWebsite(): Promise<ScrapeResult> {
  const errors: string[] = [];
  const urls: string[] = [];

  try {
    // Busca contagem atual e tamanho total antes de processar
    const currentCount = await prisma.document.count();
    const currentDocs = await prisma.document.findMany({
      select: { metadata: true },
    });
    const currentSize = currentDocs.reduce((acc, doc) => {
      const metadata = doc.metadata as Record<string, unknown> | null;
      return acc + ((metadata?.filesize as number) || 0);
    }, 0);

    const pages = await scrapePublicPages();
    let currentDocCount = currentCount;
    let currentTotalSize = currentSize;

    for (const page of pages) {
      try {
        // Estima tamanho da página a partir do conteúdo
        const estimatedSize = Buffer.byteLength(page.content, 'utf-8');

        // Verifica se já existe documento com mesma URL
        const existing = await prisma.document.findFirst({
          where: {
            metadata: {
              path: ['url'],
              equals: page.url,
            },
          },
        });

        if (!existing) {
          // Valida limites apenas para novos documentos
          const limitCheck = validateLimits(currentDocCount, currentTotalSize, estimatedSize);
          if (!limitCheck.valid) {
            // Limite atingido - para processamento e retorna erro
            return {
              success: false,
              pagesIndexed: urls.length,
              urls,
              errors: [...errors, `Limite atingido ao processar ${page.url}: ${limitCheck.error}`],
            };
          }
        }

        // Gera embedding
        const embedding = await generateEmbedding(page.content);

        // Prepara metadata com filesize
        const metadataWithSize = {
          ...page.metadata,
          filesize: estimatedSize,
          mimetype: 'text/html',
        };

        if (existing) {
          // Atualiza documento existente
          await prisma.document.update({
            where: { id: existing.id },
            data: {
              content: page.content,
              embedding,
              metadata: {
                ...(existing.metadata as Record<string, unknown>),
                ...metadataWithSize,
                updatedAt: new Date().toISOString(),
              },
              updatedAt: new Date(),
            },
          });
        } else {
          // Cria novo documento
          await storeDocument(page.content, embedding, metadataWithSize);
          // Atualiza contadores para próxima iteração
          currentDocCount++;
          currentTotalSize += estimatedSize;
        }

        urls.push(page.url);
      } catch (e) {
        errors.push(`Erro ao indexar ${page.url}: ${e}`);
      }
    }

    revalidatePath('/admin/base-conhecimento');

    return {
      success: errors.length === 0,
      pagesIndexed: urls.length,
      urls,
      errors,
    };
  } catch (error) {
    console.error('Erro no scraping:', error);
    return { success: false, pagesIndexed: urls.length, urls, errors: [...errors, 'Erro interno'] };
  }
}
