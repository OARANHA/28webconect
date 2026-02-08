'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * Hook reutilizável para gerenciar estado de formulários de autenticação
 * @param action Server Action a ser executada
 * @param options Configurações adicionais
 * @returns Estado e handlers do formulário
 */
interface UseAuthFormOptions {
  onSuccess?: () => void;
  redirectTo?: string;
  successMessage?: string;
}

interface UseAuthFormReturn<T> {
  isLoading: boolean;
  handleSubmit: (data: T) => Promise<void>;
}

export function useAuthForm<T>(
  action: (data: T) => Promise<{ success: boolean; error?: string; message?: string }>,
  options: UseAuthFormOptions = {}
): UseAuthFormReturn<T> {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data: T) => {
      setIsLoading(true);

      try {
        const result = await action(data);

        if (result.success) {
          // Mostrar mensagem de sucesso
          if (options.successMessage || result.message) {
            toast.success(options.successMessage || result.message);
          }

          // Executar callback de sucesso
          if (options.onSuccess) {
            options.onSuccess();
          }

          // Redirecionar se especificado
          if (options.redirectTo) {
            router.push(options.redirectTo);
          }
        } else {
          // Mostrar erro
          toast.error(result.error || 'Erro ao processar solicitação');
        }
      } catch (error) {
        console.error('Erro no formulário:', error);
        toast.error('Erro de conexão. Tente novamente');
      } finally {
        setIsLoading(false);
      }
    },
    [action, options, router]
  );

  return {
    isLoading,
    handleSubmit,
  };
}

export default useAuthForm;
