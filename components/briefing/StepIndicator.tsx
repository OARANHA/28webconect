'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
}

/**
 * Componente de indicador de progresso para formulários multi-step
 * Exibe círculos numerados conectados por linhas
 * - Step concluído: círculo preenchido com check
 * - Step atual: círculo com borda accent
 * - Step futuro: círculo com borda cinza
 */
export default function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Versão desktop com labels */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isFuture = stepNumber > currentStep;

            return (
              <div key={stepNumber} className="flex flex-col items-center flex-1">
                {/* Container do step */}
                <div className="flex items-center w-full">
                  {/* Linha da esquerda (exceto primeiro) */}
                  {index > 0 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 transition-all duration-300',
                        isCompleted || isCurrent ? 'bg-accent-primary' : 'bg-neutral-gray/30'
                      )}
                    />
                  )}

                  {/* Círculo do step */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full',
                      'border-2 transition-all duration-300 shrink-0',
                      isCompleted && 'bg-accent-primary border-accent-primary',
                      isCurrent && 'border-accent-primary bg-dark-bg-secondary',
                      isFuture && 'border-neutral-gray/30 bg-dark-bg-secondary'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          isCurrent && 'text-accent-primary',
                          isFuture && 'text-neutral-gray'
                        )}
                      >
                        {stepNumber}
                      </span>
                    )}
                  </div>

                  {/* Linha da direita (exceto último) */}
                  {index < totalSteps - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 transition-all duration-300',
                        isCompleted ? 'bg-accent-primary' : 'bg-neutral-gray/30'
                      )}
                    />
                  )}
                </div>

                {/* Label e descrição */}
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors duration-300',
                      isCompleted || isCurrent ? 'text-neutral-white' : 'text-neutral-gray'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-neutral-gray mt-1 max-w-[120px]">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Versão mobile - apenas números */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isFuture = stepNumber > currentStep;

            return (
              <React.Fragment key={stepNumber}>
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full',
                    'border-2 transition-all duration-300',
                    isCompleted && 'bg-accent-primary border-accent-primary',
                    isCurrent && 'border-accent-primary bg-dark-bg-secondary',
                    isFuture && 'border-neutral-gray/30 bg-dark-bg-secondary'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <span
                      className={cn(
                        'text-xs font-semibold',
                        isCurrent && 'text-accent-primary',
                        isFuture && 'text-neutral-gray'
                      )}
                    >
                      {stepNumber}
                    </span>
                  )}
                </div>
                {index < totalSteps - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-2 transition-all duration-300',
                      isCompleted ? 'bg-accent-primary' : 'bg-neutral-gray/30'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Label do step atual no mobile */}
        <div className="text-center mt-3">
          <p className="text-sm font-medium text-neutral-white">
            Passo {currentStep} de {totalSteps}: {steps[currentStep - 1]?.label}
          </p>
          {steps[currentStep - 1]?.description && (
            <p className="text-xs text-neutral-gray mt-1">{steps[currentStep - 1].description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
