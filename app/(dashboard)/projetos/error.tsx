'use client';

import { useEffect } from 'react';
import EmptyState from '@/components/dashboard/EmptyState';
import { AlertTriangle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary para a página de projetos
 */
export default function ProjectsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Erro na página de projetos:', error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-white">Meus Projetos</h1>
        <p className="text-neutral-gray mt-1">
          Acompanhe o progresso e gerencie todos os seus projetos
        </p>
      </div>

      <EmptyState
        icon={<AlertTriangle className="w-full h-full" />}
        title="Erro ao carregar projetos"
        description="Ocorreu um erro ao carregar seus projetos. Tente novamente mais tarde."
        actionLabel="Tentar novamente"
        actionHref="#"
      />
    </div>
  );
}
