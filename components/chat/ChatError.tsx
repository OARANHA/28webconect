'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

interface ChatErrorProps {
  error: string | null;
  onRetry?: () => void;
}

/**
 * Componente para exibir erros do chat
 */
export function ChatError({ error, onRetry }: ChatErrorProps) {
  if (!error) return null;

  return (
    <div className="m-4 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-red-400">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
