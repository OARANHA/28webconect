'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileText,
  Image,
  Video,
  Archive,
  File,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';
import { useFileUpload } from '@/hooks/useFileUpload';
import { validateFileType, getMaxFileSize, getFileCategory } from '@/lib/validations/file-upload';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/project/ProgressBar';

interface FileUploadProps {
  projectId: string;
  onUploadComplete?: () => void;
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

interface SelectedFile {
  file: File;
  valid: boolean;
  error?: string;
}

/**
 * Componente de upload com drag-and-drop
 */
export default function FileUpload({ projectId, onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, uploading, progress, error, retryCount, resetError, resetState } =
    useFileUpload();

  /**
   * Valida arquivo client-side
   */
  const validateFile = useCallback((file: File): SelectedFile => {
    // Valida tipo
    const typeValidation = validateFileType(file.name, file.type);
    if (!typeValidation.valid) {
      return {
        file,
        valid: false,
        error: typeValidation.error,
      };
    }

    // Valida tamanho
    const maxSize = getMaxFileSize(file.type);
    if (file.size > maxSize) {
      const category = getFileCategory(file.type);
      return {
        file,
        valid: false,
        error: `Limite para ${category}: ${formatFileSize(maxSize)}`,
      };
    }

    return { file, valid: true };
  }, []);

  /**
   * Handler para drag enter
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  /**
   * Handler para drag leave
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  /**
   * Handler para drag over
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  /**
   * Handler para drop
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      resetError();

      const files = Array.from(e.dataTransfer.files);
      const validated = files.map(validateFile);
      setSelectedFiles((prev) => [...prev, ...validated]);
    },
    [validateFile, resetError]
  );

  /**
   * Handler para seleção via input
   */
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      resetError();
      const files = Array.from(e.target.files || []);
      const validated = files.map(validateFile);
      setSelectedFiles((prev) => [...prev, ...validated]);

      // Limpa input para permitir selecionar mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [validateFile, resetError]
  );

  /**
   * Remove arquivo da lista de selecionados
   */
  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Inicia upload dos arquivos selecionados
   */
  const handleUpload = useCallback(async () => {
    const validFiles = selectedFiles.filter((f) => f.valid);
    if (validFiles.length === 0) return;

    resetError();
    let successCount = 0;

    for (const { file } of validFiles) {
      const success = await uploadFile(file, projectId);
      if (success) {
        successCount++;
      }
    }

    // Limpa arquivos selecionados após upload
    if (successCount === validFiles.length) {
      setSelectedFiles([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      onUploadComplete?.();
    }
  }, [selectedFiles, uploadFile, projectId, resetError, onUploadComplete]);

  /**
   * Abre seletor de arquivos
   */
  const openFileSelector = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const validFiles = selectedFiles.filter((f) => f.valid);
  const hasErrors = selectedFiles.some((f) => !f.valid) || error;

  return (
    <Card
      className={cn(
        'transition-all duration-300',
        isDragging && 'ring-2 ring-accent-primary ring-offset-2 ring-offset-dark-bg-primary'
      )}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-white">Upload de Arquivos</h3>
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-neutral-gray">
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </div>
          )}
        </div>

        {/* Drop Zone */}
        <div
          onClick={openFileSelector}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer',
            'transition-all duration-300',
            'hover:border-accent-primary/50 hover:bg-accent-primary/5',
            isDragging
              ? 'border-accent-primary bg-accent-primary/10'
              : 'border-neutral-gray/20 bg-dark-bg-primary',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.svg,.gif,.mp4,.mov,.avi,.zip,.rar"
          />

          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
                isDragging ? 'bg-accent-primary/20' : 'bg-neutral-gray/10'
              )}
            >
              <Upload
                className={cn(
                  'w-8 h-8 transition-colors',
                  isDragging ? 'text-accent-primary' : 'text-neutral-gray'
                )}
              />
            </div>

            <div>
              <p className="text-neutral-white font-medium">
                {isDragging
                  ? 'Solte os arquivos aqui'
                  : 'Arraste arquivos aqui ou clique para selecionar'}
              </p>
              <p className="text-sm text-neutral-gray mt-1">
                Máx: Documentos 10MB, Imagens 5MB, Vídeos 100MB, Compactados 50MB
              </p>
            </div>
          </div>
        </div>

        {/* Lista de arquivos selecionados */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-white">
              Arquivos selecionados ({selectedFiles.length})
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedFiles.map((selected, index) => (
                <div
                  key={`${selected.file.name}-${index}`}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border',
                    selected.valid
                      ? 'bg-dark-bg-primary border-neutral-gray/10'
                      : 'bg-red-500/5 border-red-500/20'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      selected.valid ? 'bg-accent-primary/10' : 'bg-red-500/10'
                    )}
                  >
                    {getFileIcon(
                      selected.file.type,
                      cn('w-5 h-5', selected.valid ? 'text-accent-primary' : 'text-red-400')
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium truncate',
                        selected.valid ? 'text-neutral-white' : 'text-red-400'
                      )}
                    >
                      {selected.file.name}
                    </p>
                    <p className="text-xs text-neutral-gray">
                      {formatFileSize(selected.file.size)}
                      {selected.error && (
                        <span className="text-red-400 ml-2">{selected.error}</span>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="p-1.5 rounded-lg text-neutral-gray hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progresso */}
        {uploading && (
          <div className="space-y-2">
            <ProgressBar progress={progress} size="md" />
            {retryCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Tentativa {retryCount + 1} de 3...
              </div>
            )}
          </div>
        )}

        {/* Mensagem de erro */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Erro no upload</p>
              <p className="text-sm text-red-300/80">{error}</p>
            </div>
            <button onClick={resetError} className="p-1 rounded hover:bg-red-500/10 text-red-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Mensagem de sucesso */}
        {showSuccess && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-sm font-medium text-green-400">Arquivos enviados com sucesso!</p>
          </div>
        )}

        {/* Botões de ação */}
        {validFiles.length > 0 && !uploading && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-lg font-medium text-sm',
                'bg-accent-primary text-neutral-white',
                'hover:bg-accent-primary/90 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2'
              )}
            >
              <Upload className="w-4 h-4" />
              Enviar {validFiles.length} arquivo{validFiles.length > 1 ? 's' : ''}
            </button>

            <button
              onClick={() => {
                setSelectedFiles([]);
                resetState();
              }}
              disabled={uploading}
              className={cn(
                'py-2.5 px-4 rounded-lg font-medium text-sm',
                'border border-neutral-gray/20 text-neutral-gray',
                'hover:border-neutral-gray/40 hover:text-neutral-white transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Limpar
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
