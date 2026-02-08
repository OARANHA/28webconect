'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import AuthForm from '@/components/auth/AuthForm';
import Input from '@/components/ui/InputComponent';
import Button from '@/components/ui/Button';
import { registerSchema, RegisterFormData } from '@/lib/validations/auth';
import { registerUser } from '@/app/actions/auth';
import { formatPhoneNumber } from '@/lib/utils';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

export default function CadastroForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      marketingConsent: false,
      company: '',
      phone: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const result = await registerUser(data);
      if (result.success) {
        // Rastrear cadastro completado
        trackEvent(AnalyticsEvents.CADASTRO_COMPLETADO);
        toast.success(result.message || 'Conta criada! Verifique seu email');
        router.push('/verificar-email');
      } else {
        toast.error(result.error || 'Erro ao criar conta');
      }
    } catch {
      toast.error('Erro de conexão. Tente novamente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Criar Conta"
      subtitle="Comece sua jornada na 28Web Connect"
      footer={
        <>
          Já tem uma conta?{' '}
          <Link
            href="/login"
            className="text-accent-primary hover:text-accent-secondary transition-colors"
          >
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Nome completo"
          placeholder="Seu nome completo"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Senha"
          type="password"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />
        <p className="text-xs text-neutral-gray -mt-3">A senha deve ter no mínimo 8 caracteres</p>

        <Input
          label="Empresa"
          placeholder="Nome da sua empresa (opcional)"
          error={errors.company?.message}
          {...register('company')}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field: { onChange, value, onBlur, ref } }) => (
            <Input
              label="Telefone"
              placeholder="(XX) XXXXX-XXXX"
              error={errors.phone?.message}
              value={value || ''}
              onChange={(e) => onChange(formatPhoneNumber(e.target.value))}
              onBlur={onBlur}
              ref={ref}
            />
          )}
        />

        {/* LGPD Checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="marketingConsent"
            className="mt-1 h-4 w-4 rounded border-neutral-gray/30 bg-dark-bg-secondary text-accent-primary focus:ring-accent-primary"
            {...register('marketingConsent')}
          />
          <label htmlFor="marketingConsent" className="text-sm text-neutral-gray leading-relaxed">
            Aceito receber comunicações de marketing sobre novidades, promoções e conteúdos
            relevantes da 28Web Connect.
          </label>
        </div>

        {/* Termos */}
        <p className="text-xs text-neutral-gray text-center">
          Ao criar conta, você concorda com nossos{' '}
          <Link href="/termos-uso" className="text-accent-primary hover:underline">
            Termos de Uso
          </Link>{' '}
          e{' '}
          <Link href="/politica-privacidade" className="text-accent-primary hover:underline">
            Política de Privacidade
          </Link>
        </p>

        <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
          Criar Conta
        </Button>
      </form>
    </AuthForm>
  );
}
