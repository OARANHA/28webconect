import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/types';
import { getClientById } from '@/app/actions/admin-clients';
import ClientHistoryClient from './ClientHistoryClient';
import { User, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface ClientHistoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Gera metadata dinâmica baseada no cliente
 */
export async function generateMetadata({ params }: ClientHistoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getClientById(id);

  if (!result.success || !result.data) {
    return {
      title: 'Cliente não encontrado | Admin',
    };
  }

  const client = result.data;
  return {
    title: `${client.name || client.email} | Histórico do Cliente`,
    description: `Histórico completo de briefings, projetos e atividades de ${client.name || client.email}`,
  };
}

/**
 * Página de Histórico do Cliente
 * Server Component protegido por role (ADMIN ou SUPER_ADMIN)
 * Exibe informações detalhadas do cliente com histórico completo
 */
export default async function ClientHistoryPage({ params }: ClientHistoryPageProps) {
  // Proteção de rota - apenas admins podem acessar
  await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const { id } = await params;

  // Buscar cliente
  const result = await getClientById(id);

  // Se não encontrar, mostrar 404
  if (!result.success || !result.data) {
    notFound();
  }

  const client = result.data;
  const isActive = client.emailVerified !== null;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header com navegação */}
      <div className="mb-8">
        <Link href="/admin/clientes">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 text-neutral-gray hover:text-neutral-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para lista
          </Button>
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center p-2 bg-accent-primary/10 rounded-lg">
              <User className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-neutral-white">
                  {client.name || 'Sem nome'}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className="text-neutral-gray">{client.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta informativo */}
      <div className="mb-8 p-4 bg-accent-primary/5 border border-accent-primary/20 rounded-lg flex items-start gap-3">
        <Shield className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-neutral-white">Histórico Completo</h3>
          <p className="text-sm text-neutral-gray mt-1">
            Visualize todas as atividades do cliente: briefings enviados, projetos em andamento,
            comentários e arquivos. Use as abas para navegar entre as seções.
          </p>
        </div>
      </div>

      {/* Client Component com dados do cliente */}
      <ClientHistoryClient client={client} />
    </div>
  );
}
