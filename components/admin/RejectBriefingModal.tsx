'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X, Loader2, XCircle, AlertTriangle } from 'lucide-react';
import { rejectBriefing } from '@/app/actions/admin-briefings';
import { rejectBriefingSchema, RejectBriefingData } from '@/lib/validations/admin-briefing';
import Button from '@/components/ui/Button';

interface RejectBriefingModalProps {
  briefingId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Modal para rejeitar briefing com motivo obrigatório
 * Envia notificação ao cliente
 */
export default function RejectBriefingModal({
  briefingId,
  isOpen,
  onClose,
  onSuccess,
}: RejectBriefingModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RejectBriefingData>({
    resolver: zodResolver(rejectBriefingSchema),
    defaultValues: {
      reason: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: RejectBriefingData) => {
      // O adminId é obtido automaticamente na server action via sessão
      const result = await rejectBriefing(briefingId, data.reason);
      return result;
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Briefing rejeitado. Cliente foi notificado.', {
          icon: <XCircle className="w-4 h-4 text-red-400" />,
        });

        // Invalidar cache
        queryClient.invalidateQueries({ queryKey: ['admin-briefings'] });
        queryClient.invalidateQueries({ queryKey: ['briefing', briefingId] });

        // Limpar formulário
        reset();

        // Notificar componente pai
        onSuccess?.();

        // Fechar modal
        onClose();
      } else {
        toast.error(result.error || 'Erro ao rejeitar briefing');
      }
    },
    onError: () => {
      toast.error('Erro de conexão. Tente novamente.');
    },
  });

  const onSubmit = (data: RejectBriefingData) => {
    mutation.mutate(data);
  };

  // Reset formulário ao fechar
  const handleClose = () => {
    if (!mutation.isPending) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay com backdrop blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!mutation.isPending ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-dark-bg-secondary rounded-xl border border-neutral-gray/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-gray/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/20">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-white">Rejeitar Briefing</h2>
              <p className="text-sm text-neutral-gray">Informe o motivo da rejeição</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={mutation.isPending}
            className="p-2 text-neutral-gray hover:text-neutral-white hover:bg-neutral-gray/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Alerta */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div className="text-sm text-neutral-light">
              <p className="font-medium text-yellow-400 mb-1">Atenção</p>
              <p>
                O cliente será notificado sobre a rejeição. Descreva claramente o motivo para que
                ele possa entender e, se necessário, enviar um novo briefing.
              </p>
            </div>
          </div>

          {/* Campo de motivo */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-neutral-light mb-2">
              Motivo da Rejeição <span className="text-red-400">*</span>
            </label>
            <textarea
              id="reason"
              rows={4}
              placeholder="Explique o motivo da rejeição em pelo menos 10 caracteres..."
              disabled={mutation.isPending}
              className={`
                w-full px-4 py-3 bg-dark-bg border rounded-lg
                text-neutral-white placeholder-neutral-gray
                focus:outline-none focus:ring-1 focus:ring-accent-primary focus:border-accent-primary
                transition-colors resize-none
                ${errors.reason ? 'border-red-500' : 'border-neutral-gray/20'}
              `}
              {...register('reason')}
            />
            {errors.reason ? (
              <p className="mt-2 text-sm text-red-400">{errors.reason.message}</p>
            ) : (
              <p className="mt-2 text-xs text-neutral-gray">Mínimo 10 caracteres, máximo 500.</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="secondary"
              className="flex-1 bg-red-600 hover:bg-red-700 border-red-600"
              isLoading={mutation.isPending}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejeitando...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar Briefing
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
