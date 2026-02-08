import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/types';
import { addProjectNote } from '@/app/actions/admin-projects';

/**
 * POST /api/admin/projects/[id]/notes
 * Adiciona uma nota/comentário ao projeto
 * Requer role ADMIN ou SUPER_ADMIN
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticação e autorização
    await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ success: false, error: 'Conteúdo inválido' }, { status: 400 });
    }

    const result = await addProjectNote(params.id, content);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error('Erro ao adicionar nota:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
