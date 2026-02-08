import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from './prisma';
import {
  validateFileType,
  getMaxFileSize,
  formatFileSize,
  getFileExtension,
  sanitizeFilename,
} from './validations/file-upload';
import { StorageCheckResult, SavedFileResult, FileValidationResult } from '@/types/file-upload';

// Configurações
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_UPLOAD_SIZE_MB = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '100', 10);
const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

/**
 * Gera um ID único para upload
 * @returns ID único
 */
export function generateUploadId(): string {
  return crypto.randomUUID();
}

/**
 * Gera um nome de arquivo único baseado no original
 * @param originalFilename Nome original do arquivo
 * @returns Nome único do arquivo
 */
export function generateUniqueFilename(originalFilename: string): string {
  const extension = getFileExtension(originalFilename) || '';
  const uniqueId = crypto.randomUUID();
  const sanitized = sanitizeFilename(originalFilename.replace(extension, ''));
  const truncated = sanitized.slice(0, 50); // Limita nome base
  return `${truncated}_${uniqueId}${extension}`;
}

/**
 * Retorna o caminho completo do diretório de upload de um projeto
 * @param projectId ID do projeto
 * @returns Caminho absoluto do diretório
 */
export function getProjectUploadDir(projectId: string): string {
  return path.join(process.cwd(), UPLOAD_DIR, 'projects', projectId);
}

/**
 * Retorna o caminho completo do diretório temporário para chunks
 * @param uploadId ID do upload
 * @returns Caminho absoluto do diretório
 */
export function getTempUploadDir(uploadId: string): string {
  return path.join(process.cwd(), UPLOAD_DIR, 'temp', uploadId);
}

/**
 * Cria o diretório de upload se não existir
 * @param dirPath Caminho do diretório
 */
export async function ensureUploadDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Verifica o limite de storage do usuário
 * @param userId ID do usuário
 * @returns Informações de storage e resultado da validação
 */
