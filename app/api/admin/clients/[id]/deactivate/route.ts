import { NextRequest, NextResponse } from 'next/server';
import { deactivateClient } from '@/app/actions/admin-clients';

/**
 * POST /api/admin/clients/[id]/deactivate
 * Desativa um cliente (bloqueia login)
 * Requer autenticação de ADMIN ou SUPER_ADMIN (verificado no server action)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do cliente não fornecido' },
        { status: 400 }
      );
    }

    const result = await deactivateClient(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        {
          status:
            result.error === 'Não autorizado'
              ? 403
              : result.error?.includes('não encontrado')
                ? 404
                : 400,
        }
      );
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error('Erro na API de desativação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
