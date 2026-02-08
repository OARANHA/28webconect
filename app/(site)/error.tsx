'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary para páginas do site
 * Exibe mensagem amigável e opção de retry
 */
export default function SiteError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error('Site Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-dark-bg-secondary rounded-xl p-8 border-2 border-dashed border-red-500/30 text-center">
        {/* Ícone de erro SVG inline */}
        <div className="w-16 h-16 mx-auto mb-6 text-red-500">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-neutral-white mb-4">Algo deu errado</h2>

        <p className="text-neutral-gray mb-6">
          Ocorreu um erro ao carregar esta página. Tente novamente ou volte para a página inicial.
        </p>

        {error.digest && (
          <p className="text-xs text-neutral-gray/50 mb-6 font-mono">Error ID: {error.digest}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" onClick={reset}>
            Tentar Novamente
          </Button>
          <Link href="/">
            <Button variant="ghost">Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
