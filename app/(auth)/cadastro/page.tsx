import type { Metadata } from 'next';
import CadastroForm from './CadastroForm';
import EventTracker from '@/components/analytics/EventTracker';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Criar Conta',
  description:
    'Crie sua conta gratuita na 28Web Connect e comece a transformar sua presença digital.',
  path: 'cadastro',
  robots: { index: false, follow: false },
});

export default function CadastroPage() {
  return (
    <>
      <EventTracker event="cadastro_iniciado" trigger="mount" />
      <CadastroForm />
    </>
  );
}
