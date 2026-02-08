'use client';

import { useTransition } from 'react';
import { X, AlertTriangle, AlertCircle, Info, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

/**
 * Modal de confirmação reutilizável para ações críticas
 */
export default function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
}: ConfirmActionModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm();
      onClose();
    });
  };

  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-500/20',
      buttonColor: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: AlertCircle,
      iconColor: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!isPending ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-dark-bg-secondary rounded-xl border border-neutral-gray/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-gray/10">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 flex items-center justify-center rounded-full',
                config.bgColor
              )}
            >
              <Icon className={cn('w-5 h-5', config.iconColor)} />
            </div>
            <h2 className="text-lg font-bold text-neutral-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-2 text-neutral-gray hover:text-neutral-white hover:bg-neutral-gray/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-neutral-light">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={onClose}
            disabled={isPending}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className={cn('flex-1', config.buttonColor)}
            onClick={handleConfirm}
            isLoading={isPending}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper para classes condicionais
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
