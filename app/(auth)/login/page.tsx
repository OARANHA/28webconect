'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';
import { loginUser } from '@/app/actions/auth';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import Input from '@/components/ui/InputComponent';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await loginUser(data);
      if (result.success) {
        trackEvent(AnalyticsEvents.LOGIN_SUCESSO, { method: 'credentials' });
        toast.success('Login realizado com sucesso!');
        if (result.requiresVerification) {
          router.push('/verificar-email');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast.error(result.error || 'Email ou senha incorretos');
      }
    } catch (error) {
      toast.error('Erro de conexão. Tente novamente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-bg-primary via-dark-bg-secondary to-black">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Coluna Esquerda - Conteúdo Simplificado */}
          <div className="space-y-8 lg:col-span-1">
            <div className="flex justify-center mb-6">
              <Link href="/" className="block">
                <img 
                  src="/assets/28connect.jpg" 
                  alt="28Web Connect" 
                  width={180} 
                  height={60} 
                  className="rounded-lg"
                />
              </Link>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight text-center lg:text-left">
              Bem-vindo ao Futuro
            </h1>
            <p className="text-lg md:text-xl text-neutral-gray max-w-xl mb-8 text-center lg:text-left">
              Inovação e excelência em cada projeto que desenvolvemos juntos
            </p>
            <div className="inline-flex items-center gap-2 text-accent-primary justify-center lg:justify-start">
              Soluções digitais que transformam negócios
            </div>
          </div>

          {/* Coluna Direita - Formulário de Login */}
          <div className="lg:col-span-auto">
            <div className="w-full max-w-md bg-dark-bg-secondary rounded-2xl p-6 sm:p-8 border-2 border-dashed border-accent-primary/30">
              <h2 className="text-2xl font-bold text-neutral-white mb-6 text-center">
                Entre na sua conta
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-neutral-light block mb-1">Email</label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Senha */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-light block">Senha</label>
                    <Link
                      href="/recuperar-senha"
                      className="text-sm text-accent-primary hover:text-accent-secondary transition-colors"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <Input
                    type="password"
                    placeholder="Sua senha"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Botão de Submit */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </div>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center text-sm text-neutral-gray">
                Não tem uma conta?{' '}
                <Link
                  href="/cadastro"
                  className="text-accent-primary hover:text-accent-secondary transition-colors font-medium"
                >
                  Criar conta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