export async function checkStorageLimit(
  userId: string
): Promise<StorageCheckResult & { percentage: number }> {
  try {
    // Busca o usuário com briefing e plano de preços
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        briefings: {
          include: {
            project: {
              include: {
                briefing: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return {
        valid: false,
        error: 'Usuário não encontrado',
        percentage: 0,
      };
    }

    // Encontra o briefing aprovado com projeto
    const approvedBriefing = user.briefings.find((b) => b.project && b.status === 'APROVADO');

    if (!approvedBriefing || !approvedBriefing.project) {
      return {
        valid: false,
        error: 'Nenhum projeto ativo encontrado para este usuário',
        percentage: 0,
      };
    }

    // Busca o plano de preços baseado no tipo de serviço
    const pricingPlan = await prisma.pricingPlan.findUnique({
      where: { serviceType: approvedBriefing.serviceType },
    });

    if (!pricingPlan) {
      return {
        valid: false,
        error: 'Plano de preços não encontrado para o serviço contratado',
        percentage: 0,
      };
    }

    const storageLimitGB = pricingPlan.storageLimit;
    const storageLimitBytes = storageLimitGB * 1024 * 1024 * 1024;

    // Calcula storage usado pelo usuário em todos os projetos
    const storageUsedResult = await prisma.projectFile.aggregate({
      where: { userId },
      _sum: { filesize: true },
    });

    const storageUsed = storageUsedResult._sum.filesize || 0;
    const available = storageLimitBytes - storageUsed;
    const percentage = Math.round((storageUsed / storageLimitBytes) * 100);

    return {
      valid: available > 0,
      storageInfo: {
        used: storageUsed,
        limit: storageLimitBytes,
        available: Math.max(0, available),
      },
      percentage,
    };
  } catch (error) {
    console.error('Erro ao verificar limite de storage:', error);
    return {
      valid: false,
      error: 'Erro ao verificar limite de storage',
      percentage: 0,
    };
  }
}

/**
 * Valida um arquivo considerando plano do usuário
 * @param file Arquivo a ser validado
 * @param userId ID do usuário
 * @returns Resultado da validação
 */
export async function validateFile(
  file: { filename: string; mimetype: string; filesize: number },
  userId: string
): Promise<
  FileValidationResult & { storageInfo?: { used: number; limit: number; available: number } }
> {
  // Valida tipo de arquivo
  const typeValidation = validateFileType(file.filename, file.mimetype);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // Valida tamanho por categoria
  const maxSize = getMaxFileSize(file.mimetype);
  if (file.filesize > maxSize) {
    return {
      valid: false,
      error: `Arquivo excede o limite de ${formatFileSize(maxSize)} para este tipo de arquivo`,
    };
  }

  // Valida tamanho global máximo
  if (file.filesize > MAX_UPLOAD_SIZE_BYTES) {
    return {
      valid: false,
      error: `Arquivo excede o limite máximo de ${MAX_UPLOAD_SIZE_MB}MB`,
    };
  }

  // Verifica limite de storage
  const storageCheck = await checkStorageLimit(userId);
  if (!storageCheck.valid) {
    return {
      valid: false,
      error: storageCheck.error || 'Limite de armazenamento atingido',
      storageInfo: storageCheck.storageInfo,
    };
  }

  // Verifica se há espaço suficiente para este arquivo específico
  if (storageCheck.storageInfo && file.filesize > storageCheck.storageInfo.available) {
    return {
      valid: false,
      error: `Espaço insuficiente. Disponível: ${formatFileSize(storageCheck.storageInfo.available)}`,
      storageInfo: storageCheck.storageInfo,
    };
  }

  return {
    valid: true,
    mimeType: typeValidation.mimeType,
    storageInfo: storageCheck.storageInfo,
  };
}

/**
 * Salva um arquivo no sistema de arquivos
 * @param fileBuffer Buffer do arquivo
 * @param projectId ID do projeto
 * @param originalFilename Nome original do arquivo
 * @returns Informações do arquivo salvo
 */
export async function saveFile(
  fileBuffer: Buffer,
  projectId: string,
  originalFilename: string
): Promise<SavedFileResult> {
  const uploadDir = getProjectUploadDir(projectId);
  await ensureUploadDir(uploadDir);

  const uniqueFilename = generateUniqueFilename(originalFilename);
  const filepath = path.join(uploadDir, uniqueFilename);

  await fs.writeFile(filepath, fileBuffer);

  return {
    filepath: path.relative(process.cwd(), filepath),
    filename: uniqueFilename,
    filesize: fileBuffer.length,
  };
}

/**
 * Salva um chunk temporário
 * @param chunkBuffer Buffer do chunk
 * @param uploadId ID do upload
 * @param chunkIndex Índice do chunk
 * @returns Caminho do chunk salvo
 */
export async function saveChunk(
  chunkBuffer: Buffer,
  uploadId: string,
  chunkIndex: number
): Promise<string> {
  const tempDir = getTempUploadDir(uploadId);
  await ensureUploadDir(tempDir);

  const chunkPath = path.join(tempDir, `chunk-${chunkIndex}`);
  await fs.writeFile(chunkPath, chunkBuffer);

  return chunkPath;
}

/**
 * Concatena chunks em um arquivo final
 * @param uploadId ID do upload
 * @param totalChunks Total de chunks
 * @returns Buffer do arquivo concatenado
 */
export async function concatenateChunks(uploadId: string, totalChunks: number): Promise<Buffer> {
  const tempDir = getTempUploadDir(uploadId);
  const chunks: Buffer[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(tempDir, `chunk-${i}`);
    const chunk = await fs.readFile(chunkPath);
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * Limpa diretório temporário de chunks
 * @param uploadId ID do upload
 */
export async function cleanupChunks(uploadId: string): Promise<void> {
  try {
    const tempDir = getTempUploadDir(uploadId);
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    // Silencia erros de limpeza
    console.warn(`Erro ao limpar chunks de ${uploadId}:`, error);
  }
}

/**
 * Deleta um arquivo do sistema
 * @param filepath Caminho relativo do arquivo
 * @returns true se deletado com sucesso ou arquivo não existe
 */
export async function deleteFile(filepath: string): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), filepath);
    await fs.unlink(fullPath);
    return true;
  } catch (error: any) {
    // Arquivo não existe é considerado sucesso
    if (error.code === 'ENOENT') {
      return true;
    }
    console.error('Erro ao deletar arquivo:', error);
    return false;
  }
}

/**
 * Verifica se um arquivo existe
 * @param filepath Caminho relativo do arquivo
 * @returns true se existe
 */
export async function fileExists(filepath: string): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), filepath);
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lê um arquivo como buffer
 * @param filepath Caminho relativo do arquivo
 * @returns Buffer do arquivo
 */
export async function readFile(filepath: string): Promise<Buffer> {
  const fullPath = path.join(process.cwd(), filepath);
  return fs.readFile(fullPath);
}

/**
 * Retorna estatísticas de arquivos de um projeto
 * @param projectId ID do projeto
 * @returns Estatísticas (total de arquivos e tamanho)
 */
export async function getProjectFileStats(
  projectId: string
): Promise<{ count: number; totalSize: number }> {
  const result = await prisma.projectFile.aggregate({
    where: { projectId },
    _count: true,
    _sum: { filesize: true },
  });

  return {
    count: result._count,
    totalSize: result._sum.filesize || 0,
  };
}
