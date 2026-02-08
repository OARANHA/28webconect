'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { X, Plus, Loader2 } from 'lucide-react';
import { PricingPlan, ServiceType } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePlan, createPlan } from '@/app/actions/pricing';
import {
  updatePlanSchema,
  createPlanSchema,
  UpdatePlanData,
  CreatePlanData,
} from '@/lib/validations/pricing';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/InputComponent';

interface PricingEditorProps {
  plan?: PricingPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated?: (plan: PricingPlan) => void;
  onPlanUpdated?: (plan: PricingPlan) => void;
}

// Valores iniciais para criação
const defaultValues = {
  name: '',
  serviceType: '' as ServiceType,
  price: 0,
  storageLimit: 10,
  features: [{ value: '' }],
};

/**
 * Componente Modal de Edição/Criação de Plano
 * Usa react-hook-form com validação Zod
 * Suporta criação (sem plan) e edição (com plan)
 */
export default function PricingEditor({
  plan,
  isOpen,
  onClose,
  onPlanCreated,
  onPlanUpdated,
}: PricingEditorProps) {
  const queryClient = useQueryClient();
  const isEditing = !!plan;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePlanData & { serviceType?: ServiceType; features: { value: string }[] }>({
    resolver: zodResolver(isEditing ? updatePlanSchema : createPlanSchema),
    defaultValues,
  });

  // Field array para features dinâmicas
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features',
  });

  // Preencher formulário ao editar
  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name,
        price: Number(plan.price),
        storageLimit: plan.storageLimit,
        features: Array.isArray(plan.features)
          ? (plan.features as string[]).map((f) => ({ value: f }))
          : [{ value: '' }],
      });
    } else {
      reset(defaultValues);
    }
  }, [plan, reset]);

  // Mutação para atualizar plano
  const updateMutation = useMutation({
    mutationFn: (data: UpdatePlanData) => updatePlan(plan!.id, data),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success('Plano atualizado com sucesso!');
        queryClient.invalidateQueries({ queryKey: ['pricingPlans'] });
        // Notificar componente pai sobre a atualização
        if (onPlanUpdated && plan) {
          const updatedPlan: PricingPlan = {
            ...plan,
            name: variables.name,
            price: variables.price,
            features: variables.features,
            storageLimit: variables.storageLimit,
            updatedAt: new Date(),
          };
          onPlanUpdated(updatedPlan);
        }
        onClose();
      } else {
        toast.error(result.error || 'Erro ao atualizar plano');
      }
    },
    onError: () => {
      toast.error('Erro de conexão. Tente novamente.');
    },
  });

  // Mutação para criar plano
  const createMutation = useMutation({
    mutationFn: (data: CreatePlanData) => createPlan(data),
    onSuccess: (result, variables) => {
      if (result.success && result.planId) {
        toast.success('Plano criado com sucesso!');
        queryClient.invalidateQueries({ queryKey: ['pricingPlans'] });
        // Notificar componente pai sobre o novo plano
        if (onPlanCreated) {
          const newPlan: PricingPlan = {
            id: result.planId,
            name: variables.name,
            serviceType: variables.serviceType as ServiceType,
            price: variables.price,
            features: variables.features,
            storageLimit: variables.storageLimit,
            isActive: true,
            order: 0, // Será atualizado pelo servidor
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          onPlanCreated(newPlan);
        }
        onClose();
      } else {
        toast.error(result.error || 'Erro ao criar plano');
      }
    },
    onError: () => {
      toast.error('Erro de conexão. Tente novamente.');
    },
  });

  const onSubmit = (
    data: UpdatePlanData & { serviceType?: ServiceType; features: { value: string }[] }
  ) => {
    const formattedData = {
      ...data,
      features: data.features.map((f) => f.value).filter((f) => f.trim() !== ''),
    };

    if (isEditing) {
      // Remover serviceType em atualizações
      const { serviceType: _, ...updateData } = formattedData;
      updateMutation.mutate(updateData as UpdatePlanData);
    } else {
      createMutation.mutate(formattedData as CreatePlanData);
    }
  };

  const handleAddFeature = () => {
    if (fields.length < 15) {
      append({ value: '' });
    } else {
      toast.error('Máximo de 15 features permitidas');
    }
  };

  const isPending = updateMutation.isPending || createMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-dark-bg-secondary rounded-xl border border-neutral-gray/20 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-neutral-gray/10 bg-dark-bg-secondary">
          <h2 className="text-xl font-bold text-neutral-white">
            {isEditing ? 'Editar Plano' : 'Criar Novo Plano'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-gray hover:text-neutral-white hover:bg-neutral-gray/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Nome do Plano */}
          <Input
            label="Nome do Plano"
            placeholder="Ex: ERP Cloud Básico"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          {/* Tipo de Serviço (apenas em criação) */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-neutral-light mb-2">
                Tipo de Serviço <span className="text-red-400">*</span>
              </label>
              <select
                {...register('serviceType')}
                className="w-full px-4 py-3 bg-dark-bg border border-neutral-gray/20 rounded-lg text-neutral-white focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
              >
                <option value="">Selecione um tipo</option>
                <option value={ServiceType.ERP_BASICO}>ERP Básico</option>
                <option value={ServiceType.ERP_ECOMMERCE}>ERP + E-commerce</option>
                <option value={ServiceType.ERP_PREMIUM}>ERP Premium</option>
                <option value={ServiceType.LANDING_IA}>Landing Page IA</option>
                <option value={ServiceType.LANDING_IA_WHATSAPP}>Landing IA + WhatsApp</option>
              </select>
              {errors.serviceType && (
                <p className="mt-1 text-sm text-red-400">{errors.serviceType.message}</p>
              )}
            </div>
          )}

          {/* Preço e Storage em grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Preço (R$)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="1500.00"
              error={errors.price?.message}
              required
              {...register('price', { valueAsNumber: true })}
            />

            <Input
              label="Limite de Storage (GB)"
              type="number"
              min="1"
              placeholder="10"
              error={errors.storageLimit?.message}
              required
              {...register('storageLimit', { valueAsNumber: true })}
            />
          </div>

          {/* Features Dinâmicas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-neutral-light">
                Features <span className="text-red-400">*</span>
                <span className="text-neutral-gray ml-1">({fields.length}/15)</span>
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddFeature}
                disabled={fields.length >= 15}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    placeholder={`Feature ${index + 1}`}
                    error={errors.features?.[index]?.value?.message}
                    className="flex-1"
                    {...register(`features.${index}.value` as const)}
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-3 text-neutral-gray hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.features && !Array.isArray(errors.features) && (
              <p className="mt-1 text-sm text-red-400">{errors.features.message}</p>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t border-neutral-gray/10">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isPending}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
