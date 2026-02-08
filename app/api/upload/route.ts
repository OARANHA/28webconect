import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  validateFile,
  saveFile,
  saveChunk,
  concatenateChunks,
  cleanupChunks,
} from '@/lib/file-upload';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Parseia formulário multipart nativamente
 */
async function parseMultipartForm(request: NextRequest): Promise<{
  fields: Record<string, string>;
  file?: {
    buffer: Buffer;
    filename: string;
    mimetype: string;
  };
}> {
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('multipart/form-data')) {
    throw new Error('Content-Type deve ser multipart/form-data');
  }

  // Extrai boundary
  const boundaryMatch = contentType.match(/boundary=([^;]+)/);
  if (!boundaryMatch) {
    throw new Error('Boundary não encontrado no Content-Type');
  }
  const boundary = boundaryMatch[1].trim();
  const boundaryBuffer = Buffer.from(`--${boundary}`);

  // Lê o body como buffer
  const arrayBuffer = await request.arrayBuffer();
  const body = Buffer.from(arrayBuffer);

  const fields: Record<string, string> = {};
  let file: { buffer: Buffer; filename: string; mimetype: string } | undefined;

  // Divide o body por boundaries
  let start = 0;
  while (true) {
    const boundaryIndex = body.indexOf(boundaryBuffer, start);
    if (boundaryIndex === -1) break;

    const nextBoundaryIndex = body.indexOf(boundaryBuffer, boundaryIndex + boundaryBuffer.length);
    if (nextBoundaryIndex === -1) break;

    // Extrai o conteúdo entre boundaries
    const partStart = boundaryIndex + boundaryBuffer.length + 2; // +2 para \r\n
    const partEnd = nextBoundaryIndex - 2; // -2 para \r\n antes do próximo boundary
    const part = body.slice(partStart, partEnd);

    // Parse headers do part
    const headerEndIndex = part.indexOf('\r\n\r\n');
    if (headerEndIndex === -1) continue;

    const headers = part.slice(0, headerEndIndex).toString();
    const content = part.slice(headerEndIndex + 4); // +4 para \r\n\r\n

    // Verifica se é um arquivo ou campo
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    const nameMatch = headers.match(/name="([^"]+)"/);
    const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);

    if (filenameMatch && nameMatch) {
      // É um arquivo
      const fieldName = nameMatch[1];
      const filename = filenameMatch[1];
      const mimetype = contentTypeMatch?.[1]?.trim() || 'application/octet-stream';

      if (fieldName === 'file' || fieldName === 'chunk') {
        file = {
          buffer: content,
          filename,
          mimetype,
        };
      }
    } else if (nameMatch) {
      // É um campo
      const fieldName = nameMatch[1];
      const value = content.toString().trim();
      fields[fieldName] = value;
    }

    start = nextBoundaryIndex;
  }

  return { fields, file };
}

