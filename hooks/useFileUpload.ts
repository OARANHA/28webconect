'use client';

import { useState, useCallback, useRef } from 'react';
import { validateFileType, getMaxFileSize, formatFileSize } from '@/lib/validations/file-upload';
import { FileUploadProgress, UploadedFile, UploadFileState } from '@/types/file-upload';

// Constantes
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB por chunk
const CHUNK_THRESHOLD = 10 * 1024 * 1024; // Arquivos > 10MB usam chunked upload
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 2000; // 2 segundos base para exponential backoff

interface UseFileUploadReturn extends UploadFileState {
  uploadFile: (file: File, projectId: string) => Promise<boolean>;
  uploadMultipleFiles: (files: File[], projectId: string) => Promise<boolean[]>;
  cancelUpload: () => void;
  resetError: () => void;
  resetState: () => void;
}

/**
 * Hook para gerenciar uploads de arquivos com retry e chunked upload
 */
export function useFileUpload(): UseFileUploadReturn {
  const [state, setState] = useState<UploadFileState>({
    uploading: false,
    progress: 0,
    error: null,
    retryCount: 0,
    uploadedFiles: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Aguarda um tempo determinado
   */
  const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * Calcula delay com exponential backoff
   */
  const getRetryDelay = (attempt: number): number => {
    return RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
  };

  /**
   * Valida arquivo client-side antes do upload
   */
  const validateClientSide = (file: File): { valid: boolean; error?: string } => {
    // Valida tipo
    const typeValidation = validateFileType(file.name, file.type);
    if (!typeValidation.valid) {
      return { valid: false, error: typeValidation.error };
    }

    // Valida tamanho
    const maxSize = getMaxFileSize(file.type);
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Arquivo excede o limite de ${formatFileSize(maxSize)}`,
      };
    }

    return { valid: true };
  };

  /**
   * Faz upload de um chunk
   */
  const uploadChunk = async (
    chunk: Blob,
    uploadId: string,
    chunkIndex: number,
    totalChunks: number,
    filename: string,
    projectId: string,
    mimetype: string,
    signal: AbortSignal
  ): Promise<{ success: boolean; file?: UploadedFile; message?: string }> => {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('filename', filename);
    formData.append('projectId', projectId);
    formData.append('mimetype', mimetype); // Envia o MIME original do arquivo

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erro ao enviar chunk ${chunkIndex}`);
    }

    return response.json();
  };

  /**
   * Faz upload completo de arquivo pequeno
   */
  const uploadSingleFile = async (
    file: File,
    projectId: string,
    signal: AbortSignal
  ): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao enviar arquivo');
    }

    const result = await response.json();
    return result.file;
  };

  /**
   * Faz upload em chunks para arquivos grandes
   */
  const uploadChunkedFile = async (
    file: File,
    projectId: string,
    signal: AbortSignal,
    onProgress: (progress: number) => void
  ): Promise<UploadedFile> => {
    const uploadId = crypto.randomUUID();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let finalResponse: { success: boolean; file?: UploadedFile; message?: string } | null = null;

    for (let i = 0; i < totalChunks; i++) {
      if (signal.aborted) {
        throw new Error('Upload cancelado');
      }

      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const response = await uploadChunk(
        chunk,
        uploadId,
        i,
        totalChunks,
        file.name,
        projectId,
        file.type, // Passa o MIME original
        signal
      );

      // Guarda a resposta do último chunk (que contém os dados do arquivo)
      if (i === totalChunks - 1) {
        finalResponse = response;
      }

      // Atualiza progresso
      const progress = Math.round(((i + 1) / totalChunks) * 100);
      onProgress(progress);
    }

    // Retorna os dados do arquivo retornados pelo servidor
    if (finalResponse?.file) {
      return finalResponse.file;
    }

    // Fallback caso não tenha resposta (não deveria acontecer)
    throw new Error('Erro ao processar upload: resposta do servidor inválida');
  };

  /**
   * Executa upload com retry automático
   */
  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    onRetry: (attempt: number) => void
  ): Promise<T> => {
    let lastError: Error;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // Não faz retry se foi cancelado
        if (error.name === 'AbortError') {
          throw error;
        }

        // Não faz retry em erros de validação
        if (error.message?.includes('tamanho') || error.message?.includes('tipo')) {
          throw error;
        }

        if (attempt < MAX_RETRIES) {
          onRetry(attempt);
          await sleep(getRetryDelay(attempt));
        }
      }
    }

    throw lastError!;
  };

  /**
   * Upload de um único arquivo
   */
  const uploadFile = useCallback(
    async (file: File, projectId: string): Promise<boolean> => {
      // Cancela upload anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Valida client-side
      const validation = validateClientSide(file);
      if (!validation.valid) {
        setState((prev) => ({
          ...prev,
          error: validation.error || 'Arquivo inválido',
          uploading: false,
        }));
        return false;
      }

      setState({
        uploading: true,
        progress: 0,
        error: null,
        retryCount: 0,
        uploadedFiles: state.uploadedFiles,
      });

      try {
        const isChunked = file.size > CHUNK_THRESHOLD;
        let uploadedFile: UploadedFile;

        if (isChunked) {
          // Upload em chunks
          uploadedFile = await executeWithRetry(
            () =>
              uploadChunkedFile(file, projectId, abortController.signal, (progress) =>
                setState((prev) => ({ ...prev, progress }))
              ),
            (attempt) => setState((prev) => ({ ...prev, retryCount: attempt }))
          );
        } else {
          // Upload direto
          uploadedFile = await executeWithRetry(
            () => uploadSingleFile(file, projectId, abortController.signal),
            (attempt) => setState((prev) => ({ ...prev, retryCount: attempt }))
          );
        }

        setState((prev) => ({
          uploading: false,
          progress: 100,
          error: null,
          retryCount: 0,
          uploadedFiles: [...prev.uploadedFiles, uploadedFile],
        }));

        return true;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          setState((prev) => ({
            ...prev,
            uploading: false,
            error: 'Upload cancelado',
          }));
        } else {
          setState((prev) => ({
            ...prev,
            uploading: false,
            error: error.message || 'Erro ao enviar arquivo',
          }));
        }
        return false;
      }
    },
    [state.uploadedFiles]
  );

  /**
   * Upload de múltiplos arquivos
   */
  const uploadMultipleFiles = useCallback(
    async (files: File[], projectId: string): Promise<boolean[]> => {
      const results: boolean[] = [];

      for (const file of files) {
        const result = await uploadFile(file, projectId);
        results.push(result);
      }

      return results;
    },
    [uploadFile]
  );

  /**
   * Cancela upload em andamento
   */
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      uploading: false,
      error: 'Upload cancelado',
    }));
  }, []);

  /**
   * Reseta estado de erro
   */
  const resetError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null, retryCount: 0 }));
  }, []);

  /**
   * Reseta estado completo
   */
  const resetState = useCallback(() => {
    setState({
      uploading: false,
      progress: 0,
      error: null,
      retryCount: 0,
      uploadedFiles: [],
    });
  }, []);

  return {
    ...state,
    uploadFile,
    uploadMultipleFiles,
    cancelUpload,
    resetError,
    resetState,
  };
}
