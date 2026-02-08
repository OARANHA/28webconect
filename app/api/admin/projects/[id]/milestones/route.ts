import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/types';
import { toggleMilestone } from '@/app/actions/admin-projects';

/**
 * PATCH /api/admin/projects/[id]/milestones
 * Alterna o estado de conclusão de uma milestone
 * Requer role ADMIN ou SUPER_ADMIN
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticação e autorização
    await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    const body = await request.json();
    const { milestoneId, completed } = body;

    if (!milestoneId || typeof completed !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Dados inválidos' }, { status: 400 });
    }

    const result = await toggleMilestone(milestoneId, completed);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data, message: result.message });
  } catch (error) {
    console.error('Erro ao atualizar milestone:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
