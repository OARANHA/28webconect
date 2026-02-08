'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { toast } from 'sonner';
import AuthForm from '@/components/auth/AuthForm';
import Input from '@/components/ui/InputComponent';
import Button from '@/components/ui/Button';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations/auth';
import { sendPasswordReset } from '@/app/actions/auth';

export default function RecuperarSenhaForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const result = await sendPasswordReset(data);
      if (result.success) {
        toast.success('Email enviado! Verifique sua caixa de entrada');
        setIsSent(true);
      } else {
        toast.error(result.error || 'Erro ao enviar email');
      }
    } catch {
      toast.error('Erro de conexão. Tente novamente');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <AuthForm
        title="Email enviado!"
        subtitle="Verifique sua caixa de entrada"
        footer={
          <Link
            href="/login"
            className="text-accent-primary hover:text-accent-secondary transition-colors"
          >
            Voltar para Login
          </Link>
        }
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-accent-primary"
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
          <p className="text-neutral-gray">
            Se o email existir em nossa base, você receberá instruções em breve para redefinir sua
            senha.
          </p>
          <p className="text-sm text-neutral-gray">
            Não recebeu? Verifique sua pasta de spam ou{' '}
            <button
              onClick={() => setIsSent(false)}
              className="text-accent-primary hover:underline"
            >
              tentar novamente
            </button>
          </p>
        </div>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Recuperar Senha"
      subtitle="Digite seu email e enviaremos um link para redefinir sua senha"
      footer={
        <>
          Lembrou sua senha?{' '}
          <Link
            href="/login"
            className="text-accent-primary hover:text-accent-secondary transition-colors"
          >
            Voltar para Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
          Enviar link de recuperação
        </Button>
      </form>
    </AuthForm>
  );
}
