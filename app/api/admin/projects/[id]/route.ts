import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/types';
import { getProjectByIdAdmin, updateProjectStatus } from '@/app/actions/admin-projects';
import { ProjectStatus } from '@prisma/client';

/**
 * GET /api/admin/projects/[id]
 * Busca um projeto específico com todas as relações
 * Requer role ADMIN ou SUPER_ADMIN
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticação e autorização
    await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    const result = await getProjectByIdAdmin(params.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Projeto não encontrado' ? 404 : 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Erro na API de projeto:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/projects/[id]
 * Atualiza o status do projeto
 * Requer role ADMIN ou SUPER_ADMIN
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticação e autorização
    await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    const body = await request.json();
    const { status } = body;

    if (!status || !Object.values(ProjectStatus).includes(status)) {
      return NextResponse.json({ success: false, error: 'Status inválido' }, { status: 400 });
    }

    const result = await updateProjectStatus(params.id, status as ProjectStatus);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data, message: result.message });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
