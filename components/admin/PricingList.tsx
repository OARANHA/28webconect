'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { PricingPlan } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GripVertical, Plus } from 'lucide-react';
import { reorderPlans, togglePlanActive } from '@/app/actions/pricing';
import PricingCard from '@/components/pricing/PricingCard';
import PricingEditor from './PricingEditor';
import Button from '@/components/ui/Button';

interface PricingListProps {
  initialPlans: PricingPlan[];
}

interface SortableItemProps {
  plan: PricingPlan;
  onEdit: (plan: PricingPlan) => void;
  onToggleActive: (planId: string) => void;
}

/**
 * Componente de Item Arrastável
 * Usa useSortable do @dnd-kit
 */
function SortableItem({ plan, onEdit, onToggleActive }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: plan.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'opacity-50 z-50' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Handle de Drag */}
        <button
          {...attributes}
          {...listeners}
          className="mt-4 p-2 text-neutral-gray hover:text-neutral-white hover:bg-neutral-gray/10 rounded-lg cursor-grab active:cursor-grabbing transition-colors"
          title="Arrastar para reordenar"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Card do Plano */}
        <div className="flex-1">
          <PricingCard
            plan={plan}
            variant="admin"
            onEdit={onEdit}
            onToggleActive={onToggleActive}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Componente de Lista de Planos com Drag-and-Drop
 * Permite reordenar, editar e ativar/desativar planos
 */
export default function PricingList({ initialPlans }: PricingListProps) {
  const queryClient = useQueryClient();
  const [plans, setPlans] = useState<PricingPlan[]>(initialPlans);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Sensor de ponteiro para drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Mutação para reordenar planos
  const reorderMutation = useMutation({
    mutationFn: (planIds: string[]) => reorderPlans(planIds),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Ordem atualizada com sucesso!');
        queryClient.invalidateQueries({ queryKey: ['pricingPlans'] });
      } else {
        toast.error(result.error || 'Erro ao reordenar planos');
        // Reverter para ordem anterior em caso de erro
        setPlans(initialPlans);
      }
    },
    onError: () => {
      toast.error('Erro de conexão. Tente novamente.');
      setPlans(initialPlans);
    },
  });

  // Mutação para alternar status
  const toggleMutation = useMutation({
    mutationFn: (planId: string) => togglePlanActive(planId),
    onSuccess: (result, planId) => {
      if (result.success) {
        toast.success(result.message || 'Status atualizado!');
        // Atualizar estado local
        setPlans((prev) =>
          prev.map((p) => (p.id === planId ? { ...p, isActive: !p.isActive } : p))
        );
        queryClient.invalidateQueries({ queryKey: ['pricingPlans'] });
      } else {
        toast.error(result.error || 'Erro ao alterar status');
      }
    },
    onError: () => {
      toast.error('Erro de conexão. Tente novamente.');
    },
  });

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setPlans((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          const newItems = arrayMove(items, oldIndex, newIndex);

          // Enviar nova ordem para o servidor
          const planIds = newItems.map((p) => p.id);
          reorderMutation.mutate(planIds);

          return newItems;
        });
      }
    },
    [reorderMutation]
  );

  const handleEdit = useCallback((plan: PricingPlan) => {
    setEditingPlan(plan);
    setIsCreating(false);
    setIsEditorOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingPlan(null);
    setIsCreating(true);
    setIsEditorOpen(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setIsEditorOpen(false);
    setEditingPlan(null);
    setIsCreating(false);
  }, []);

  const handlePlanCreated = useCallback((newPlan: PricingPlan) => {
    setPlans((prev) => [...prev, newPlan]);
  }, []);

  const handlePlanUpdated = useCallback((updatedPlan: PricingPlan) => {
    setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
  }, []);

  const handleToggleActive = useCallback(
    (planId: string) => {
      toggleMutation.mutate(planId);
    },
    [toggleMutation]
  );

  // Estado Vazio
  if (plans.length === 0) {
    return (
      <div className="text-center py-16 bg-dark-bg-secondary rounded-xl border border-neutral-gray/10">
        <h3 className="text-xl font-semibold text-neutral-white mb-2">Nenhum plano cadastrado</h3>
        <p className="text-neutral-gray mb-6">Crie o primeiro plano para começar a vender.</p>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="w-5 h-5 mr-2" />
          Criar Novo Plano
        </Button>

        <PricingEditor
          plan={null}
          isOpen={isEditorOpen}
          onClose={handleCloseEditor}
          onPlanCreated={handlePlanCreated}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de criar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-gray">
            Arraste os cards para reordenar a exibição.{' '}
            <span className="text-accent-primary">
              ({plans.filter((p) => p.isActive).length} ativos,{' '}
              {plans.filter((p) => !p.isActive).length} inativos)
            </span>
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="w-5 h-5 mr-2" />
          Criar Novo Plano
        </Button>
      </div>

      {/* Lista com Drag-and-Drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={plans.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {plans.map((plan) => (
              <SortableItem
                key={plan.id}
                plan={plan}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Modal de Edição/Criação */}
      <PricingEditor
        plan={editingPlan}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        onPlanCreated={handlePlanCreated}
        onPlanUpdated={handlePlanUpdated}
      />
    </div>
  );
}
