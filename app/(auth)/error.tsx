'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary para páginas de autenticação
 * Contexto específico para erros de login/cadastro
 */
export default function AuthError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Auth Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-dark-bg-secondary rounded-xl p-8 border-2 border-dashed border-red-500/30 text-center">
        {/* Ícone de erro */}
        <div className="w-16 h-16 mx-auto mb-6 text-red-500">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-neutral-white mb-4">Erro na Autenticação</h2>

        <p className="text-neutral-gray mb-6">
          Ocorreu um erro ao processar sua solicitação de autenticação. Por favor, tente novamente.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" onClick={reset}>
            Tentar Novamente
          </Button>
          <Link href="/login">
            <Button variant="ghost">Voltar ao Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
