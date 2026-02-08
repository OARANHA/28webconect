import { z } from 'zod';
import { AllowedMimeType, FileValidationResult, FileUploadInput } from '@/types/file-upload';

// Mapeamento de extensões para tipos MIME permitidos
export const allowedMimeTypes: Record<string, AllowedMimeType> = {
  // Documentos
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Imagens
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  // Vídeos
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  // Compactados
  '.zip': 'application/zip',
  '.rar': 'application/x-rar-compressed',
};

// Limites máximos por categoria (em bytes)
export const maxFileSizes = {
  documents: 10 * 1024 * 1024, // 10MB
  images: 5 * 1024 * 1024, // 5MB
  videos: 100 * 1024 * 1024, // 100MB
  archives: 50 * 1024 * 1024, // 50MB
};

// Mapeamento de MIME types para categorias
const mimeTypeCategories: Record<string, keyof typeof maxFileSizes> = {
  'application/pdf': 'documents',
  'application/msword': 'documents',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'documents',
  'text/plain': 'documents',
  'text/markdown': 'documents',
  'application/vnd.ms-excel': 'documents',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'documents',
  'image/jpeg': 'images',
  'image/png': 'images',
  'image/svg+xml': 'images',
  'image/gif': 'images',
  'video/mp4': 'videos',
  'video/quicktime': 'videos',
  'video/x-msvideo': 'videos',
  'application/zip': 'archives',
  'application/x-rar-compressed': 'archives',
};

// Schema Zod para validação de upload
export const fileUploadSchema = z.object({
  filename: z
    .string()
    .min(1, 'Nome do arquivo é obrigatório')
    .max(255, 'Nome do arquivo deve ter no máximo 255 caracteres'),
  filesize: z.number().positive('Tamanho do arquivo deve ser positivo'),
  mimetype: z.enum([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'application/zip',
    'application/x-rar-compressed',
  ] as const),
  projectId: z.string().cuid('ID do projeto inválido'),
});

// Tipo inferido do schema
export type FileUploadSchema = z.infer<typeof fileUploadSchema>;

/**
 * Extrai a extensão do arquivo (incluindo o ponto)
 * @param filename Nome do arquivo
 * @returns Extensão do arquivo em lowercase ou null se não houver
 */
export function getFileExtension(filename: string): string | null {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return null;
  }
  return filename.slice(lastDotIndex).toLowerCase();
}

/**
 * Sanitiza o nome do arquivo removendo caracteres perigosos
 * @param filename Nome do arquivo
 * @returns Nome sanitizado
 */
export function sanitizeFilename(filename: string): string {
  // Remove caracteres que podem ser usados para path traversal
  return filename
    .replace(/[<>\/:"|?*\x00-\x1f]/g, '_')
    .replace(/\.\./g, '_')
    .trim();
}

/**
 * Valida se a extensão do arquivo corresponde ao MIME type declarado
 * @param filename Nome do arquivo
 * @param mimetype MIME type declarado
 * @returns Resultado da validação
 */
export function validateFileType(filename: string, mimetype: string): FileValidationResult {
  const extension = getFileExtension(filename);

  if (!extension) {
    return {
      valid: false,
      error: 'Arquivo sem extensão não é permitido',
    };
  }

  const expectedMimeType = allowedMimeTypes[extension];

  if (!expectedMimeType) {
    return {
      valid: false,
      error: `Extensão "${extension}" não é permitida`,
    };
  }

  // Verifica se o MIME type corresponde à extensão
  if (mimetype !== expectedMimeType) {
    // Alguns navegadores podem enviar MIME types genéricos
    const isCompatible =
      (extension === '.jpg' || extension === '.jpeg') && mimetype === 'image/jpeg';

    if (!isCompatible) {
      return {
        valid: false,
        error: `Tipo de arquivo inconsistente: extensão "${extension}" não corresponde ao tipo "${mimetype}"`,
      };
    }
  }

  return {
    valid: true,
    mimeType: expectedMimeType,
  };
}

/**
 * Retorna o tamanho máximo permitido para uma categoria de arquivo
 * @param mimetype MIME type do arquivo
 * @returns Tamanho máximo em bytes
 */
export function getMaxFileSize(mimetype: string): number {
  const category = mimeTypeCategories[mimetype];
  if (!category) {
    // Se não reconhecer a categoria, usa o menor limite por segurança
    return maxFileSizes.documents;
  }
  return maxFileSizes[category];
}

/**
 * Retorna a categoria do arquivo baseada no MIME type
 * @param mimetype MIME type do arquivo
 * @returns Nome da categoria
 */
export function getFileCategory(mimetype: string): string {
  const category = mimeTypeCategories[mimetype];
  if (!category) return 'unknown';

  const categoryLabels: Record<string, string> = {
    documents: 'documentos',
    images: 'imagens',
    videos: 'vídeos',
    archives: 'arquivos compactados',
  };

  return categoryLabels[category] || 'arquivos';
}

/**
 * Formata o tamanho do arquivo para exibição
 * @param bytes Tamanho em bytes
 * @returns String formatada (ex: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

/**
 * Valida um arquivo completo (tipo e tamanho)
 * @param input Dados do arquivo
 * @returns Resultado da validação
 */
export function validateFile(input: FileUploadInput): FileValidationResult {
  // Valida schema Zod
  const schemaResult = fileUploadSchema.safeParse(input);
  if (!schemaResult.success) {
    const errors = schemaResult.error.errors;
    return {
      valid: false,
      error: errors.map((e) => e.message).join(', '),
    };
  }

  // Valida tipo/extensão
  const typeValidation = validateFileType(input.filename, input.mimetype);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // Valida tamanho
  const maxSize = getMaxFileSize(input.mimetype);
  if (input.filesize > maxSize) {
    const category = getFileCategory(input.mimetype);
    return {
      valid: false,
      error: `Arquivo excede o limite de ${formatFileSize(maxSize)} para ${category}`,
    };
  }

  return {
    valid: true,
    mimeType: typeValidation.mimeType,
  };
}

/**
 * Lista todos os tipos MIME permitidos
 * @returns Array de MIME types
 */
export function getAllowedMimeTypes(): AllowedMimeType[] {
  return Object.values(allowedMimeTypes);
}

/**
 * Lista todas as extensões permitidas
 * @returns Array de extensões
 */
export function getAllowedExtensions(): string[] {
  return Object.keys(allowedMimeTypes);
}
