'use client';

import { useEffect, useCallback, useState } from 'react';
import { useChat as useVercelChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useSession } from 'next-auth/react';
import { createId } from '@paralleldrive/cuid2';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import type { Message } from '@/types/chat';
import type { UIMessage } from '@ai-sdk/react';

interface UseChatReturn {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  isLoading: boolean;
  error: Error | undefined;
  clearChat: () => void;
  sessionId: string | null;
}

const STORAGE_KEY = 'chat-session-id';
const MESSAGES_STORAGE_KEY = 'chat-messages';

/**
 * Converte UIMessage do Vercel AI SDK para Message do projeto
 */
function uiMessageToMessage(uiMessage: UIMessage): Message {
  // Extrair conteúdo das parts
  let content = '';
  if (uiMessage.parts) {
    for (const part of uiMessage.parts) {
      if (part.type === 'text') {
        content += part.text;
      }
    }
  }

  return {
    id: uiMessage.id,
    role: uiMessage.role as 'user' | 'assistant' | 'system',
    content,
    createdAt: new Date(),
  };
}

/**
 * Converte Message do projeto para UIMessage do Vercel AI SDK
 */
function messageToUIMessage(message: Message): UIMessage {
  return {
    id: message.id,
    role: message.role,
    parts: [{ type: 'text', text: message.content }],
  };
}

/**
 * Hook customizado para gerenciar o chat com RAG
 * Usa Vercel AI SDK useChat para streaming de respostas
 */
export function useChat(): UseChatReturn {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);

  // Carregar dados do localStorage no mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedSessionId = localStorage.getItem(STORAGE_KEY);
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = createId();
      setSessionId(newSessionId);
      localStorage.setItem(STORAGE_KEY, newSessionId);
    }

    const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages);
        setInitialMessages(
          parsed.map((m: Message) =>
            messageToUIMessage({
              ...m,
              createdAt: new Date(m.createdAt),
            })
          )
        );
      } catch {
        // Ignora erro de parse
      }
    }
  }, []);

  // Usar Vercel AI SDK useChat com guards para sessionId e userId
  const {
    messages: uiMessages,
    sendMessage,
    status,
    error,
    setMessages,
    stop,
  } = useVercelChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        sessionId: sessionId || '',
        userId: userId || null,
      },
    }),
    onFinish: ({ message }) => {
      trackEvent(AnalyticsEvents.CHAT_MENSAGEM_ENVIADA as unknown as string);
    },
  });

  // Carregar mensagens iniciais após o mount
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, setMessages]);

  // Converter UIMessages para Messages para compatibilidade com componentes existentes
  const messages: Message[] = uiMessages.map(uiMessageToMessage);

  // Persistir mensagens no localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (messages.length > 0) {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  /**
   * Atualiza o input
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  /**
   * Envia mensagem para a API
   */
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim()) return;

      sendMessage({ text: input });
      setInput('');
    },
    [input, sendMessage]
  );

  /**
   * Limpa o chat e cria nova sessão
   */
  const clearChat = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MESSAGES_STORAGE_KEY);
    setMessages([]);
    const newSessionId = createId();
    setSessionId(newSessionId);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newSessionId);
    }
  }, [setMessages]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: status === 'submitted' || status === 'streaming',
    error,
    clearChat,
    sessionId,
  };
}
