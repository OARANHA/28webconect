import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/types';
import { getProjectStats } from '@/app/actions/admin-projects';

/**
 * GET /api/admin/projects/stats
 * Retorna estatísticas globais de projetos
 * Requer role ADMIN ou SUPER_ADMIN
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verificar autenticação e autorização
    await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    const result = await getProjectStats();

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Erro na API de estatísticas:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
