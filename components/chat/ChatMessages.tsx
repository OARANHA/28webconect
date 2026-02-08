'use client';

import { useRef, useEffect, useCallback, memo } from 'react';
import { User, Bot } from 'lucide-react';
import type { Message } from '@/types/chat';
import { TypingIndicator } from './TypingIndicator';
import { ChatEmpty } from './ChatEmpty';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onSuggestionClick?: (suggestion: string) => void;
}

/**
 * Formata timestamp relativo
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Componente individual de mensagem
 */
const MessageBubble = memo(function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-slide-up`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-accent-primary/20 text-accent-primary'
            : 'bg-neutral-gray/20 text-neutral-gray'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block text-left px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-accent-primary/20 text-neutral-white border border-accent-primary/30'
              : 'bg-dark-bg text-neutral-white border border-neutral-gray/10'
          }`}
        >
          {message.content}
        </div>
        <div className="mt-1 text-xs text-neutral-gray/50">{formatTime(message.createdAt)}</div>
      </div>
    </div>
  );
});

/**
 * Lista de mensagens do chat com auto-scroll
 */
export const ChatMessages = memo(function ChatMessages({
  messages,
  isLoading,
  onSuggestionClick,
}: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Verificar se está no estado vazio
  if (messages.length === 0) {
    return <ChatEmpty onSuggestionClick={onSuggestionClick} />;
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <TypingIndicator />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
});
