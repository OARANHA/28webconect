'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import AuthForm from '@/components/auth/AuthForm';
import Input from '@/components/ui/InputComponent';
import Button from '@/components/ui/Button';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validations/auth';
import { validateResetToken, resetPassword } from '@/app/actions/auth';

interface RedefinirSenhaFormProps {
  token: string;
}

export default function RedefinirSenhaForm({ token }: RedefinirSenhaFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isValidating, setIsValidating] = React.useState(true);
  const [isValid, setIsValid] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      token,
    },
  });

  const password = watch('password');

  // Validar token ao carregar
  useEffect(() => {
    const checkToken = async () => {
      const result = await validateResetToken(token);
      setIsValid(result.valid);
      setIsValidating(false);
      if (!result.valid) {
        toast.error(result.error || 'Token inválido ou expirado');
      }
    };
    checkToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const result = await resetPassword(token, data.password);
      if (result.success) {
        toast.success('Senha redefinida com sucesso!');
        router.push('/login');
      } else {
        toast.error(result.error || 'Erro ao redefinir senha');
      }
    } catch {
      toast.error('Erro de conexão. Tente novamente');
    } finally {
      setIsLoading(false);
    }
  };

  // Tela de validação
  if (isValidating) {
    return (
      <AuthForm title="Verificando link...">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
        </div>
      </AuthForm>
    );
  }

  // Token inválido
  if (!isValid) {
    return (
      <AuthForm
        title="Link expirado"
        subtitle="Este link de redefinição não é mais válido"
        footer={
          <Link
            href="/recuperar-senha"
            className="text-accent-primary hover:text-accent-secondary transition-colors"
          >
            Solicitar novo link
          </Link>
        }
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-neutral-gray">O link pode ter expirado ou já foi utilizado.</p>
        </div>
      </AuthForm>
    );
  }

  // Formulário de redefinição
  return (
    <AuthForm title="Redefinir Senha" subtitle="Crie uma nova senha para sua conta">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Nova senha"
          type="password"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirmar senha"
          type="password"
          placeholder="Digite a senha novamente"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {/* Indicador de força (simplificado) */}
        {password && password.length >= 8 && (
          <div className="flex items-center gap-2 text-sm text-green-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Senha válida
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
          Redefinir senha
        </Button>
      </form>
    </AuthForm>
  );
}
