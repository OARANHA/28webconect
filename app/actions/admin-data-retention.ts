'use server';

import { runDataRetention } from '@/lib/data-retention';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@prisma/client';

/**
 * Executa políticas de retenção de dados manualmente (apenas SUPER_ADMIN)
 * Útil para testes e execuções emergenciais
 */
export async function runDataRetentionManual() {
  try {
    // Verificar permissão
    const session = await requireRole([UserRole.SUPER_ADMIN]);

    console.log(`[Admin] Execução manual de data retention iniciada por ${session.user.email}`);

    const result = await runDataRetention();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('[Admin] Erro ao executar data retention manual:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao executar políticas de retenção',
    };
  }
}
