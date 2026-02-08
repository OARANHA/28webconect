'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Input from '@/components/ui/InputComponent';
import Button from '@/components/ui/Button';
import { changePasswordSchema, ChangePasswordData } from '@/lib/validations/settings';
import { changePassword } from '@/app/actions/settings';
import { Loader2, Lock, Eye, EyeOff, Shield, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';

interface SecuritySettingsProps {
  userId: string;
}

// Schema estendido para o formulário (com confirmação)
const securityFormSchema = changePasswordSchema;

type SecurityFormData = z.infer<typeof securityFormSchema>;

export function SecuritySettings({ userId }: SecuritySettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<SecurityFormData>({
    resolver: zodResolver(securityFormSchema),
    mode: 'onChange',
  });

  const newPassword = watch('newPassword') || '';

  // Calcular força da senha
  const getPasswordStrength = (
    password: string
  ): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const strengths = [
      { label: 'Muito fraca', color: 'bg-red-500' },
      { label: 'Fraca', color: 'bg-orange-500' },
      { label: 'Média', color: 'bg-yellow-500' },
      { label: 'Boa', color: 'bg-blue-500' },
      { label: 'Forte', color: 'bg-green-500' },
    ];

    const index = Math.min(Math.floor((score / 5) * 4), 4);
    return { strength: score, label: strengths[index].label, color: strengths[index].color };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const onSubmit = async (data: SecurityFormData) => {
    setIsSubmitting(true);

    try {
      const result = await changePassword(userId, data);

      if (result.success) {
        toast.success(result.message || 'Senha alterada com sucesso!');
        reset();
      } else {
        toast.error(result.error || 'Erro ao alterar senha');
      }
    } catch (error) {
      toast.error('Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-white mb-2">Segurança da Conta</h2>
        <p className="text-neutral-gray text-sm">Gerencie sua senha e configurações de segurança</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Senha Atual */}
        <div className="space-y-2">
          <label
            htmlFor="currentPassword"
            className="text-sm font-medium text-neutral-white flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Senha Atual
          </label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              {...register('currentPassword')}
              placeholder="Digite sua senha atual"
              className={cn(
                'bg-dark-bg-primary border-neutral-gray/20 pr-10',
                errors.currentPassword && 'border-red-500 focus:border-red-500'
              )}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray hover:text-neutral-white transition-colors"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-red-500 text-xs">{errors.currentPassword.message}</p>
          )}
        </div>

        {/* Nova Senha */}
        <div className="space-y-2">
          <label
            htmlFor="newPassword"
            className="text-sm font-medium text-neutral-white flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Nova Senha
          </label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              {...register('newPassword')}
              placeholder="Digite sua nova senha"
              className={cn(
                'bg-dark-bg-primary border-neutral-gray/20 pr-10',
                errors.newPassword && 'border-red-500 focus:border-red-500'
              )}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray hover:text-neutral-white transition-colors"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-xs">{errors.newPassword.message}</p>
          )}

          {/* Indicador de Força */}
          {newPassword && (
            <div className="space-y-1">
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      'flex-1 rounded-full transition-colors',
                      passwordStrength.strength >= level
                        ? passwordStrength.color
                        : 'bg-neutral-gray/20'
                    )}
                  />
                ))}
              </div>
              <p className={cn('text-xs', passwordStrength.color.replace('bg-', 'text-'))}>
                Força: {passwordStrength.label}
              </p>
            </div>
          )}
        </div>

        {/* Confirmar Nova Senha */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-neutral-white flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Confirmar Nova Senha
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              placeholder="Confirme sua nova senha"
              className={cn(
                'bg-dark-bg-primary border-neutral-gray/20 pr-10',
                errors.confirmPassword && 'border-red-500 focus:border-red-500'
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray hover:text-neutral-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Botão Alterar Senha */}
        <div className="pt-4">
          <Button type="submit" disabled={!isValid || isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Alterando...
              </>
            ) : (
              'Alterar Senha'
            )}
          </Button>
        </div>
      </form>

      {/* Seção 2FA - Placeholder para implementação futura */}
      <div className="mt-8 pt-8 border-t border-neutral-gray/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-neutral-white">Autenticação de Dois Fatores</h3>
            <p className="text-neutral-gray text-sm mt-1">
              Adicione uma camada extra de segurança à sua conta
            </p>
          </div>
          <span className="px-3 py-1 bg-neutral-gray/20 text-neutral-gray text-xs rounded-full">
            Em breve
          </span>
        </div>
      </div>
    </div>
  );
}
