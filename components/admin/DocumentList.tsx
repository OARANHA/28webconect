'use client';

/**
 * Componente de lista de documentos da base de conhecimento
 */

import { useState, useMemo } from 'react';
import {
  FileText,
  File,
  Search,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/validations/admin-knowledge';
import { deleteDocument, reindexDocument } from '@/app/actions/admin-knowledge';
import type { DocumentListItem, DocumentFilters } from '@/types/admin-knowledge';

interface DocumentListProps {
  documents: DocumentListItem[];
  onRefresh?: () => void;
}

const ITEMS_PER_PAGE = 10;

export default function DocumentList({ documents, onRefresh }: DocumentListProps) {
  const [filters, setFilters] = useState<DocumentFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reindexingId, setReindexingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Filtra documentos
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          doc.title.toLowerCase().includes(searchLower) ||
          doc.filename.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.type && doc.mimetype !== filters.type) {
        return false;
      }

      return true;
    });
  }, [documents, filters]);

  // Paginação
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDocuments.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDocuments, currentPage]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await deleteDocument(id);
      if (result.success) {
        toast.success('Documento excluído com sucesso');
        onRefresh?.();
      } else {
        toast.error(result.error || 'Erro ao excluir documento');
      }
    } catch (error) {
      toast.error('Erro ao excluir documento');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const handleReindex = async (id: string) => {
    setReindexingId(id);
    try {
      const result = await reindexDocument(id);
      if (result.success) {
        toast.success('Documento reindexado com sucesso');
        onRefresh?.();
      } else {
        toast.error(result.errors?.[0] || 'Erro ao reindexar documento');
      }
    } catch (error) {
      toast.error('Erro ao reindexar documento');
    } finally {
      setReindexingId(null);
    }
  };

  const getFileIcon = (mimetype: string) => {
    switch (mimetype) {
      case 'application/pdf':
        return <FileText className="w-5 h-5 text-red-400" />;
      case 'application/msword':
        return <FileText className="w-5 h-5 text-orange-400" />;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'text/plain':
        return <File className="w-5 h-5 text-gray-400" />;
      case 'text/markdown':
        return <File className="w-5 h-5 text-purple-400" />;
      default:
        return <File className="w-5 h-5 text-neutral-gray" />;
    }
  };

  const getFileTypeLabel = (mimetype: string) => {
    switch (mimetype) {
      case 'application/pdf':
        return 'PDF';
      case 'application/msword':
        return 'DOC';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'DOCX';
      case 'text/plain':
        return 'TXT';
      case 'text/markdown':
        return 'MD';
      default:
        return 'Arquivo';
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-dark-bg-secondary rounded-lg border border-neutral-gray/10">
        <FileText className="w-12 h-12 text-neutral-gray/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-white mb-2">Nenhum documento indexado</h3>
        <p className="text-sm text-neutral-gray">
          Faça upload de documentos para começar a construir a base de conhecimento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={filters.search || ''}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, search: e.target.value }));
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-dark-bg-secondary border border-neutral-gray/20 rounded-lg text-sm text-neutral-white placeholder:text-neutral-gray/50 focus:outline-none focus:border-accent-primary"
          />
        </div>
        <select
          value={filters.type || ''}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, type: e.target.value || undefined }));
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-dark-bg-secondary border border-neutral-gray/20 rounded-lg text-sm text-neutral-white focus:outline-none focus:border-accent-primary"
        >
          <option value="">Todos os tipos</option>
          <option value="application/pdf">PDF</option>
          <option value="application/msword">DOC</option>
          <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">
            DOCX
          </option>
          <option value="text/plain">TXT</option>
          <option value="text/markdown">MD</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border border-neutral-gray/10">
        <table className="w-full">
          <thead className="bg-dark-bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-gray uppercase">
                Documento
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-gray uppercase hidden sm:table-cell">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-gray uppercase hidden md:table-cell">
                Tamanho
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-gray uppercase hidden lg:table-cell">
                Indexado em
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-gray uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-gray/10">
            {paginatedDocuments.map((doc) => (
              <tr key={doc.id} className="bg-dark-bg-primary hover:bg-dark-bg-secondary/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {getFileIcon(doc.mimetype)}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-white truncate max-w-[200px]">
                        {doc.title}
                      </p>
                      <p className="text-xs text-neutral-gray truncate max-w-[200px]">
                        {doc.filename}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-dark-bg-secondary text-neutral-gray">
                    {getFileTypeLabel(doc.mimetype)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-gray hidden md:table-cell">
                  {formatFileSize(doc.size)}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-gray hidden lg:table-cell">
                  {format(new Date(doc.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleReindex(doc.id)}
                      disabled={reindexingId === doc.id}
                      className="p-2 hover:bg-accent-primary/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Reindexar"
                    >
                      {reindexingId === doc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-accent-primary" />
                      ) : (
                        <RefreshCw className="w-4 h-4 text-neutral-gray hover:text-accent-primary" />
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Excluir"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-neutral-gray hover:text-red-400" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-gray">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredDocuments.length)} de{' '}
            {filteredDocuments.length} documentos
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-dark-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-gray" />
            </button>
            <span className="text-sm text-neutral-white">
              {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-dark-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-neutral-gray" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-bg-primary rounded-lg border border-neutral-gray/20 p-6 max-w-md w-full">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-neutral-white mb-2">Confirmar exclusão</h3>
                <p className="text-sm text-neutral-gray mb-4">
                  Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-4 py-2 text-sm text-neutral-gray hover:text-neutral-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(confirmDelete)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
