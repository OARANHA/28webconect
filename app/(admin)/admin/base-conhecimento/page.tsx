/**
 * Página Admin de Base de Conhecimento
 * Server Component protegido por role
 */

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { getKnowledgeStats, getDocuments } from '@/app/actions/admin-knowledge';
import { UserRole } from '@/types';
import KnowledgeBaseClient from './KnowledgeBaseClient';

export const metadata: Metadata = {
  title: 'Base de Conhecimento IA | Admin',
  description: 'Gerencie a base de conhecimento RAG do assistente de IA',
};

export const dynamic = 'force-dynamic';

export default async function KnowledgeBasePage() {
  // Verifica autenticação e role
  try {
    await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  } catch {
    redirect('/dashboard');
  }

  // Busca dados iniciais
  const [statsResult, docsResult] = await Promise.all([getKnowledgeStats(), getDocuments()]);

  const stats =
    statsResult.success && statsResult.stats
      ? statsResult.stats
      : {
          totalDocs: 0,
          totalSize: 0,
          lastUpdate: null,
          breakdown: { pdf: 0, docx: 0, txt: 0, md: 0, page: 0 },
          storagePercentage: 0,
        };

  const documents = docsResult.success && docsResult.documents ? docsResult.documents : [];

  return (
    <div className="min-h-screen bg-dark-bg-primary">
      {/* Header */}
      <div className="border-b border-neutral-gray/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-white">Base de Conhecimento IA</h1>
              <p className="text-sm text-neutral-gray mt-1">
                Gerencie documentos para o assistente de IA. Formatos suportados: PDF, DOCX, TXT,
                MD.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta informativo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-accent-primary/5 border border-accent-primary/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent-primary/10 rounded-full">
              <svg
                className="w-5 h-5 text-accent-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-white">
                Sobre a Indexação Automática
              </h3>
              <p className="text-sm text-neutral-gray mt-1">
                Documentos são automaticamente processados: o texto é extraído, embeddings são
                gerados via Mistral AI, e o conteúdo fica disponível para o assistente de IA
                responder perguntas. Limite: 1000 documentos ou 500MB total.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Client Component com dados */}
      <KnowledgeBaseClient initialStats={stats} initialDocuments={documents} />
    </div>
  );
}
