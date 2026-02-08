'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ChevronDown, LogOut, Menu, Settings, X } from 'lucide-react';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import NotificationBell from './NotificationBell';

interface TopbarProps {
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

/**
 * Gera iniciais do nome do usuário
 */
function getInitials(name: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Formata o pathname para breadcrumb
 */
function formatBreadcrumb(pathname: string): string {
  if (pathname === '/dashboard') return 'Dashboard';

  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  // Mapeamento de rotas para labels
  const routeLabels: Record<string, string> = {
    projetos: 'Projetos',
    briefing: 'Briefing',
    configuracoes: 'Configurações',
    admin: 'Administração',
  };

  return routeLabels[lastSegment] || lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
}

/**
 * Topbar do Dashboard - Client Component
 * Exibe informações do usuário, notificações e botão de menu mobile
 */
export default function Topbar({ isMobileMenuOpen, onMobileMenuToggle }: TopbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user;

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    // Debounce de 100ms
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const breadcrumb = formatBreadcrumb(pathname);
  const initials = getInitials(user?.name || null);
  const displayName = user?.name || 'Usuário';
  const userRole = user?.role as UserRole | undefined;

  return (
    <header className="h-16 bg-dark-bg-secondary border-b border-neutral-gray/10 flex items-center justify-between px-4 md:px-6">
      {/* Lado esquerdo - Breadcrumb e toggle mobile */}
      <div className="flex items-center gap-4">
        {/* Botão hamburger unificado */}
        <button
          onClick={onMobileMenuToggle}
          className={cn(
            'md:hidden p-2 rounded-lg transition-all duration-200',
            'bg-transparent hover:bg-neutral-gray/10',
            'text-neutral-white'
          )}
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <div className="relative w-6 h-6">
            {/* Ícone Menu */}
            <Menu
              className={cn(
                'w-6 h-6 absolute inset-0 transition-all duration-200',
                isMobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
              )}
            />
            {/* Ícone X */}
            <X
              className={cn(
                'w-6 h-6 absolute inset-0 transition-all duration-200',
                isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
              )}
            />
          </div>
        </button>

        <h1 className="text-lg md:text-xl font-semibold text-neutral-white">{breadcrumb}</h1>
      </div>

      {/* Lado direito - Notificações e usuário */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Notificações */}
        <NotificationBell />

        {/* Dropdown de usuário */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              'flex items-center gap-3 px-2 py-1.5 rounded-lg transition-colors',
              'hover:bg-neutral-gray/10',
              isDropdownOpen && 'bg-neutral-gray/10'
            )}
          >
            {/* Avatar */}
            <div className="w-8 h-8 md:w-9 md:h-9 bg-accent-primary rounded-full flex items-center justify-center text-white font-medium text-sm">
              {initials}
            </div>

            {/* Info - oculto em mobile */}
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-neutral-white leading-tight">{displayName}</p>
              <p className="text-xs text-neutral-gray leading-tight truncate max-w-[150px]">
                {user?.email}
              </p>
            </div>

            <ChevronDown
              className={cn(
                'w-4 h-4 text-neutral-gray transition-transform hidden md:block',
                isDropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Menu dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-dark-bg-secondary border border-neutral-gray/10 rounded-lg shadow-lg py-2 z-50">
              {/* Header do dropdown */}
              <div className="px-4 py-3 border-b border-neutral-gray/10 md:hidden">
                <p className="text-sm font-medium text-neutral-white">{displayName}</p>
                <p className="text-xs text-neutral-gray truncate">{user?.email}</p>
              </div>

              {/* Role badge */}
              <div className="px-4 py-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-primary/20 text-accent-primary">
                  {userRole}
                </span>
              </div>

              <div className="border-t border-neutral-gray/10 my-1" />

              {/* Links */}
              <Link
                href="/configuracoes"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-neutral-gray hover:text-neutral-white hover:bg-neutral-gray/10 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Configurações</span>
              </Link>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  signOut({ callbackUrl: '/login' });
                }}
                className="flex items-center gap-3 px-4 py-2 w-full text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
