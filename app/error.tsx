'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary global da aplicação
 * Fallback para erros não capturados em outros boundaries
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <div className="bg-dark-bg text-neutral-white min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-6xl font-bold text-accent-primary">Erro</h1>
        <h2 className="text-2xl font-semibold">Algo inesperado aconteceu</h2>
        <p className="text-neutral-gray">
          Desculpe pelo inconveniente. Nossa equipe foi notificada e está trabalhando para resolver
          o problema.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors"
          >
            Tentar Novamente
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-neutral-gray/20 rounded-lg hover:bg-dark-bg-secondary transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
