'use client';

import { MessageSquare, Sparkles, HelpCircle, Zap } from 'lucide-react';

interface ChatEmptyProps {
  onSuggestionClick?: (suggestion: string) => void;
}

const SUGGESTIONS = [
  {
    icon: Sparkles,
    text: 'Quais serviços vocês oferecem?',
  },
  {
    icon: HelpCircle,
    text: 'Como funciona o processo de desenvolvimento?',
  },
  {
    icon: Zap,
    text: 'Quanto custa um site com IA?',
  },
];

/**
 * Estado vazio do chat com sugestões de perguntas
 */
export function ChatEmpty({ onSuggestionClick }: ChatEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-16 h-16 bg-accent-primary/20 rounded-2xl flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-accent-primary" />
      </div>

      <h3 className="text-lg font-semibold text-neutral-white mb-2">
        Olá! Sou o assistente virtual da 28Web Connect
      </h3>

      <p className="text-sm text-neutral-gray mb-6 max-w-[280px]">
        Posso ajudar com informações sobre nossos serviços, processos de desenvolvimento e responder
        dúvidas frequentes.
      </p>

      <div className="w-full space-y-2">
        <p className="text-xs text-neutral-gray/70 mb-3">Sugestões de perguntas:</p>

        {SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick?.(suggestion.text)}
            className="w-full flex items-center gap-3 p-3 bg-dark-bg hover:bg-dark-bg-secondary border border-neutral-gray/10 hover:border-accent-primary/30 rounded-xl transition-all text-left group"
          >
            <suggestion.icon className="w-4 h-4 text-neutral-gray group-hover:text-accent-primary transition-colors flex-shrink-0" />
            <span className="text-sm text-neutral-gray group-hover:text-neutral-white transition-colors">
              {suggestion.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
