import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/types';
import { getAllProjects } from '@/app/actions/admin-projects';

/**
 * GET /api/admin/projects
 * Busca todos os projetos com filtros opcionais
 * Requer role ADMIN ou SUPER_ADMIN
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e autorização
    await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    // Extrair query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const serviceType = searchParams.get('serviceType') || undefined;
    const searchTerm = searchParams.get('searchTerm') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    // Construir filtros
    const filters: Parameters<typeof getAllProjects>[0] = {};
    if (status) filters.status = status as any;
    if (serviceType) filters.serviceType = serviceType as any;
    if (searchTerm) filters.searchTerm = searchTerm;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    // Chamar server action
    const result = await getAllProjects(Object.keys(filters).length > 0 ? filters : undefined);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Erro na API de projetos:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
