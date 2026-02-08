'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import AuthForm from '@/components/auth/AuthForm';
import Button from '@/components/ui/Button';
import { sendVerificationEmail } from '@/app/actions/auth';

interface VerificarEmailFormProps {
  userEmail: string;
}

export default function VerificarEmailForm({ userEmail }: VerificarEmailFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;

    setIsLoading(true);
    try {
      const result = await sendVerificationEmail(userEmail);
      if (result.success) {
        toast.success(result.message || 'Email enviado!');
        setCooldown(60); // 1 minuto de cooldown
      } else {
        toast.error(result.error || 'Erro ao enviar email');
      }
    } catch {
      toast.error('Erro de conexão. Tente novamente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Verifique seu Email"
      footer={
        <Link
          href="/login"
          className="text-accent-primary hover:text-accent-secondary transition-colors"
        >
          Voltar para Login
        </Link>
      }
    >
      <div className="text-center space-y-6">
        {/* Ícone de email */}
        <div className="w-20 h-20 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-10 h-10 text-accent-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Texto principal */}
        <div className="space-y-2">
          <p className="text-neutral-gray">Enviamos um link de verificação para:</p>
          <p className="text-neutral-white font-medium text-lg break-all">{userEmail}</p>
        </div>

        {/* Instruções */}
        <div className="bg-dark-bg rounded-lg p-4 border border-neutral-gray/10">
          <p className="text-sm text-neutral-gray">
            Clique no link recebido para ativar sua conta e acessar o dashboard. Não esqueça de
            verificar sua pasta de spam.
          </p>
        </div>

        {/* Botão de reenvio */}
        <div className="space-y-3">
          <p className="text-sm text-neutral-gray">Não recebeu o email?</p>
          <Button
            variant="secondary"
            size="md"
            isLoading={isLoading}
            disabled={cooldown > 0}
            onClick={handleResend}
            className="w-full"
          >
            {cooldown > 0 ? `Reenviar em ${cooldown}s...` : 'Reenviar Email'}
          </Button>
        </div>

        {/* Ajuda */}
        <p className="text-xs text-neutral-gray">
          Problemas para receber o email?{' '}
          <Link href="/contato" className="text-accent-primary hover:underline">
            Entre em contato
          </Link>
        </p>
      </div>
    </AuthForm>
  );
}
