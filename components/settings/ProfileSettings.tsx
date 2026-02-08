'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User } from 'next-auth';
  import Input from '@/components/ui/InputComponent';
  import Button from '@/components/ui/Button';
import { updateProfileSchema, UpdateProfileData } from '@/lib/validations/settings';
import { updateProfile } from '@/app/actions/settings';
import { Loader2, User as UserIcon, Mail, Phone, Building, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Regex para máscara de telefone
const phoneMask = (value: string) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
  if (!match) return value;
  const [, ddd, first, second] = match;
  if (second) return `(${ddd}) ${first}-${second}`;
  if (first) return `(${ddd}) ${first}`;
  if (ddd) return `(${ddd}`;
  return '';
};

interface ProfileSettingsProps {
  initialData: User;
}

export function ProfileSettings({ initialData }: ProfileSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialData.name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      company: initialData.company || '',
    },
  });

  const watchedEmail = watch('email');
  const watchedPhone = watch('phone');

  // Verificar se email foi alterado
  if (watchedEmail !== initialData.email && !emailChanged) {
    setEmailChanged(true);
  } else if (watchedEmail === initialData.email && emailChanged) {
    setEmailChanged(false);
  }

  const onSubmit = async (data: UpdateProfileData) => {
    setIsSubmitting(true);

    try {
      const result = await updateProfile(initialData.id, data);

      if (result.success) {
        toast.success(result.message || 'Perfil atualizado com sucesso!');
        if (result.requiresVerification) {
          toast.info('Verifique seu novo email para completar a alteração.');
        }
      } else {
        toast.error(result.error || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      toast.error('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = phoneMask(e.target.value);
    setValue('phone', masked, { shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-white mb-2">Informações do Perfil</h2>
        <p className="text-neutral-gray text-sm">Atualize suas informações pessoais e de contato</p>
      </div>

      {emailChanged && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-500 font-medium text-sm">Atenção: Alteração de Email</p>
            <p className="text-neutral-gray text-sm mt-1">
              Ao alterar seu email, você receberá um link de verificação no novo endereço. Sua conta
              será temporariamente desativada até a verificação.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-neutral-white flex items-center gap-2"
          >
            <UserIcon className="w-4 h-4" />
            Nome Completo
          </label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Seu nome completo"
            className={cn(
              'bg-dark-bg-primary border-neutral-gray/20',
              errors.name && 'border-red-500 focus:border-red-500'
            )}
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-neutral-white flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Email
          </label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="seu@email.com"
            className={cn(
              'bg-dark-bg-primary border-neutral-gray/20',
              errors.email && 'border-red-500 focus:border-red-500',
              emailChanged && 'border-yellow-500/50'
            )}
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-neutral-white flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Telefone
          </label>
          <Input
            id="phone"
            {...register('phone')}
            value={phoneMask(watchedPhone || '')}
            onChange={handlePhoneChange}
            placeholder="(11) 98765-4321"
            className={cn(
              'bg-dark-bg-primary border-neutral-gray/20',
              errors.phone && 'border-red-500 focus:border-red-500'
            )}
          />
          {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
        </div>

        {/* Empresa */}
        <div className="space-y-2">
          <label
            htmlFor="company"
            className="text-sm font-medium text-neutral-white flex items-center gap-2"
          >
            <Building className="w-4 h-4" />
            Empresa
          </label>
          <Input
            id="company"
            {...register('company')}
            placeholder="Nome da sua empresa (opcional)"
            className={cn(
              'bg-dark-bg-primary border-neutral-gray/20',
              errors.company && 'border-red-500 focus:border-red-500'
            )}
          />
          {errors.company && <p className="text-red-500 text-xs">{errors.company.message}</p>}
        </div>

        {/* Botão Salvar */}
        <div className="pt-4">
          <Button type="submit" disabled={!isDirty || isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
