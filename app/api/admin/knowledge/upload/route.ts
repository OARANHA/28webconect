/**
 * API Route para upload de documentos da base de conhecimento
 * POST /api/admin/knowledge/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateEmbedding, storeDocument } from '@/lib/embeddings';
import { extractTextFromFile } from '@/lib/text-extraction';
import {
  validateLimits,
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from '@/lib/validations/admin-knowledge';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { UserRole } from '@/types';

// Diretório de upload
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
 * Parse multipart form data manualmente
 * (compatível com Edge Runtime)
 */
async function parseFormData(request: NextRequest): Promise<{
  file?: { name: string; type: string; buffer: Buffer; size: number };
  fields: Record<string, string>;
}> {
  const contentType = request.headers.get('content-type') || '';

  if (!contentType.includes('multipart/form-data')) {
    throw new Error('Content-Type deve ser multipart/form-data');
  }

  // Obtém o boundary do content-type
  const boundary = contentType.split('boundary=')[1];
  if (!boundary) {
    throw new Error('Boundary não encontrado no Content-Type');
  }

  const arrayBuffer = await request.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const parts = buffer.toString('binary').split(`--${boundary}`);
  const result: {
    file?: { name: string; type: string; buffer: Buffer; size: number };
    fields: Record<string, string>;
  } = { fields: {} };

  for (const part of parts) {
    if (part.includes('Content-Disposition')) {
      const nameMatch = part.match(/name="([^"]+)"/);
      const filenameMatch = part.match(/filename="([^"]+)"/);

      if (nameMatch) {
        const name = nameMatch[1];
        const contentStart = part.indexOf('\r\n\r\n') + 4;
        const contentEnd = part.lastIndexOf('\r\n');

        if (filenameMatch && contentStart > 0 && contentEnd > contentStart) {
          // É um arquivo
          const filename = filenameMatch[1];
          const typeMatch = part.match(/Content-Type:\s*([^\r\n]+)/);
          const fileContent = part.slice(contentStart, contentEnd);

          result.file = {
            name: filename,
            type: typeMatch ? typeMatch[1].trim() : 'application/octet-stream',
            buffer: Buffer.from(fileContent, 'binary'),
            size: fileContent.length,
          };
        } else if (contentStart > 0 && contentEnd > contentStart) {
          // É um campo
          const value = part.slice(contentStart, contentEnd);
          result.fields[name] = value;
        }
      }
    }
  }

  return result;
}

/**
 * POST /api/admin/knowledge/upload
 * Faz upload e indexa um documento
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verifica autenticação
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    }

    // Verifica permissão (ADMIN ou SUPER_ADMIN)
    const userRole = session.user.role as UserRole;
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ success: false, error: 'Permissão negada' }, { status: 403 });
    }

    // Parse do form data
    let parsed;
    try {
      parsed = await parseFormData(request);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Erro ao parsear dados do formulário' },
        { status: 400 }
      );
    }

    const { file, fields } = parsed;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      );
    }

    // Validações
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type as (typeof ALLOWED_DOCUMENT_TYPES)[number])) {
      return NextResponse.json(
        { success: false, error: 'Tipo de arquivo não suportado. Use PDF, DOC, DOCX, TXT ou MD' },
        { status: 400 }
      );
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Arquivo excede o limite de 10MB' },
        { status: 400 }
      );
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
      return NextResponse.json({ success: false, error: limitCheck.error }, { status: 400 });
    }

    // Extrai texto
    let extractedText: string;
    try {
      extractedText = await extractTextFromFile(file.buffer, file.type);
    } catch (error) {
      console.error('Erro na extração de texto:', error);
      return NextResponse.json(
        { success: false, error: 'Falha ao extrair texto do arquivo' },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Arquivo não contém texto extraível' },
        { status: 400 }
      );
    }

    // Gera embedding
    let embedding: number[];
    try {
      embedding = await generateEmbedding(extractedText);
    } catch (error) {
      console.error('Erro ao gerar embedding:', error);
      return NextResponse.json(
        { success: false, error: 'Falha ao gerar embedding do documento' },
        { status: 500 }
      );
    }

    // Salva arquivo no disco
    const uploadDir = await ensureUploadDir();
    const timestamp = Date.now();
    const safeFilename = file.name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
    const filename = `${timestamp}_${safeFilename}`;
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, file.buffer);

    // Prepara metadados
    const title = fields.title || file.name.replace(/\.[^/.]+$/, '');
    const category = fields.category || 'geral';
    const tags = fields.tags ? JSON.parse(fields.tags) : [];

    const metadata = {
      title,
      filename: file.name,
      type: 'upload' as const,
      category,
      source: 'upload' as const,
      tags,
      filesize: file.size,
      mimetype: file.type,
      filepath: filename,
      uploadedBy: session.user.id,
      uploadedAt: new Date().toISOString(),
    };

    // Cria documento no banco
    const document = await storeDocument(extractedText, embedding, metadata);

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: metadata.title,
        filename: metadata.filename,
        type: metadata.type,
        size: metadata.filesize,
        mimetype: metadata.mimetype,
        createdAt: document.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar upload' },
      { status: 500 }
    );
  }
}

/**
 * Configuração do route handler
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
