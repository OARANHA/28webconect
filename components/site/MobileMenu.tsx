'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  navLinks: NavLink[];
}

/**
 * Menu Mobile com animações CSS puras
 * Substitui o AnimatePresence do framer-motion por transições CSS
 * para reduzir o bundle inicial
 */
export default function MobileMenu({ navLinks }: MobileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Botão Hamburger */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 text-neutral-light hover:text-accent-primary transition-colors"
        aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={isMenuOpen}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Menu Mobile com CSS transitions */}
      <div
        className={`
          md:hidden absolute left-0 right-0 top-full
          bg-dark-bg-secondary border-t border-neutral-gray/10
          transition-all duration-300 ease-in-out overflow-hidden
          ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <nav className="px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="block text-neutral-light hover:text-accent-primary transition-colors py-2 font-medium"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-neutral-gray/10 space-y-3">
            <Link href="/login" onClick={closeMenu}>
              <Button variant="ghost" size="md" className="w-full">
                Login
              </Button>
            </Link>
            <Link href="/cadastro" onClick={closeMenu}>
              <Button variant="primary" size="md" className="w-full">
                Cadastro
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
