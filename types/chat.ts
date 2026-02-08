/**
 * Tipos para o sistema de chat com RAG
 */

import { Document } from '@prisma/client';

/**
 * Papel da mensagem no chat
 */
export type ChatRole = 'user' | 'assistant' | 'system';

/**
 * Interface de uma mensagem no chat
 */
export interface Message {
  /** Identificador único da mensagem */
  id: string;
  /** Papel do emissor da mensagem */
  role: ChatRole;
  /** Conteúdo textual da mensagem */
  content: string;
  /** Timestamp de criação */
  createdAt: Date;
  /** Metadados opcionais (ex: tokens usados, tempo de resposta) */
  metadata?: {
    tokensUsed?: number;
    responseTime?: number;
    sources?: string[];
  };
}

/**
 * Interface de uma sessão de chat
 */
export interface ChatSession {
  /** Identificador único da sessão */
  id: string;
  /** ID do usuário (null para visitantes anônimos) */
  userId: string | null;
  /** Histórico de mensagens */
  messages: Message[];
  /** Data de criação da sessão */
  createdAt: Date;
  /** Data da última atualização */
  updatedAt: Date;
  /** Título opcional da sessão (gerado automaticamente ou definido pelo usuário) */
  title?: string;
}

/**
 * Contexto RAG para resposta
 */
export interface RAGContext {
  /** Documentos recuperados da busca semântica */
  documents: Document[];
  /** Query original do usuário */
  query: string;
  /** Scores de relevância dos documentos (0-1) */
  relevanceScores?: number[];
  /** Conteúdo combinado dos documentos para contexto */
  combinedContext?: string;
}

/**
 * Dados para envio de mensagem
 */
export interface SendMessageInput {
  /** Conteúdo da mensagem */
  content: string;
  /** ID da sessão (opcional - cria nova se não fornecido) */
  sessionId?: string;
  /** ID do usuário (opcional - para associar a sessão) */
  userId?: string;
  /** Usar RAG para enriquecer resposta */
  useRAG?: boolean;
}

/**
 * Resposta do chat
 */
export interface ChatResponse {
  /** Mensagem do assistente */
  message: Message;
  /** Contexto RAG usado (se aplicável) */
  ragContext?: RAGContext;
  /** ID da sessão */
  sessionId: string;
}

/**
 * Configurações do chat
 */
export interface ChatConfig {
  /** Provedor de LLM a usar */
  provider: 'mistral' | 'groq';
  /** Temperatura para geração (0-2) */
  temperature?: number;
  /** Número máximo de tokens */
  maxTokens?: number;
  /** Número de documentos para RAG */
  ragDocumentLimit?: number;
  /** Score mínimo de similaridade para RAG */
  ragMinSimilarity?: number;
  /** Usar streaming de resposta */
  streaming?: boolean;
}

/**
 * Estado do chat no frontend
 */
export interface ChatState {
  /** Mensagens da sessão atual */
  messages: Message[];
  /** ID da sessão atual */
  sessionId: string | null;
  /** Indica se está carregando resposta */
  isLoading: boolean;
  /** Erro atual (se houver) */
  error: string | null;
  /** Configurações atuais */
  config: ChatConfig;
}

/**
 * Ações disponíveis para o chat
 */
export type ChatAction =
  | { type: 'SEND_MESSAGE'; payload: { content: string } }
  | { type: 'RECEIVE_MESSAGE'; payload: { message: Message } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_CHAT' }
  | { type: 'SET_SESSION'; payload: string }
  | { type: 'UPDATE_CONFIG'; payload: Partial<ChatConfig> };

/**
 * Evento de streaming de mensagem
 */
export interface StreamingMessageEvent {
  /** Tipo do evento */
  type: 'chunk' | 'done' | 'error';
  /** Conteúdo (chunk de texto ou mensagem de erro) */
  content?: string;
  /** Mensagem de erro (se type === 'error') */
  error?: string;
  /** ID da mensagem */
  messageId?: string;
}

/**
 * Estatísticas de uso do chat
 */
export interface ChatStats {
  /** Total de mensagens */
  totalMessages: number;
  /** Total de sessões */
  totalSessions: number;
  /** Média de mensagens por sessão */
  avgMessagesPerSession: number;
  /** Documentos indexados na base de conhecimento */
  totalDocuments: number;
}
