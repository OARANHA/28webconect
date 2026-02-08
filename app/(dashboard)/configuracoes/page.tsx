import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireEmailVerified } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { ConfiguracoesClient } from './ConfiguracoesClient';

export const metadata: Metadata = {
  title: 'Configurações | 28Web Connect',
  description: 'Gerencie suas informações pessoais, segurança e privacidade',
};

/**
 * Página de configurações - Server Component
 * Busca dados do usuário e renderiza o componente cliente com tabs
 */
export default async function ConfiguracoesPage() {
  const session = await requireEmailVerified();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Buscar dados completos do usuário
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      marketingConsent: true,
      role: true,
      image: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  return <ConfiguracoesClient user={user} />;
}
