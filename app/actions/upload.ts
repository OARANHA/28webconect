'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import {
  validateFile,
  saveFile,
  deleteFile as deleteFileFromStorage,
  checkStorageLimit,
  generateUploadId,
  saveChunk,
  concatenateChunks,
  cleanupChunks,
} from '@/lib/file-upload';
import { ActionResponse } from '@/types';
import { ProjectFile } from '@prisma/client';
import { StorageInfo, UploadedFile } from '@/types/file-upload';

/**
 * Upload de arquivo para um projeto
 */
export async function uploadProjectFile(
  formData: FormData,
  projectId: string
): Promise<ActionResponse<ProjectFile>> {
  try {
    // Verifica autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Não autenticado' };
    }

    const userId = session.user.id;

    // Verifica acesso ao projeto
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ userId }, { briefing: { userId } }],
      },
    });

    if (!project) {
      return { success: false, error: 'Projeto não encontrado ou sem acesso' };
    }

    // Extrai arquivo do FormData
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'Arquivo não fornecido' };
    }

    // Converte File para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Valida arquivo
    const validation = await validateFile(
      {
        filename: file.name,
        mimetype: file.type,
        filesize: buffer.length,
      },
      userId
    );

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Arquivo inválido',
      };
    }

    // Salva arquivo no sistema de arquivos
    const savedFile = await saveFile(buffer, projectId, file.name);

    // Cria registro no banco
    const projectFile = await prisma.projectFile.create({
      data: {
        projectId,
        userId,
        filename: file.name,
        filepath: savedFile.filepath,
        filesize: savedFile.filesize,
        mimetype: file.type,
      },
    });

    // Cria notificação para admin
    await prisma.notification.create({
      data: {
        userId: userId, // Notifica o próprio usuário (ou pode ser um admin fixo)
        type: 'ARQUIVO_SOLICITADO',
        title: 'Novo arquivo enviado',
        message: `Arquivo "${file.name}" foi enviado para o projeto "${project.name}"`,
        channel: 'IN_APP',
        metadata: {
          projectId,
          fileId: projectFile.id,
          filename: file.name,
        },
      },
    });

    // Revalida página do projeto
    revalidatePath(`/projetos/${projectId}`);

    return { success: true, data: projectFile };
  } catch (error: any) {
    console.error('Erro no upload:', error);
    return {
      success: false,
      error: error.message || 'Erro ao processar upload',
    };
  }
}

/**
 * Processa upload em chunks
 */
