'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

/**
 * Componente de botão reutilizável com variantes e estados de loading
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = `
    rounded-lg
    font-medium
    transition-all
    duration-200
    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:hover:transform-none
    disabled:hover:shadow-none
    flex
    items-center
    justify-center
    gap-2
  `;

  const variantStyles = {
    primary: `
      bg-accent-primary
      hover:bg-accent-secondary
      text-white
      hover:-translate-y-0.5
      hover:shadow-lg
    `,
    secondary: `
      bg-dark-bg-secondary
      hover:bg-neutral-gray/10
      text-neutral-white
      border-2
      border-neutral-gray/20
      hover:border-neutral-gray/40
      hover:-translate-y-0.5
      hover:shadow-lg
    `,
    outline: `
      bg-transparent
      border-2
      border-accent-primary
      text-accent-primary
      hover:bg-accent-primary/10
      hover:-translate-y-0.5
      hover:shadow-lg
    `,
    ghost: `
      bg-transparent
      hover:bg-neutral-gray/10
      text-neutral-light
      hover:-translate-y-0.5
    `,
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {isLoading ? 'Carregando...' : children}
    </button>
  );
};

export default Button;
