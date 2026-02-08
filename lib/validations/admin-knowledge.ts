/**
 * Validações para gestão da base de conhecimento
 */

import { z } from 'zod';

// Constantes de limites
export const MAX_DOCUMENTS = 1000;
export const MAX_TOTAL_SIZE_MB = 500;
export const MAX_DOCUMENT_SIZE_MB = 10;
export const MAX_DOCUMENT_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;
export const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;

// Tipos MIME permitidos para documentos
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
] as const;

// Schema para upload de documento
export const documentUploadSchema = z.object({
  filename: z
    .string()
    .min(1, 'Nome do arquivo é obrigatório')
    .max(255, 'Nome do arquivo deve ter no máximo 255 caracteres'),
  filesize: z
    .number()
    .positive('Tamanho do arquivo deve ser positivo')
    .max(MAX_DOCUMENT_SIZE_BYTES, `Arquivo excede o limite de ${MAX_DOCUMENT_SIZE_MB}MB`),
  mimetype: z.enum(ALLOWED_DOCUMENT_TYPES, {
    errorMap: () => ({ message: 'Tipo de arquivo não suportado. Use PDF, DOC, DOCX, TXT ou MD' }),
  }),
});

// Schema para metadados do documento
export const documentMetadataSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .optional(),
  type: z.enum(['upload', 'page', 'faq', 'manual']).default('upload'),
  category: z.string().max(100, 'Categoria deve ter no máximo 100 caracteres').optional(),
  source: z.enum(['upload', 'scraping', 'manual']).default('upload'),
  tags: z.array(z.string().max(50)).max(20, 'Máximo de 20 tags permitidas').default([]),
});

// Schema para solicitação de reindexação
export const reindexRequestSchema = z.object({
  documentId: z.string().cuid('ID do documento inválido').optional(),
  reindexAll: z.boolean().default(false),
});

// Schema para resposta de estatísticas
export const knowledgeStatsSchema = z.object({
  totalDocs: z.number().int().min(0),
  totalSize: z.number().int().min(0),
  lastUpdate: z.string().datetime().nullable(),
  breakdown: z.record(z.number().int().min(0)),
});

// Tipos inferidos dos schemas
export type DocumentUploadSchema = z.infer<typeof documentUploadSchema>;
export type DocumentMetadataSchema = z.infer<typeof documentMetadataSchema>;
export type ReindexRequestSchema = z.infer<typeof reindexRequestSchema>;
export type KnowledgeStatsSchema = z.infer<typeof knowledgeStatsSchema>;

/**
 * Valida se o arquivo pode ser adicionado sem exceder limites
 * @param currentDocCount Número atual de documentos
 * @param currentTotalSize Tamanho total atual em bytes
 * @param newFileSize Tamanho do novo arquivo em bytes
 * @returns Resultado da validação
 */
export function validateLimits(
  currentDocCount: number,
  currentTotalSize: number,
  newFileSize: number
): { valid: boolean; error?: string } {
  // Verifica limite de documentos
  if (currentDocCount >= MAX_DOCUMENTS) {
    return {
      valid: false,
      error: `Limite de ${MAX_DOCUMENTS} documentos atingido. Exclua documentos antigos antes de adicionar novos.`,
    };
  }

  // Verifica limite de tamanho total
  if (currentTotalSize + newFileSize > MAX_TOTAL_SIZE_BYTES) {
    const availableSpace = Math.max(0, MAX_TOTAL_SIZE_BYTES - currentTotalSize);
    const availableMB = (availableSpace / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `Limite de armazenamento de ${MAX_TOTAL_SIZE_MB}MB atingido. Espaço disponível: ${availableMB} MB`,
    };
  }

  return { valid: true };
}

/**
 * Formata o tamanho do arquivo para exibição
 * @param bytes Tamanho em bytes
 * @returns String formatada
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

/**
 * Calcula porcentagem de uso do armazenamento
 * @param currentSize Tamanho atual em bytes
 * @returns Porcentagem (0-100)
 */
export function getStorageUsagePercentage(currentSize: number): number {
  return Math.min(100, Math.round((currentSize / MAX_TOTAL_SIZE_BYTES) * 100));
}

/**
 * Retorna cor de alerta baseada na porcentagem de uso
 * @param percentage Porcentagem de uso (0-100)
 * @returns Classe de cor Tailwind
 */
export function getUsageColorClass(percentage: number): string {
  if (percentage > 95) return 'text-red-500 bg-red-500';
  if (percentage > 80) return 'text-yellow-500 bg-yellow-500';
  return 'text-green-500 bg-green-500';
}
