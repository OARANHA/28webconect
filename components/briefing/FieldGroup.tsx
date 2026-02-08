'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FieldGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

/**
 * Componente wrapper para agrupar campos relacionados em um formulário
 * Usa semântica HTML correta com fieldset e legend para acessibilidade
 * - Título em destaque
 * - Descrição opcional
 * - Indicador de obrigatório
 */
export default function FieldGroup({
  title,
  description,
  children,
  required = false,
  className = '',
}: FieldGroupProps) {
  return (
    <fieldset
      className={cn(
        'p-6 rounded-lg border-2 border-dashed border-neutral-gray/20',
        'bg-dark-bg-secondary/50',
        className
      )}
    >
      <legend className="px-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-neutral-white">{title}</h3>
          {required && <span className="text-accent-primary">*</span>}
        </div>
      </legend>

      {description && <p className="text-sm text-neutral-gray mb-4 -mt-2">{description}</p>}

      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}
