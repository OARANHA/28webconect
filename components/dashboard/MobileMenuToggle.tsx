'use client';

import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileMenuToggleProps {
  onClick: () => void;
  isOpen: boolean;
}

/**
 * Botão de toggle para menu mobile
 * Alterna entre ícones Menu e X com animação
 */
export default function MobileMenuToggle({ onClick, isOpen }: MobileMenuToggleProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'md:hidden p-2 rounded-lg transition-all duration-200',
        'bg-transparent hover:bg-neutral-gray/10',
        'text-neutral-white'
      )}
      aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
      aria-expanded={isOpen}
    >
      <div className="relative w-6 h-6">
        {/* Ícone Menu */}
        <Menu
          className={cn(
            'w-6 h-6 absolute inset-0 transition-all duration-200',
            isOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
          )}
        />
        {/* Ícone X */}
        <X
          className={cn(
            'w-6 h-6 absolute inset-0 transition-all duration-200',
            isOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
          )}
        />
      </div>
    </button>
  );
}
