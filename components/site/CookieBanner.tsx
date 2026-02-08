'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { hasUserConsented, acceptAllCookies } from '@/lib/cookies';
import { onOpenCookieSettings, onShowCookieBanner } from '@/lib/cookie-events';
import Button from '@/components/ui/Button';
import CookieSettings from './CookieSettings';

/**
 * Banner de consentimento de cookies fixo na parte inferior da tela
 */
export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Verificar se usuário já consentiu
    const hasConsented = hasUserConsented();
    if (!hasConsented) {
      // Pequeno delay para não mostrar imediatamente ao carregar
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Escutar eventos globais para abrir configurações ou mostrar banner
  useEffect(() => {
    const unsubscribeSettings = onOpenCookieSettings(() => {
      setIsSettingsOpen(true);
    });

    const unsubscribeBanner = onShowCookieBanner(() => {
      setIsVisible(true);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeBanner();
    };
  }, []);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setIsVisible(false);
    // Recarregar para aplicar scripts (analytics, etc)
    window.location.reload();
  };

  const handleConfigure = () => {
    setIsSettingsOpen(true);
  };

  const handleClose = () => {
    setIsVisible(false);
    // Banner reaparecerá na próxima visita se não consentir
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div className="bg-dark-bg-secondary border-t-2 border-accent-primary/30 shadow-2xl">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Text */}
                  <div className="flex-1 pr-4">
                    <p className="text-sm md:text-base text-neutral-gray">
                      Usamos cookies para melhorar sua experiência.{' '}
                      <strong className="text-neutral-white">Cookies essenciais</strong> são
                      necessários para o funcionamento do site. Você pode aceitar todos ou{' '}
                      <button
                        onClick={handleConfigure}
                        className="text-accent-primary hover:text-accent-secondary underline"
                      >
                        configurar suas preferências
                      </button>
                      .
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAcceptAll}
                      className="whitespace-nowrap"
                    >
                      Aceitar Todos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleConfigure}
                      className="whitespace-nowrap"
                    >
                      Configurar
                    </Button>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 md:static p-2 text-neutral-gray hover:text-neutral-white transition-colors"
                    aria-label="Fechar banner"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <CookieSettings
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          // Se usuário salvou preferências, esconder banner
          if (hasUserConsented()) {
            setIsVisible(false);
          }
        }}
      />
    </>
  );
}
