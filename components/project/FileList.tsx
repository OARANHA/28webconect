'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Image,
  Video,
  Archive,
  File,
  Download,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { cn, formatDate, formatFileSize } from '@/lib/utils';
import { getProjectFiles, deleteProjectFile } from '@/app/actions/upload';
import Card from '@/components/ui/Card';
import { ProjectFile } from '@prisma/client';

interface FileListProps {
  projectId: string;
  userId: string;
  canDelete?: boolean;
}

interface FileWithUser extends ProjectFile {
  user?: {
    name: string | null;
    email: string;
  };
}

/**
 * Retorna ícone apropriado baseado no tipo MIME
 */
function getFileIcon(mimetype: string, className?: string) {
  if (mimetype.startsWith('image/')) {
    return <Image className={className} />;
  }
  if (mimetype.startsWith('video/')) {
    return <Video className={className} />;
  }
  if (mimetype.includes('pdf') || mimetype.includes('word') || mimetype.includes('excel')) {
    return <FileText className={className} />;
  }
  if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('compressed')) {
    return <Archive className={className} />;
  }
  return <File className={className} />;
}

/**
 * Componente de lista de arquivos do projeto
 */
export default function FileList({ projectId, userId, canDelete = false }: FileListProps) {
  const [files, setFiles] = useState<FileWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /**
   * Busca arquivos do projeto
   */
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getProjectFiles(projectId, userId);

      if (response.success && response.data) {
        setFiles(response.data as FileWithUser[]);
      } else {
        setError(response.error || 'Erro ao carregar arquivos');
      }
    } catch (err) {
      setError('Erro ao carregar arquivos');
    } finally {
      setLoading(false);
    }
  }, [projectId, userId]);

  // Busca arquivos ao montar componente
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  /**
   * Deleta um arquivo
   */
  const handleDelete = useCallback(
    async (fileId: string) => {
      if (!confirm('Tem certeza que deseja excluir este arquivo?')) {
        return;
      }

      try {
        setDeletingId(fileId);

        const response = await deleteProjectFile(fileId, userId);

        if (response.success) {
          setFiles((prev) => prev.filter((f) => f.id !== fileId));
        } else {
          alert(response.error || 'Erro ao excluir arquivo');
        }
      } catch (err) {
        alert('Erro ao excluir arquivo');
      } finally {
        setDeletingId(null);
      }
    },
    [userId]
  );

  /**
   * Trunca nome do arquivo se muito longo
   */
  const truncateFilename = (filename: string, maxLength: number = 30): string => {
    if (filename.length <= maxLength) return filename;
    const extension = filename.split('.').pop();
    const name = filename.substring(0, filename.lastIndexOf('.'));
    const truncatedName = name.substring(0, maxLength - (extension?.length || 0) - 4);
    return `${truncatedName}...${extension ? `.${extension}` : ''}`;
  };

  // Estado de loading
  if (loading) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-neutral-white mb-4">Arquivos do Projeto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-dark-bg-primary rounded-lg p-4 border border-neutral-gray/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-gray/20" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-gray/20 rounded w-3/4" />
                  <div className="h-3 bg-neutral-gray/20 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-neutral-white mb-4">Arquivos do Projeto</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <p className="text-neutral-white font-medium mb-2">Erro ao carregar arquivos</p>
          <p className="text-sm text-neutral-gray mb-4">{error}</p>
          <button
            onClick={fetchFiles}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-accent-primary/10 text-accent-primary',
              'hover:bg-accent-primary/20 transition-colors'
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        </div>
      </Card>
    );
  }

  // Estado vazio
  if (files.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-neutral-white mb-4">Arquivos do Projeto</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <File className="w-16 h-16 text-neutral-gray/30 mb-4" />
          <p className="text-neutral-white font-medium mb-1">Nenhum arquivo enviado ainda</p>
          <p className="text-sm text-neutral-gray">Os arquivos enviados aparecerão aqui</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-white">Arquivos do Projeto</h3>
        <span className="text-sm text-neutral-gray">
          {files.length} arquivo{files.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              'group relative bg-dark-bg-primary rounded-lg p-4',
              'border border-neutral-gray/10',
              'hover:border-accent-primary/30 hover:-translate-y-0.5',
              'transition-all duration-300'
            )}
          >
            <div className="flex items-start gap-3">
              {/* Ícone */}
              <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                {getFileIcon(file.mimetype, 'w-5 h-5 text-accent-primary')}
              </div>

              {/* Informações */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-neutral-white truncate"
                  title={file.filename}
                >
                  {truncateFilename(file.filename)}
                </p>
                <p className="text-xs text-neutral-gray mt-0.5">{formatFileSize(file.filesize)}</p>
                <p className="text-xs text-neutral-gray/60 mt-0.5">{formatDate(file.uploadedAt)}</p>
              </div>
            </div>

            {/* Ações */}
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={`/api/download/${file.id}`}
                download
                className={cn(
                  'p-1.5 rounded-lg',
                  'text-neutral-gray hover:text-accent-primary',
                  'hover:bg-accent-primary/10 transition-colors'
                )}
                title="Download"
              >
                <Download className="w-4 h-4" />
              </a>

              {canDelete && (
                <button
                  onClick={() => handleDelete(file.id)}
                  disabled={deletingId === file.id}
                  className={cn(
                    'p-1.5 rounded-lg',
                    'text-neutral-gray hover:text-red-400',
                    'hover:bg-red-500/10 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                  title="Excluir"
                >
                  {deletingId === file.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
