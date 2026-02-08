'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Trash2 } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatError } from './ChatError';

/**
 * Widget de chat flutuante com IA
 */
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, clearChat } =
    useChat();

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    trackEvent(AnalyticsEvents.CHAT_ABERTO as unknown as string);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    trackEvent('chat_fechado');
  }, []);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      // Criar evento sintético para enviar sugestão
      const syntheticEvent = {
        target: { value: suggestion },
      } as React.ChangeEvent<HTMLTextAreaElement>;
      handleInputChange(syntheticEvent);

      // Enviar após pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => handleSubmit(), 50);
    },
    [handleInputChange, handleSubmit]
  );

  const unreadCount = 0; // Implementar contador de mensagens não lidas

  return (
    <>
      {/* Botão Flutuante */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-accent-primary hover:bg-accent-secondary rounded-full flex items-center justify-center shadow-2xl shadow-accent-primary/30 transition-colors"
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-6 h-6 text-white" />

          {/* Badge de notificação */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </motion.button>
      )}

      {/* Modal do Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] bg-dark-bg-secondary rounded-2xl border-2 border-dashed border-accent-primary/30 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-gray/10 bg-dark-bg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-white text-sm">Chat com IA</h3>
                  <p className="text-xs text-neutral-gray">28Web Connect</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Limpar chat */}
                <button
                  onClick={clearChat}
                  className="w-8 h-8 hover:bg-neutral-gray/10 rounded-lg flex items-center justify-center text-neutral-gray hover:text-red-400 transition-colors"
                  title="Limpar chat"
                  aria-label="Limpar chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Fechar */}
                <button
                  onClick={handleClose}
                  className="w-8 h-8 hover:bg-neutral-gray/10 rounded-lg flex items-center justify-center text-neutral-gray hover:text-neutral-white transition-colors"
                  aria-label="Fechar chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mensagens */}
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              onSuggestionClick={handleSuggestionClick}
            />

            {/* Erro */}
            {error && <ChatError error={error.message} />}

            {/* Input */}
            <ChatInput
              input={input}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              disabled={!!error}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
