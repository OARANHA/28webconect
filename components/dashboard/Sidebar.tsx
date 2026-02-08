'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  DollarSign,
  Settings,
  Shield,
  LogOut,
  Users,
  BarChart3,
  Brain,
  Database,
} from 'lucide-react';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresRole?: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Projetos',
    href: '/projetos',
    icon: FolderKanban,
  },
  {
    label: 'Briefing',
    href: '/briefing',
    icon: FileText,
  },
  {
    label: 'Preços',
    href: '/precos',
    icon: DollarSign,
  },
  {
    label: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
  },
];

const adminItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    requiresRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Clientes',
    href: '/admin/clientes',
    icon: Users,
    requiresRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Briefings',
    href: '/admin/briefings',
    icon: FileText,
    requiresRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Projetos',
    href: '/admin/projetos',
    icon: FolderKanban,
    requiresRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Preços',
    href: '/admin/precos',
    icon: DollarSign,
    requiresRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Base de Conhecimento',
    href: '/admin/base-conhecimento',
    icon: Brain,
    requiresRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Retenção de Dados',
    href: '/admin/retencao-dados',
    icon: Database,
    requiresRole: [UserRole.SUPER_ADMIN],
  },
];

/**
 * Sidebar do Dashboard - Client Component
 * Navegação fixa com controle de visibilidade baseado em role
 */
export default function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role as UserRole | undefined;

  // Verifica se usuário pode ver itens de admin
  const canSeeAdmin = userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;

  // Combina itens de navegação
  const allNavItems = canSeeAdmin ? [...navItems, ...adminItems] : navItems;

  return (
    <>
      {/* Overlay mobile */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-40',
          'w-64 bg-dark-bg-secondary border-r border-neutral-gray/10',
          'flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          'md:transform-none',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-expanded={isMobileOpen}
      >
        {/* Logo */}
        <div className="p-4 border-b border-neutral-gray/10">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onMobileClose}>
            <Image
              src="/assets/28connect.jpg"
              alt="28Web Connect"
              width={40}
              height={40}
              className="rounded-lg"
              sizes="40px"
            />
            <span className="font-bold text-neutral-white text-lg">28Web Connect</span>
          </Link>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-1">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={item.href === '/dashboard' ? true : false}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  'text-neutral-gray hover:text-neutral-white hover:bg-accent-primary/10',
                  isActive && 'bg-accent-primary/20 text-neutral-white'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Botão Sair */}
        <div className="p-4 border-t border-neutral-gray/10">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={cn(
              'flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors',
              'text-neutral-gray hover:text-red-400 hover:bg-red-500/10'
            )}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
