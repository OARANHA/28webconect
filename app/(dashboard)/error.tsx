'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary para páginas do dashboard
 * Exibe mensagem amigável e opções de retry/navegação
 */
export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
    // Aqui poderia ser enviado para um serviço de analytics/logs
  }, [error]);

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-dark-bg-secondary rounded-xl p-8 border-2 border-dashed border-red-500/30 text-center">
        {/* Ícone de erro */}
        <div className="w-16 h-16 mx-auto mb-6 text-red-500">
          <AlertCircle className="w-full h-full" />
        </div>

        <h2 className="text-2xl font-bold text-neutral-white mb-4">Algo deu errado</h2>

        <p className="text-neutral-gray mb-6">
          Não foi possível carregar o dashboard. Isso pode ser temporário. Tente recarregar a
          página.
        </p>

        {error.digest && (
          <p className="text-xs text-neutral-gray/50 mb-6 font-mono">Error ID: {error.digest}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" onClick={reset}>
            Tentar novamente
          </Button>
          <Link href="/dashboard">
            <Button variant="ghost">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