/**
 * Handler POST para upload de arquivos
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verifica autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Parseia o formulário
    let parsed;
    try {
      parsed = await parseMultipartForm(request);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: `Erro ao parsear formulário: ${error.message}` },
        { status: 400 }
      );
    }

    const { fields, file } = parsed;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    const projectId = fields.projectId;
    if (!projectId) {
      return NextResponse.json(
        { success: false, message: 'ID do projeto não fornecido' },
        { status: 400 }
      );
    }

    // Verifica acesso ao projeto
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ userId }, { briefing: { userId } }],
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Projeto não encontrado ou sem permissão' },
        { status: 403 }
      );
    }

    // Verifica se é chunked upload
    const uploadId = fields.uploadId;
    const chunkIndex =
      fields.chunkIndex !== undefined ? parseInt(fields.chunkIndex, 10) : undefined;
    const totalChunks =
      fields.totalChunks !== undefined ? parseInt(fields.totalChunks, 10) : undefined;

    // Para uploads em chunks, usa o mimetype do campo (enviado pelo cliente) ou fallback para o do arquivo
    const effectiveMimetype = fields.mimetype || file.mimetype;

    if (uploadId && chunkIndex !== undefined && totalChunks && totalChunks > 1) {
      // Upload em chunks
      await saveChunk(file.buffer, uploadId, chunkIndex);

      // Se for o último chunk, processa o arquivo completo
      if (chunkIndex === totalChunks - 1) {
        const completeBuffer = await concatenateChunks(uploadId, totalChunks);

        // Valida arquivo usando o mimetype efetivo (do campo ou do arquivo)
        const validation = await validateFile(
          {
            filename: file.filename,
            mimetype: effectiveMimetype,
            filesize: completeBuffer.length,
          },
          userId
        );

        if (!validation.valid) {
          await cleanupChunks(uploadId);
          const status =
            validation.error?.includes('storage') || validation.error?.includes('espaço')
              ? 507
              : 413;
          return NextResponse.json({ success: false, message: validation.error }, { status });
        }

        // Salva arquivo final
        const savedFile = await saveFile(completeBuffer, projectId, file.filename);

        // Cria registro no banco usando o mimetype efetivo
        const projectFile = await prisma.projectFile.create({
          data: {
            projectId,
            userId,
            filename: file.filename,
            filepath: savedFile.filepath,
            filesize: savedFile.filesize,
            mimetype: effectiveMimetype,
          },
        });

        // Limpa chunks
        await cleanupChunks(uploadId);

        // Cria notificação
        await prisma.notification.create({
          data: {
            userId,
            type: 'ARQUIVO_SOLICITADO',
            title: 'Novo arquivo enviado',
            message: `Arquivo "${file.filename}" foi enviado para o projeto "${project.name}"`,
            channel: 'IN_APP',
            metadata: {
              projectId,
              fileId: projectFile.id,
              filename: file.filename,
            },
          },
        });

        return NextResponse.json({
          success: true,
          file: {
            id: projectFile.id,
            filename: projectFile.filename,
            filesize: projectFile.filesize,
            filepath: projectFile.filepath,
            mimetype: projectFile.mimetype,
            uploadedAt: projectFile.uploadedAt,
          },
        });
      }

      // Chunk salvo com sucesso, aguardando mais chunks
      return NextResponse.json({
        success: true,
        message: `Chunk ${chunkIndex + 1} de ${totalChunks} recebido`,
      });
    }

    // Upload normal (arquivo pequeno)
    const validation = await validateFile(
      {
        filename: file.filename,
        mimetype: file.mimetype,
        filesize: file.buffer.length,
      },
      userId
    );

    if (!validation.valid) {
      const status =
        validation.error?.includes('storage') || validation.error?.includes('espaço') ? 507 : 413;
      return NextResponse.json({ success: false, message: validation.error }, { status });
    }

    // Salva arquivo
    const savedFile = await saveFile(file.buffer, projectId, file.filename);

    // Cria registro no banco
    const projectFile = await prisma.projectFile.create({
      data: {
        projectId,
        userId,
        filename: file.filename,
        filepath: savedFile.filepath,
        filesize: savedFile.filesize,
        mimetype: file.mimetype,
      },
    });

    // Cria notificação
    await prisma.notification.create({
      data: {
        userId,
        type: 'ARQUIVO_SOLICITADO',
        title: 'Novo arquivo enviado',
        message: `Arquivo "${file.filename}" foi enviado para o projeto "${project.name}"`,
        channel: 'IN_APP',
        metadata: {
          projectId,
          fileId: projectFile.id,
          filename: file.filename,
        },
      },
    });

    return NextResponse.json({
      success: true,
      file: {
        id: projectFile.id,
        filename: projectFile.filename,
        filesize: projectFile.filesize,
        filepath: projectFile.filepath,
        mimetype: projectFile.mimetype,
        uploadedAt: projectFile.uploadedAt,
      },
    });
  } catch (error: any) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
