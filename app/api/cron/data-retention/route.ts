import { NextResponse } from 'next/server';
import { runDataRetention } from '@/lib/data-retention';

/**
 * API Route para execução do cron job de retenção de dados
 * Protegida por token de autorização
 *
 * Executar diariamente às 03:00 AM
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Verificar token de autorização
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('[Cron] Tentativa de acesso não autorizado ao data-retention');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Iniciando data-retention job...');
    const startTime = Date.now();

    const result = await runDataRetention();

    const duration = Date.now() - startTime;

    console.log(`[Cron] Data-retention job concluído em ${duration}ms`);

    return NextResponse.json({
      success: result.success,
      summary: result.summary,
      errors: result.errors,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Erro fatal no data-retention job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run data retention policies',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
