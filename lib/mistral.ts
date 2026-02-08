import { Mistral } from '@mistralai/mistralai';
import { createMistral } from '@ai-sdk/mistral';
import { createGroq } from '@ai-sdk/groq';
import { LanguageModel } from 'ai';

// Constantes
export const EMBEDDING_MODEL = 'mistral-embed';
export const CHAT_MODEL = 'mistral-large-latest';
export const GROQ_CHAT_MODEL = 'mixtral-8x7b-32768';
export const GROQ_FALLBACK_MODEL = 'llama2-70b-4096';
export const EMBEDDING_DIMENSIONS = 1536;

/**
 * Valida se uma variável de ambiente existe
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não configurada`);
  }
  return value;
}

// Cliente Mistral para embeddings e chat
let mistralClient: Mistral | null = null;

export function getMistralClient(): Mistral {
  if (!mistralClient) {
    const apiKey = requireEnv('MISTRAL_API_KEY');
    mistralClient = new Mistral({ apiKey });
  }
  return mistralClient;
}

// Provider Mistral para Vercel AI SDK
let mistralProvider: ReturnType<typeof createMistral> | null = null;

export function getMistralProvider() {
  if (!mistralProvider) {
    const apiKey = requireEnv('MISTRAL_API_KEY');
    mistralProvider = createMistral({ apiKey });
  }
  return mistralProvider;
}

// Provider Groq para Vercel AI SDK
let groqProvider: ReturnType<typeof createGroq> | null = null;

export function getGroqProvider() {
  if (!groqProvider) {
    const apiKey = requireEnv('GROQ_API_KEY');
    groqProvider = createGroq({ apiKey });
  }
  return groqProvider;
}

// Modelos de chat
let mistralChatModel: LanguageModel | null = null;
let groqChatModel: LanguageModel | null = null;
let groqFallbackModel: LanguageModel | null = null;

/**
 * Retorna modelo de chat Mistral
 */
export function getMistralChatModel(): LanguageModel {
  if (!mistralChatModel) {
    const provider = getMistralProvider();
    mistralChatModel = provider(CHAT_MODEL);
  }
  return mistralChatModel;
}

/**
 * Retorna modelo de chat Groq (padrão - mais rápido)
 */
export function getGroqChatModel(): LanguageModel {
  if (!groqChatModel) {
    const provider = getGroqProvider();
    groqChatModel = provider(GROQ_CHAT_MODEL);
  }
  return groqChatModel;
}

/**
 * Retorna modelo fallback do Groq
 */
export function getGroqFallbackModel(): LanguageModel {
  if (!groqFallbackModel) {
    const provider = getGroqProvider();
    groqFallbackModel = provider(GROQ_FALLBACK_MODEL);
  }
  return groqFallbackModel;
}

export type ChatProvider = 'mistral' | 'groq';

/**
 * Seleciona e retorna o modelo de chat apropriado
 * @param provider Provedor preferencial ('mistral' ou 'groq')
 * @param useFallback Se true, usa modelo fallback do Groq
 * @returns Modelo de chat configurado
 */
export function selectChatModel(
  provider: ChatProvider = 'groq',
  useFallback: boolean = false
): LanguageModel {
  try {
    if (provider === 'groq') {
      if (useFallback) {
        return getGroqFallbackModel();
      }
      return getGroqChatModel();
    }
    return getMistralChatModel();
  } catch (error) {
    // Fallback automático para Mistral se Groq falhar
    if (provider === 'groq') {
      console.warn('Groq indisponível, usando Mistral como fallback');
      return getMistralChatModel();
    }
    throw error;
  }
}

/**
 * Tenta executar com Groq e faz fallback para Mistral se falhar
 * @param operation Função assíncrona que usa o modelo
 * @returns Resultado da operação
 */
export async function withChatFallback<T>(
  operation: (model: LanguageModel) => Promise<T>
): Promise<T> {
  try {
    const groqModel = getGroqChatModel();
    return await operation(groqModel);
  } catch (error) {
    console.warn('Erro no Groq, tentando Mistral:', error);
    const mistralModel = getMistralChatModel();
    return await operation(mistralModel);
  }
}

/**
 * Verifica status das APIs configuradas
 * @returns Status de cada serviço
 */
export function checkApiStatus(): {
  mistral: boolean;
  groq: boolean;
  mistralKeyConfigured: boolean;
  groqKeyConfigured: boolean;
} {
  return {
    mistral: !!process.env.MISTRAL_API_KEY,
    groq: !!process.env.GROQ_API_KEY,
    mistralKeyConfigured: !!process.env.MISTRAL_API_KEY && process.env.MISTRAL_API_KEY.length > 10,
    groqKeyConfigured: !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 10,
  };
}
