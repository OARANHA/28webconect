import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readFile, fileExists } from '@/lib/file-upload';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    fileId: string;
  };
}

/**
 * Handler GET para download de arquivos
 */
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    // Verifica autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;
    const fileId = params.fileId;

    if (!fileId) {
      return NextResponse.json(
        { success: false, message: 'ID do arquivo não fornecido' },
        { status: 400 }
      );
    }

    // Busca arquivo no banco validando acesso
    const file = await prisma.projectFile.findFirst({
      where: {
        id: fileId,
        OR: [{ userId }, { project: { userId } }, { project: { briefing: { userId } } }],
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Arquivo não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se arquivo existe no sistema
    const exists = await fileExists(file.filepath);
    if (!exists) {
      return NextResponse.json(
        { success: false, message: 'Arquivo não encontrado no sistema' },
        { status: 404 }
      );
    }

    // Lê arquivo
    const fileBuffer = await readFile(file.filepath);

    // Define headers de resposta
    const headers = new Headers();
    headers.set('Content-Type', file.mimetype);
    headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.filename)}"`
    );
    headers.set('Content-Length', fileBuffer.length.toString());
    headers.set('Cache-Control', 'private, max-age=3600');

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Erro no download:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