export async function processChunkedUpload(
  formData: FormData
): Promise<ActionResponse<UploadedFile>> {
  try {
    // Verifica autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Não autenticado' };
    }

    const userId = session.user.id;
    const uploadId = formData.get('uploadId') as string;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string, 10);
    const totalChunks = parseInt(formData.get('totalChunks') as string, 10);
    const filename = formData.get('filename') as string;
    const projectId = formData.get('projectId') as string;
    const mimetype = formData.get('mimetype') as string; // MIME original enviado pelo cliente

    if (!uploadId || isNaN(chunkIndex) || isNaN(totalChunks) || !filename || !projectId) {
      return { success: false, error: 'Dados incompletos' };
    }

    // Verifica acesso ao projeto
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ userId }, { briefing: { userId } }],
      },
    });

    if (!project) {
      return { success: false, error: 'Projeto não encontrado' };
    }

    // Salva chunk
    const chunk = formData.get('chunk') as File;
    if (!chunk) {
      return { success: false, error: 'Chunk não fornecido' };
    }

    const bytes = await chunk.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await saveChunk(buffer, uploadId, chunkIndex);

    // Se for o último chunk, concatena e processa
    if (chunkIndex === totalChunks - 1) {
      const completeBuffer = await concatenateChunks(uploadId, totalChunks);

      // Usa o mimetype do campo (enviado pelo cliente) ou fallback para o do chunk
      const effectiveMimetype = mimetype || chunk.type || 'application/octet-stream';

      // Valida arquivo completo
      const validation = await validateFile(
        {
          filename,
          mimetype: effectiveMimetype,
          filesize: completeBuffer.length,
        },
        userId
      );

      if (!validation.valid) {
        await cleanupChunks(uploadId);
        return {
          success: false,
          error: validation.error || 'Arquivo inválido',
        };
      }

      // Salva arquivo final
      const savedFile = await saveFile(completeBuffer, projectId, filename);

      // Cria registro no banco usando o mimetype efetivo
      const projectFile = await prisma.projectFile.create({
        data: {
          projectId,
          userId,
          filename,
          filepath: savedFile.filepath,
          filesize: savedFile.filesize,
          mimetype: effectiveMimetype,
        },
      });

      // Limpa chunks temporários
      await cleanupChunks(uploadId);

      // Cria notificação
      await prisma.notification.create({
        data: {
          userId,
          type: 'ARQUIVO_SOLICITADO',
          title: 'Novo arquivo enviado',
          message: `Arquivo "${filename}" foi enviado para o projeto "${project.name}"`,
          channel: 'IN_APP',
          metadata: {
            projectId,
            fileId: projectFile.id,
            filename,
          },
        },
      });

      revalidatePath(`/projetos/${projectId}`);

      return {
        success: true,
        data: {
          id: projectFile.id,
          filename: projectFile.filename,
          filesize: projectFile.filesize,
          filepath: projectFile.filepath,
          mimetype: projectFile.mimetype,
          uploadedAt: projectFile.uploadedAt,
        },
      };
    }

    // Retorna sucesso parcial para chunks intermediários
    return {
      success: true,
      data: {
        id: uploadId,
        filename,
        filesize: 0,
        filepath: '',
        mimetype: mimetype || '',
        uploadedAt: new Date(),
      },
    };
  } catch (error: any) {
    console.error('Erro no upload chunked:', error);
    return {
      success: false,
      error: error.message || 'Erro ao processar upload',
    };
  }
}

/**
 * Deleta um arquivo do projeto
 */
export async function deleteProjectFile(
  fileId: string,
  userId: string
): Promise<ActionResponse<void>> {
  try {
    // Busca arquivo validando ownership
    const file = await prisma.projectFile.findFirst({
      where: {
        id: fileId,
        OR: [{ userId }, { project: { userId } }],
      },
    });

    if (!file) {
      return { success: false, error: 'Arquivo não encontrado' };
    }

    // Deleta arquivo físico
    await deleteFileFromStorage(file.filepath);

    // Deleta registro do banco
    await prisma.projectFile.delete({
      where: { id: fileId },
    });

    // Revalida página
    revalidatePath(`/projetos/${file.projectId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao deletar arquivo:', error);
    return {
      success: false,
      error: error.message || 'Erro ao deletar arquivo',
    };
  }
}

/**
 * Lista arquivos de um projeto
 */
export async function getProjectFiles(
  projectId: string,
  userId: string
): Promise<ActionResponse<ProjectFile[]>> {
  try {
    // Verifica acesso ao projeto
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ userId }, { briefing: { userId } }],
      },
    });

    if (!project) {
      return { success: false, error: 'Projeto não encontrado' };
    }

    const files = await prisma.projectFile.findMany({
      where: { projectId },
      orderBy: { uploadedAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return { success: true, data: files };
  } catch (error: any) {
    console.error('Erro ao buscar arquivos:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar arquivos',
    };
  }
}

/**
 * Retorna informações de storage do usuário
 */
export async function getUserStorageInfo(userId: string): Promise<ActionResponse<StorageInfo>> {
  try {
    const storageCheck = await checkStorageLimit(userId);

    if (!storageCheck.storageInfo) {
      return {
        success: false,
        error: storageCheck.error || 'Erro ao verificar storage',
      };
    }

    return {
      success: true,
      data: {
        used: storageCheck.storageInfo.used,
        limit: storageCheck.storageInfo.limit,
        available: storageCheck.storageInfo.available,
        percentage: storageCheck.percentage,
      },
    };
  } catch (error: any) {
    console.error('Erro ao buscar info de storage:', error);
    return {
      success: false,
      error: error.message || 'Erro ao verificar storage',
    };
  }
}
