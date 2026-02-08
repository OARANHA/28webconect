'use client';

/**
 * Client Component da página de Base de Conhecimento
 * Gerencia estado e interatividade
 */

import { useState, useCallback } from 'react';
import { RefreshCw, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { reindexAll, scrapeWebsite } from '@/app/actions/admin-knowledge';
import KnowledgeStats from '@/components/admin/KnowledgeStats';
import DocumentUpload from '@/components/admin/DocumentUpload';
import DocumentList from '@/components/admin/DocumentList';
import type {
  KnowledgeStats as KnowledgeStatsType,
  DocumentListItem,
} from '@/types/admin-knowledge';

interface KnowledgeBaseClientProps {
  initialStats: KnowledgeStatsType;
  initialDocuments: DocumentListItem[];
}

export default function KnowledgeBaseClient({
  initialStats,
  initialDocuments,
}: KnowledgeBaseClientProps) {
  const [stats, setStats] = useState<KnowledgeStatsType>(initialStats);
  const [documents, setDocuments] = useState<DocumentListItem[]>(initialDocuments);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReindexingAll, setIsReindexingAll] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  // Atualiza dados
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { getKnowledgeStats, getDocuments } = await import('@/app/actions/admin-knowledge');
      const [statsResult, docsResult] = await Promise.all([getKnowledgeStats(), getDocuments()]);

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }
      if (docsResult.success && docsResult.documents) {
        setDocuments(docsResult.documents);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Reindexa todos os documentos
  const handleReindexAll = async () => {
    if (!confirm('Deseja reindexar todos os documentos? Isso pode demorar alguns minutos.')) {
      return;
    }

    setIsReindexingAll(true);
    const toastId = toast.loading('Reindexando documentos...');

    try {
      const result = await reindexAll();
      toast.dismiss(toastId);

      if (result.success) {
        toast.success(`${result.processed} documentos reindexados com sucesso!`);
        await refreshData();
      } else {
        toast.error(`${result.failed} documentos falharam na reindexação`);
        if (result.errors.length > 0) {
          console.error('Erros:', result.errors);
        }
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Erro ao reindexar documentos');
    } finally {
      setIsReindexingAll(false);
    }
  };

  // Faz scraping do site
  const handleScrape = async () => {
    if (!confirm('Deseja atualizar o índice com conteúdo do site?')) {
      return;
    }

    setIsScraping(true);
    const toastId = toast.loading('Atualizando conteúdo do site...');

    try {
      const result = await scrapeWebsite();
      toast.dismiss(toastId);

      if (result.success) {
        toast.success(`${result.pagesIndexed} páginas indexadas!`);
        await refreshData();
      } else {
        toast.error('Algumas páginas falharam ao serem indexadas');
        if (result.errors.length > 0) {
          console.error('Erros:', result.errors);
        }
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Erro ao fazer scraping do site');
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Estatísticas */}
      <section className="mb-8">
        <KnowledgeStats stats={stats} />
      </section>

      {/* Ações globais */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={handleReindexAll}
          disabled={isReindexingAll || isScraping || documents.length === 0}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            'bg-dark-bg-secondary border border-neutral-gray/20 text-neutral-white',
            'hover:border-accent-primary/50 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isReindexingAll ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Reindexar Todos
        </button>
        <button
          onClick={handleScrape}
          disabled={isReindexingAll || isScraping}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            'bg-dark-bg-secondary border border-neutral-gray/20 text-neutral-white',
            'hover:border-accent-primary/50 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isScraping ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Globe className="w-4 h-4" />
          )}
          Atualizar do Site
        </button>
        <button
          onClick={refreshData}
          disabled={isRefreshing || isReindexingAll || isScraping}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            'bg-dark-bg-secondary border border-neutral-gray/20 text-neutral-white',
            'hover:border-accent-primary/50 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
          Atualizar
        </button>
      </div>

      {/* Layout em grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload - ocupa 1 coluna */}
        <div className="lg:col-span-1">
          <div className="bg-dark-bg-secondary rounded-lg border border-neutral-gray/10 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-neutral-white mb-4">Upload de Documento</h2>
            <DocumentUpload
              onUploadComplete={refreshData}
              disabled={isReindexingAll || isScraping}
            />
          </div>
        </div>

        {/* Lista - ocupa 2 colunas */}
        <div className="lg:col-span-2">
          <div className="bg-dark-bg-secondary rounded-lg border border-neutral-gray/10 p-6">
            <h2 className="text-lg font-semibold text-neutral-white mb-4">Documentos Indexados</h2>
            <DocumentList documents={documents} onRefresh={refreshData} />
          </div>
        </div>
      </div>
    </div>
  );
}
