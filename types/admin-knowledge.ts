/**
 * Tipos TypeScript para gestão da base de conhecimento
 */

import { Document } from '@prisma/client';

/**
 * Metadados de um documento
 */
export interface DocumentMetadata {
  /** Título do documento */
  title?: string;
  /** Tipo de documento */
  type: 'upload' | 'page' | 'faq' | 'manual';
  /** Categoria de conteúdo */
  category?: string;
  /** Origem do documento */
  source: 'upload' | 'scraping' | 'manual';
  /** Tags para busca */
  tags: string[];
  /** Nome do arquivo original */
  filename?: string;
  /** Tamanho em bytes */
  filesize?: number;
  /** Tipo MIME */
  mimetype?: string;
  /** ID do usuário que fez upload */
  uploadedBy?: string;
  /** Data de upload (ISO string) */
  uploadedAt?: string;
  /** URL da página (para documentos de scraping) */
  url?: string;
}

/**
 * Documento com estatísticas adicionais
 */
export interface DocumentWithStats extends Document {
  /** Score de similaridade (quando retornado de busca vetorial) */
  similarity?: number;
  /** Contagem de uso em respostas */
  usageCount?: number;
  /** Metadados parseados */
  parsedMetadata?: DocumentMetadata;
}

/**
 * Estatísticas globais da base de conhecimento
 */
export interface KnowledgeStats {
  /** Total de documentos */
  totalDocs: number;
  /** Tamanho total em bytes */
  totalSize: number;
  /** Data da última atualização */
  lastUpdate: string | null;
  /** Breakdown por tipo de arquivo */
  breakdown: {
    pdf?: number;
    doc?: number;
    docx?: number;
    txt?: number;
    md?: number;
    page?: number;
    [key: string]: number | undefined;
  };
  /** Porcentagem de uso do armazenamento (0-100) */
  storagePercentage?: number;
}

/**
 * Resultado de upload de documento
 */
export interface DocumentUploadResult {
  /** Sucesso da operação */
  success: boolean;
  /** Documento criado (em caso de sucesso) */
  document?: DocumentWithStats;
  /** Mensagem de erro (em caso de falha) */
  error?: string;
  /** Detalhes adicionais */
  details?: {
    extractedTextLength?: number;
    embeddingGenerated?: boolean;
  };
}

/**
 * Resultado de reindexação
 */
export interface ReindexResult {
  /** Sucesso da operação */
  success: boolean;
  /** Quantidade processada */
  processed: number;
  /** Quantidade com falha */
  failed: number;
  /** Lista de erros */
  errors: string[];
  /** Tempo total em ms */
  duration?: number;
}

/**
 * Resultado de scraping
 */
export interface ScrapeResult {
  /** Sucesso da operação */
  success: boolean;
  /** Páginas indexadas */
  pagesIndexed: number;
  /** URLs processadas */
  urls: string[];
  /** Erros ocorridos */
  errors: string[];
}

/**
 * Item de documento para lista
 */
export interface DocumentListItem {
  id: string;
  title: string;
  filename: string;
  type: string;
  size: number;
  createdAt: string;
  mimetype: string;
}

/**
 * Filtros para lista de documentos
 */
export interface DocumentFilters {
  search?: string;
  type?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Paginação de documentos
 */
export interface DocumentPagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

/**
 * Estado do upload em andamento
 */
export interface UploadProgress {
  /** Progresso (0-100) */
  progress: number;
  /** Status atual */
  status: 'idle' | 'uploading' | 'extracting' | 'embedding' | 'saving' | 'complete' | 'error';
  /** Mensagem de status */
  message: string;
  /** Arquivo sendo processado */
  filename?: string;
}

/**
 * Dados extraídos de uma página para scraping
 */
export interface ScrapedPage {
  /** URL da página */
  url: string;
  /** Título da página */
  title: string;
  /** Conteúdo extraído */
  content: string;
  /** Metadados */
  metadata: {
    type: 'page';
    source: 'scraping';
    url: string;
    title: string;
    scrapedAt: string;
  };
}

/**
 * Configurações da base de conhecimento
 */
export interface KnowledgeBaseConfig {
  maxDocuments: number;
  maxTotalSizeMB: number;
  maxDocumentSizeMB: number;
  allowedTypes: string[];
  autoScrapeEnabled: boolean;
  scrapeUrls: string[];
}
