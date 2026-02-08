'use client';

import { UserRole } from '@prisma/client';
import { Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserRoleBadgeProps {
  role: UserRole;
  className?: string;
}

/**
 * Badge de role do usuário
 * Admin: laranja com ícone de escudo
 * Cliente: azul com ícone de usuário
 */
export default function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        isAdmin
          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
        className
      )}
    >
      {isAdmin ? (
        <>
          <Shield className="w-3 h-3" />
          Admin
        </>
      ) : (
        <>
          <User className="w-3 h-3" />
          Cliente
        </>
      )}
    </span>
  );
}
