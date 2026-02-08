'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { X, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { approveBriefing } from '@/app/actions/admin-briefings';
import Button from '@/components/ui/Button';

interface ApproveBriefingModalProps {
  briefingId: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}

/**
 * Modal de confirmação para aprovação de briefing
 * Cria projeto automaticamente e notifica o cliente
 */
export default function ApproveBriefingModal({
  briefingId,
  companyName,
  isOpen,
  onClose,
  onSuccess,
}: ApproveBriefingModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      // O adminId é obtido automaticamente na server action via sessão
      const result = await approveBriefing(briefingId);
      return result;
    },
    onSuccess: (result) => {
      if (result.success && result.data?.projectId) {
        toast.success('Briefing aprovado! Projeto criado com sucesso.', {
          icon: <CheckCircle className="w-4 h-4 text-green-400" />,
        });

        // Invalidar cache
        queryClient.invalidateQueries({ queryKey: ['admin-briefings'] });
        queryClient.invalidateQueries({ queryKey: ['briefing', briefingId] });

        // Notificar componente pai
        onSuccess?.(result.data.projectId);

        // Fechar modal
        onClose();

        // Redirecionar para a página do projeto
        router.push(`/admin/projetos/${result.data.projectId}`);
      } else {
        toast.error(result.error || 'Erro ao aprovar briefing');
      }
    },
    onError: () => {
      toast.error('Erro de conexão. Tente novamente.');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay com backdrop blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!mutation.isPending ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-dark-bg-secondary rounded-xl border border-neutral-gray/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-gray/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-white">Aprovar Briefing</h2>
              <p className="text-sm text-neutral-gray">{companyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={mutation.isPending}
            className="p-2 text-neutral-gray hover:text-neutral-white hover:bg-neutral-gray/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-sm text-neutral-light">
              Tem certeza que deseja aprovar o briefing de{' '}
              <span className="font-medium text-green-400">{companyName}</span>?
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-accent-primary/10 mt-0.5">
                <span className="text-xs font-medium text-accent-primary">1</span>
              </div>
              <span className="text-neutral-light">Um projeto será criado automaticamente</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-accent-primary/10 mt-0.5">
                <span className="text-xs font-medium text-accent-primary">2</span>
              </div>
              <span className="text-neutral-light">4 milestones padrão serão adicionados</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-accent-primary/10 mt-0.5">
                <span className="text-xs font-medium text-accent-primary">3</span>
              </div>
              <span className="text-neutral-light">O cliente será notificado por email e push</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => mutation.mutate()}
            isLoading={mutation.isPending}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Aprovando...
              </>
            ) : (
              <>
                Aprovar e Criar Projeto
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
