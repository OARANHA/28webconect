import { Metadata } from 'next';
import { requireEmailVerified } from '@/lib/auth-utils';
import BriefingForm from '@/components/briefing/BriefingForm';

interface BriefingPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = {
  title: 'Enviar Briefing | 28Web Connect',
  description: 'Conte-nos sobre seu projeto',
};

/**
 * Página de Briefing - Server Component
 * Exibe formulário multi-step para captura de requisitos do projeto
 * Protegida por autenticação e verificação de email
 * Suporta pré-seleção de serviceType via query param
 */
export default async function BriefingPage({ searchParams }: BriefingPageProps) {
  const session = await requireEmailVerified();

  // Capturar query param de serviço
  const params = await searchParams;
  const initialServiceType = typeof params.service === 'string' ? params.service : undefined;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-white">Enviar Briefing</h1>
        <p className="text-neutral-gray mt-2">
          Conte-nos sobre seu projeto e nossa equipe entrará em contato
        </p>
      </div>

      {/* Formulário */}
      <div className="bg-dark-bg-secondary rounded-xl p-6 md:p-8 border border-neutral-gray/10">
        <BriefingForm userId={session.user.id} initialServiceType={initialServiceType} />
      </div>
    </div>
  );
}
