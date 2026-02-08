'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Componente de input reutilizável com suporte a erros e dark theme
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type = 'text', className = '', id, ...props }, ref) => {
    const inputFieldId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const errorFieldId = error ? `${inputFieldId}-error` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputFieldId}
            className="block text-sm font-medium text-neutral-light mb-2"
          >
            {label}
            {props.required && <span className="text-accent-primary ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputFieldId}
          type={type}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorFieldId}
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
            ${className}
          `}
          {...props}
        />
        {error && (
          <p id={errorFieldId} className="text-xs text-red-400 mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
