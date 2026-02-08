import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/types';
import { getBriefingById } from '@/app/actions/admin-briefings';
import BriefingDetailsClient from './BriefingDetailsClient';
import { FileText } from 'lucide-react';

interface BriefingDetailsPageProps {
  params: {
    id: string;
  };
}

/**
 * Gera metadata dinâmica para a página
 */
export async function generateMetadata({ params }: BriefingDetailsPageProps): Promise<Metadata> {
  const result = await getBriefingById(params.id);

  if (result.success && result.data) {
    return {
      title: `Briefing - ${result.data.companyName} | Admin`,
      description: `Detalhes do briefing de ${result.data.companyName}`,
    };
  }

  return {
    title: 'Briefing não encontrado | Admin',
    description: 'Briefing não encontrado',
  };
}

/**
 * Página de Detalhes do Briefing
 * Server Component protegido por role
 * Busca dados do briefing e passa para client component
 */
export default async function BriefingDetailsPage({ params }: BriefingDetailsPageProps) {
  // Proteção de rota - apenas admins podem acessar
  await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  // Buscar briefing
  const result = await getBriefingById(params.id);

  // Se não encontrar, retorna 404
  if (!result.success || !result.data) {
    notFound();
  }

  const briefing = result.data;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex items-center justify-center p-2 bg-accent-primary/10 rounded-lg">
            <FileText className="w-5 h-5 text-accent-primary" />
          </div>
          <span className="text-sm text-accent-primary font-medium">Área Administrativa</span>
        </div>
        <h1 className="text-3xl font-bold text-neutral-white mb-2">Detalhes do Briefing</h1>
        <p className="text-neutral-gray">
          Visualize informações completas e gerencie o status do briefing.
        </p>
      </div>

      {/* Client Component com dados do briefing */}
      <BriefingDetailsClient briefing={briefing} />
    </div>
  );
}
