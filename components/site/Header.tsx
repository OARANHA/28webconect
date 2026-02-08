'use client';

import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import MobileMenu from './MobileMenu';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/servicos', label: 'Serviços' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/blog', label: 'Blog' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contato', label: 'Contato' },
];

/**
 * Header fixo com navegação responsiva
 * Menu mobile extraído para componente separado com CSS transitions
 * Remove dependência de framer-motion para bundle menor
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-neutral-gray/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/28connect.jpg"
              alt="28Web Connect"
              width={40}
              height={40}
              className="rounded-lg"
              priority
              sizes="40px"
            />
            <span className="text-lg font-bold text-neutral-white hidden sm:block">
              28Web Connect
            </span>
          </Link>

          {/* Navegação Desktop - sem prefetch em links de navegação */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className="text-neutral-light hover:text-accent-primary transition-colors duration-200 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Botões de Ação Desktop - prefetch ativado para CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" prefetch={false}>
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/cadastro" prefetch={true}>
              <Button variant="primary" size="sm">
                Cadastro
              </Button>
            </Link>
          </div>

          {/* Menu Mobile - Componente separado com CSS transitions */}
          <div className="md:hidden">
            <MobileMenu navLinks={navLinks} />
          </div>
        </div>
      </div>
    </header>
  );
}
