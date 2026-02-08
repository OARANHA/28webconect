import { NextRequest, NextResponse } from 'next/server';
import { exportClientsCSV } from '@/app/actions/admin-clients';
import { AdminClientFilters } from '@/types/admin-client';

/**
 * GET /api/admin/clients/export
 * Retorna dados de clientes para exportação CSV
 * Requer autenticação de ADMIN ou SUPER_ADMIN (verificado no server action)
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extrair filtros da query string
    const filters: AdminClientFilters = {};

    const status = searchParams.get('status');
    if (status && (status === 'active' || status === 'inactive')) {
      filters.status = status;
    }

    const searchTerm = searchParams.get('searchTerm');
    if (searchTerm) {
      filters.searchTerm = searchTerm;
    }

    const dateFrom = searchParams.get('dateFrom');
    if (dateFrom) {
      filters.dateFrom = new Date(dateFrom);
    }

    const dateTo = searchParams.get('dateTo');
    if (dateTo) {
      filters.dateTo = new Date(dateTo);
    }

    const result = await exportClientsCSV(Object.keys(filters).length > 0 ? filters : undefined);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Não autorizado' ? 403 : 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Erro na API de exportação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
