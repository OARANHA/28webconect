import { Metadata } from 'next';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@prisma/client';
import DataRetentionClient from './DataRetentionClient';

export const metadata: Metadata = {
  title: 'Retenção de Dados | Admin - 28Web Connect',
  description: 'Gerenciamento de políticas de retenção de dados LGPD',
};

export default async function DataRetentionPage() {
  await requireRole([UserRole.SUPER_ADMIN]);

  return <DataRetentionClient />;
}
