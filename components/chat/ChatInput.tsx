'use client';

import { useRef, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const MAX_LENGTH = 1000;

/**
 * Componente de input para o chat com auto-resize
 */
export function ChatInput({ input, onInputChange, onSubmit, isLoading, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (newValue.length <= MAX_LENGTH) {
        onInputChange(e);

        // Auto-resize
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.style.height = 'auto';
          const newHeight = Math.min(textarea.scrollHeight, 120); // Max 5 lines
          textarea.style.height = `${newHeight}px`;
        }
      }
    },
    [onInputChange]
  );

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim() || isLoading || disabled) return;

      onSubmit(e);

      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    },
    [input, onSubmit, isLoading, disabled]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const charCount = input.length;

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-end gap-2 p-4 border-t border-neutral-gray/10"
    >
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          disabled={disabled || isLoading}
          rows={1}
          className="w-full bg-dark-bg border-2 border-neutral-gray/20 rounded-xl px-4 py-3 pr-12 text-sm text-neutral-white placeholder:text-neutral-gray/50 focus:outline-none focus:border-accent-primary resize-none transition-colors min-h-[48px] max-h-[120px]"
          style={{ overflow: 'hidden' }}
        />
        <span
          className={`absolute bottom-2 right-3 text-xs transition-colors ${
            charCount > MAX_LENGTH * 0.9 ? 'text-red-400' : 'text-neutral-gray/50'
          }`}
        >
          {charCount}/{MAX_LENGTH}
        </span>
      </div>

      <button
        type="submit"
        disabled={!input.trim() || isLoading || disabled}
        className="flex-shrink-0 w-10 h-10 bg-accent-primary hover:bg-accent-secondary disabled:bg-neutral-gray/30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
        aria-label="Enviar mensagem"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        ) : (
          <Send className="w-5 h-5 text-white" />
        )}
      </button>
    </form>
  );
}
