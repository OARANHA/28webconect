'use client';

import React, { forwardRef, useEffect, useRef, useState } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  showCounter?: boolean;
  autoResize?: boolean;
}

/**
 * Componente de textarea reutilizável com suporte a:
 * - Label com indicador de obrigatório
 * - Contador de caracteres
 * - Mensagem de erro
 * - Auto-resize (altura cresce com conteúdo)
 * - Dark theme consistente com Input
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      maxLength,
      showCounter = false,
      autoResize = false,
      className = '',
      id,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${textareaId}-error` : undefined;
    const counterId = showCounter ? `${textareaId}-counter` : undefined;
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const [charCount, setCharCount] = useState(0);

    // Sincronizar refs
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(internalRef.current);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = internalRef.current;
      }
    }, [ref]);

    // Atualizar contador de caracteres
    useEffect(() => {
      if (showCounter && value !== undefined) {
        setCharCount(String(value).length);
      }
    }, [value, showCounter]);

    // Auto-resize
    useEffect(() => {
      if (autoResize && internalRef.current) {
        const textarea = internalRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value, autoResize]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCounter) {
        setCharCount(e.target.value.length);
      }
      onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label htmlFor={textareaId} className="block text-sm font-medium text-neutral-light">
              {label}
              {props.required && <span className="text-accent-primary ml-1">*</span>}
            </label>
            {showCounter && maxLength && (
              <span
                id={counterId}
                className={`text-xs ${
                  charCount > maxLength ? 'text-red-400' : 'text-neutral-gray'
                }`}
              >
                {charCount} / {maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={internalRef}
          id={textareaId}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorId || counterId}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          className={`
            w-full
            bg-dark-bg-secondary
            border-2
            ${error ? 'border-red-500' : 'border-neutral-gray/20'}
            ${error ? 'focus:border-red-500' : 'focus:border-accent-primary'}
            text-neutral-white
            placeholder:text-neutral-gray
            px-4
            py-3
            rounded-lg
            transition-colors
            duration-200
            outline-none
            focus:ring-2
            ${error ? 'focus:ring-red-500/20' : 'focus:ring-accent-primary/20'}
            disabled:opacity-50
            disabled:cursor-not-allowed
            resize-none
            min-h-[120px]
            ${className}
          `}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-xs text-red-400 mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
