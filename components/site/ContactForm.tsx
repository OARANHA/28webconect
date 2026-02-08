'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Input from '@/components/ui/InputComponent';
import Button from '@/components/ui/Button';
import { sendContactForm } from '@/app/actions/contact';

const contactSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  subject: z.string().min(5, 'Assunto deve ter no mínimo 5 caracteres'),
  message: z
    .string()
    .min(10, 'Mensagem deve ter no mínimo 10 caracteres')
    .max(5000, 'Mensagem deve ter no máximo 5000 caracteres'),
});

type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Formulário de contato com validação e envio de email
 */
export default function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);

    try {
      // Create FormData from the object
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('subject', data.subject);
      formData.append('message', data.message);

      const result = await sendContactForm(formData);

      if (result.success) {
        toast.success('Mensagem enviada com sucesso! Responderemos em breve.');
        reset();
      } else {
        toast.error(result.error || 'Erro ao enviar mensagem. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      toast.error('Erro de conexão. Tente novamente ou entre em contato por email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nome"
          placeholder="Seu nome completo"
          error={errors.name?.message}
          required
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />
      </div>

      <Input
        label="Assunto"
        placeholder="Sobre o que deseja falar?"
        error={errors.subject?.message}
        required
        {...register('subject')}
      />

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-neutral-light mb-2">
          Mensagem <span className="text-accent-primary">*</span>
        </label>
        <textarea
          id="message"
          rows={6}
          placeholder="Descreva sua dúvida ou projeto em detalhes..."
          className={`
            w-full
            bg-dark-bg-secondary
            border-2
            ${errors.message ? 'border-red-500' : 'border-neutral-gray/20'}
            ${errors.message ? 'focus:border-red-500' : 'focus:border-accent-primary'}
            text-neutral-white
            placeholder:text-neutral-gray
            px-4
            py-3
            rounded-lg
            transition-colors
            duration-200
            outline-none
            focus:ring-2
            ${errors.message ? 'focus:ring-red-500/20' : 'focus:ring-accent-primary/20'}
            resize-none
          `}
          {...register('message')}
        />
        {errors.message && (
          <p className="text-xs text-red-400 mt-1" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
      </Button>

      <p className="text-sm text-neutral-gray text-center">
        Ao enviar, você concorda com nossa{' '}
        <a href="/politica-privacidade" className="text-accent-primary hover:underline">
          Política de Privacidade
        </a>
        .
      </p>
    </motion.form>
  );
}
