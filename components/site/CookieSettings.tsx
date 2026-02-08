'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Cookie, BarChart3, Zap, Lock } from 'lucide-react';
import { setCookieConsent, getCurrentPreferences, type CookiePreferences } from '@/lib/cookies';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const COOKIE_CATEGORIES = {
  essenciais: {
    name: 'Essenciais',
    description: 'Necessários para o funcionamento do site',
    required: true,
  },
  analytics: { name: 'Analytics', description: 'Ajuda a entender o uso do site', required: false },
  funcionais: {
    name: 'Funcionais',
    description: 'Melhoram a experiência do usuário',
    required: false,
  },
} as const;

type CookieCategoryKey = keyof typeof COOKIE_CATEGORIES;

interface CookieSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * Toggle switch component
 */
function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        'relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-bg',
        checked ? 'bg-accent-primary' : 'bg-neutral-gray/30',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-checked={checked}
      role="switch"
      tabIndex={disabled ? -1 : 0}
    >
      <motion.span
        animate={{ x: checked ? 28 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
      >
        {checked && <Check className="w-3 h-3 text-accent-primary" />}
      </motion.span>
    </button>
  );
}

/**
 * Modal de configurações de cookies
 */
export default function CookieSettings({ isOpen, onClose }: CookieSettingsProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essenciais: true,
    analytics: false,
    funcionais: false,
    timestamp: 0,
  });

  // Refs para focus trap
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Carregar preferências atuais ao abrir
  useEffect(() => {
    if (isOpen) {
      const current = getCurrentPreferences();
      setPreferences(current);
      // Salvar elemento focado anteriormente
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Fechar com ESC e focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Fechar com ESC
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap com Tab
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevenir scroll do body quando modal aberto e setar foco inicial
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focar no botão de fechar quando abrir (para acessibilidade)
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
      // Restaurar foco ao fechar
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Obter todos os elementos focáveis dentro do modal
  const getFocusableElements = (): HTMLElement[] => {
    if (!modalRef.current) return [];

    const selector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(modalRef.current.querySelectorAll(selector));
  };

  const handleSave = useCallback(() => {
    setCookieConsent({
      essenciais: preferences.essenciais,
      analytics: preferences.analytics,
      funcionais: preferences.funcionais,
    });
    onClose();
    // Recarregar para aplicar mudanças
    window.location.reload();
  }, [preferences, onClose]);

  const categoryIcons = {
    essenciais: <Lock className="w-6 h-6" />,
    analytics: <BarChart3 className="w-6 h-6" />,
    funcionais: <Zap className="w-6 h-6" />,
  };

  const categoryKeys = Object.keys(COOKIE_CATEGORIES) as CookieCategoryKey[];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto focus:outline-none"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
          >
            <Card variant="default" className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent-primary/20 rounded-xl flex items-center justify-center text-accent-primary">
                    <Cookie className="w-6 h-6" />
                  </div>
                  <div>
                    <h2
                      id="cookie-settings-title"
                      className="text-2xl font-bold text-neutral-white"
                    >
                      Configurações de Cookies
                    </h2>
                    <p className="text-sm text-neutral-gray">
                      Gerencie suas preferências de privacidade
                    </p>
                  </div>
                </div>
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className="p-2 text-neutral-gray hover:text-neutral-white transition-colors rounded-lg hover:bg-neutral-gray/10 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-dark-bg"
                  aria-label="Fechar configurações de cookies"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Description */}
              <p className="text-neutral-gray mb-6">
                Você pode escolher quais categorias de cookies deseja permitir. Cookies essenciais
                são necessários para o funcionamento do site e não podem ser desativados.
              </p>

              {/* Cookie Categories */}
              <div className="space-y-4 mb-8">
                {categoryKeys.map((key) => {
                  const category = COOKIE_CATEGORIES[key];
                  const isChecked = (preferences as CookiePreferences)[key];
                  const isRequired = category.required;

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Card
                        variant={isRequired ? 'dashed' : 'default'}
                        className={cn(
                          'p-4 transition-all duration-200',
                          isRequired && 'border-accent-primary/30'
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                                isRequired
                                  ? 'bg-accent-primary/20 text-accent-primary'
                                  : 'bg-neutral-gray/10 text-neutral-gray'
                              )}
                            >
                              {(categoryIcons as Record<CookieCategoryKey, React.ReactNode>)[key]}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-neutral-white">
                                  {category.name}
                                </h3>
                                {isRequired && (
                                  <span className="text-xs bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded-full">
                                    Obrigatório
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-neutral-gray">{category.description}</p>
                            </div>
                          </div>
                          <Toggle
                            checked={isChecked}
                            onChange={(checked) => {
                              setPreferences((prev: CookiePreferences) => ({
                                ...prev,
                                [key]: checked,
                              }));
                            }}
                            disabled={isRequired}
                          />
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-neutral-gray/10">
                <Button variant="ghost" size="md" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSave}
                  className="flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Salvar Preferências
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
