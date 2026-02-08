'use client';

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
  const [isLoading, setIsLoading] = React.useState(false);

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
      <div className="w-full max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 lg:col-span-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Bem-vindo ao Futuro
            </h1>
            <p className="text-lg text-neutral-gray max-w-xl mb-8">
              Inovação e excelência em cada projeto que desenvolvemos juntos
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-dark-bg-secondary border border-accent-primary/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  Transforme sua experiência digital
                </h3>
                <p className="text-sm text-neutral-gray">
                  Conecte-se e descubra o poder de soluções inovadoras
                </p>
              </div>
              <div className="bg-dark-bg-secondary border border-accent-primary/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  Desenvolvimento sob medida
                </h3>
                <p className="text-sm text-neutral-gray">
                  Soluções personalizadas para o crescimento do seu negócio
                </p>
              </div>
              <div className="bg-dark-bg-secondary border border-accent-primary/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  Suporte especializado
                </h3>
                <p className="text-sm text-neutral-gray">
                  Equipe dedicada para garantir o seu sucesso
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 grid-cols-4 gap-6 pt-8 border-t border-neutral-gray/20">
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-primary">
                  500+
                </div>
                <div className="text-sm text-neutral-gray">
                  Clientes Satisfeitos
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-secondary">
                  150+
                </div>
                <div className="text-sm text-neutral-gray">
                  Projetos Entregues
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  10+
                </div>
                <div className="text-sm text-neutral-gray">
                  Anos de Experiência
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-primary">
                  24/7
                </div>
                <div className="text-sm text-neutral-gray">
                  Suporte Dedicado
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-auto">
            <div className="w-full max-w-md bg-dark-bg-secondary rounded-2xl p-6 border-2 border-accent-primary/30">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Entre na sua conta
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-light block mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-light block">
                    Senha
                  </label>
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
                    <p className="text-xs text-red-400 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

                <div className="pt-4">
                  <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </div>

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
