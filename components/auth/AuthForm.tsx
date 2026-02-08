'use client';

import React from 'react';
import Image from 'next/image';

interface AuthFormProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Componente wrapper para formulários de autenticação com layout consistente
 */
const AuthForm: React.FC<AuthFormProps> = ({ title, subtitle, children, footer }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-dark-bg">
      <div
        className="
          max-w-md
          w-full
          bg-dark-bg-secondary
          rounded-2xl
          p-6
          sm:p-8
          border-2
          border-dashed
          border-accent-primary/30
        "
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/assets/28connect.jpg"
            alt="28Web Connect"
            width={120}
            height={40}
            priority
            className="rounded-lg"
          />
        </div>

        {/* Title */}
        <h1
          className="
            text-2xl
            sm:text-3xl
            font-bold
            text-neutral-white
            mb-2
            text-center
          "
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            className="
              text-neutral-gray
              mb-8
              text-center
              text-sm
              sm:text-base
            "
          >
            {subtitle}
          </p>
        )}

        {/* Form wrapper */}
        <div className="space-y-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div
            className="
              mt-6
              text-center
              text-sm
              text-neutral-gray
            "
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
