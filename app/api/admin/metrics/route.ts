import { NextRequest, NextResponse } from 'next/server';
import { getMetrics } from '@/app/actions/admin-clients';

/**
 * GET /api/admin/metrics
 * Retorna métricas do dashboard administrativo
 * Requer autenticação de ADMIN ou SUPER_ADMIN (verificado no server action)
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const result = await getMetrics();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Não autorizado' ? 403 : 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Erro na API de métricas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
