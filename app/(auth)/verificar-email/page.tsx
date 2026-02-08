import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import VerificarEmailForm from './VerificarEmailForm';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Verificar Email',
  description: 'Verifique seu email para ativar sua conta na 28Web Connect',
  path: 'verificar-email',
  robots: { index: false, follow: false },
});

export default async function VerificarEmailPage() {
  // Verificar se usuário está logado
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  // Verificar se email já está verificado
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { emailVerified: true, email: true },
  });

  if (user?.emailVerified) {
    redirect('/dashboard');
  }

  return <VerificarEmailForm userEmail={session.user.email} />;
}
