'use client';

/**
 * Componente de upload de documentos para a base de conhecimento
 * Com preview de conteúdo antes de indexar
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, File, X, Loader2, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/validations/admin-knowledge';
import { ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE_BYTES } from '@/lib/validations/admin-knowledge';
import type { UploadProgress } from '@/types/admin-knowledge';

interface DocumentUploadProps {
  onUploadComplete?: () => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.txt,.md';
const ACCEPTED_MIMETYPES = ALLOWED_DOCUMENT_TYPES;
const MAX_PREVIEW_LENGTH = 2000; // Máximo de caracteres para preview de texto

export default function DocumentUpload({
  onUploadComplete,
  disabled = false,
}: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'idle',
    message: '',
  });
  const [metadata, setMetadata] = useState({
    title: '',
    category: 'geral',
    tags: '',
  });

  // Estados para preview
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Verifica tipo
    if (!ACCEPTED_MIMETYPES.includes(file.type as (typeof ACCEPTED_MIMETYPES)[number])) {
      return 'Tipo de arquivo não suportado. Use PDF, DOC, DOCX, TXT ou MD';
    }

    // Verifica tamanho
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      return `Arquivo excede o limite de 10MB (${formatFileSize(file.size)})`;
    }

    return null;
  };

  const loadPreview = useCallback(async (file: File) => {
    setIsLoadingPreview(true);

    try {
      // Para arquivos de texto (TXT/MD), mostra snippet do conteúdo
      if (file.type === 'text/plain' || file.type === 'text/markdown') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          // Limita preview aos primeiros caracteres
          const snippet =
            text.length > MAX_PREVIEW_LENGTH
              ? text.substring(0, MAX_PREVIEW_LENGTH) + '\n\n[... conteúdo truncado ...]'
              : text;
          setPreviewText(snippet);
          setIsLoadingPreview(false);
        };
        reader.onerror = () => {
          setPreviewText(null);
          setIsLoadingPreview(false);
        };
        reader.readAsText(file);
      }
      // Para PDF/DOC/DOCX, cria URL para iframe
      else if (
        file.type === 'application/pdf' ||
        file.type === 'application/msword' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setIsLoadingPreview(false);
      }
    } catch (error) {
      console.error('Erro ao carregar preview:', error);
      setIsLoadingPreview(false);
    }
  }, []);

  const clearPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewText(null);
    setPreviewUrl(null);
    setIsLoadingPreview(false);
  }, [previewUrl]);

  const handleFileSelect = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      // Limpa preview anterior
      clearPreview();

      setSelectedFile(file);
      // Sugere título baseado no nome do arquivo
      const suggestedTitle = file.name.replace(/\.[^/.]+$/, '');
      setMetadata((prev) => ({ ...prev, title: suggestedTitle }));

      // Carrega preview
      loadPreview(file);
    },
    [clearPreview, loadPreview]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setMetadata({ title: '', category: 'geral', tags: '' });
    clearPreview();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [clearPreview]);

  // Limpa URL ao desmontar
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setProgress({
      progress: 0,
      status: 'uploading',
      message: 'Enviando arquivo...',
      filename: selectedFile.name,
    });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', metadata.title || selectedFile.name.replace(/\.[^/.]+$/, ''));
      formData.append('category', metadata.category);
      formData.append(
        'tags',
        JSON.stringify(
          metadata.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        )
      );

      setProgress((prev) => ({ ...prev, progress: 30 }));

      const response = await fetch('/api/admin/knowledge/upload', {
        method: 'POST',
        body: formData,
      });

      setProgress((prev) => ({ ...prev, progress: 80 }));

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Falha no upload');
      }

      setProgress({
        progress: 100,
        status: 'complete',
        message: 'Documento indexado com sucesso!',
        filename: selectedFile.name,
      });

      toast.success('Documento indexado com sucesso!');
      clearFile();
      onUploadComplete?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload';
      setProgress({
        progress: 0,
        status: 'error',
        message: errorMessage,
        filename: selectedFile.name,
      });
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (mimetype: string) => {
    switch (mimetype) {
      case 'application/pdf':
        return <File className="w-8 h-8 text-red-400" />;
      case 'application/msword':
        return <File className="w-8 h-8 text-orange-400" />;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <File className="w-8 h-8 text-blue-400" />;
      case 'text/plain':
        return <FileText className="w-8 h-8 text-gray-400" />;
      case 'text/markdown':
        return <FileText className="w-8 h-8 text-purple-400" />;
      default:
        return <File className="w-8 h-8 text-neutral-gray" />;
    }
  };

  const isTextFile = selectedFile?.type === 'text/plain' || selectedFile?.type === 'text/markdown';
  const isPreviewableFile =
    selectedFile &&
    (selectedFile.type === 'application/pdf' ||
      selectedFile.type === 'application/msword' ||
      selectedFile.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      selectedFile.type === 'text/plain' ||
      selectedFile.type === 'text/markdown');

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 transition-colors',
          'flex flex-col items-center justify-center gap-4',
          isDragging
            ? 'border-accent-primary bg-accent-primary/5'
            : 'border-neutral-gray/30 hover:border-neutral-gray/50',
          disabled && 'opacity-50 cursor-not-allowed',
          selectedFile && 'border-green-500/50 bg-green-500/5'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center gap-4 w-full">
            {getFileIcon(selectedFile.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-white truncate">{selectedFile.name}</p>
              <p className="text-xs text-neutral-gray">{formatFileSize(selectedFile.size)}</p>
            </div>
            {!isUploading && (
              <button
                onClick={clearFile}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-red-400" />
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-accent-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-white">
                Arraste e solte um arquivo aqui
              </p>
              <p className="text-xs text-neutral-gray mt-1">
                ou{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-accent-primary hover:underline"
                  disabled={disabled}
                >
                  clique para selecionar
                </button>
              </p>
            </div>
            <p className="text-xs text-neutral-gray/60">PDF, DOC, DOCX, TXT ou MD (máx. 10MB)</p>
          </>
        )}
      </div>

      {/* Preview do Documento */}
      {selectedFile && isPreviewableFile && !isUploading && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent-primary" />
            Preview do Documento
          </h3>

          {isLoadingPreview ? (
            <div className="flex items-center justify-center p-8 bg-dark-bg-primary/50 rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin text-accent-primary" />
              <span className="ml-2 text-sm text-neutral-gray">Carregando preview...</span>
            </div>
          ) : (
            <div className="bg-dark-bg-primary/50 rounded-lg border border-neutral-gray/20 overflow-hidden">
              {/* Preview de texto para TXT/MD */}
              {isTextFile && previewText && (
                <div className="p-4 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-neutral-gray whitespace-pre-wrap font-mono">
                    {previewText}
                  </pre>
                </div>
              )}

              {/* Preview via iframe para PDF */}
              {selectedFile.type === 'application/pdf' && previewUrl && (
                <div className="w-full h-64">
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="Preview do PDF"
                  />
                </div>
              )}

              {/* Preview via object para DOC/DOCX (fallback para mensagem) */}
              {(selectedFile.type === 'application/msword' ||
                selectedFile.type ===
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
                <div className="p-6 text-center">
                  <File className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-sm text-neutral-white mb-1">Documento Word selecionado</p>
                  <p className="text-xs text-neutral-gray">
                    O conteúdo será extraído e indexado automaticamente após o upload.
                  </p>
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-xs text-accent-primary hover:underline"
                    >
                      Abrir documento em nova aba
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Metadados */}
      {selectedFile && (
        <div className="space-y-3 p-4 bg-dark-bg-primary/50 rounded-lg">
          <div>
            <label className="block text-xs font-medium text-neutral-gray mb-1">
              Título (opcional)
            </label>
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => setMetadata((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Título do documento"
              disabled={isUploading}
              className="w-full px-3 py-2 bg-dark-bg-secondary border border-neutral-gray/20 rounded-lg text-sm text-neutral-white placeholder:text-neutral-gray/50 focus:outline-none focus:border-accent-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-gray mb-1">Categoria</label>
              <select
                value={metadata.category}
                onChange={(e) => setMetadata((prev) => ({ ...prev, category: e.target.value }))}
                disabled={isUploading}
                className="w-full px-3 py-2 bg-dark-bg-secondary border border-neutral-gray/20 rounded-lg text-sm text-neutral-white focus:outline-none focus:border-accent-primary"
              >
                <option value="geral">Geral</option>
                <option value="documentacao">Documentação</option>
                <option value="institucional">Institucional</option>
                <option value="faq">FAQ</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-gray mb-1">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={metadata.tags}
                onChange={(e) => setMetadata((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="erp, tutorial, financeiro"
                disabled={isUploading}
                className="w-full px-3 py-2 bg-dark-bg-secondary border border-neutral-gray/20 rounded-lg text-sm text-neutral-white placeholder:text-neutral-gray/50 focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Progresso */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-accent-primary" />
            <span className="text-sm text-neutral-white">{progress.message}</span>
          </div>
          <div className="h-2 bg-dark-bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-primary transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Botão de Upload */}
      {selectedFile && !isUploading && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full py-3 bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-dark-bg-primary transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Indexar Documento
        </button>
      )}

      {/* Mensagem de erro */}
      {progress.status === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{progress.message}</p>
        </div>
      )}
    </div>
  );
}
