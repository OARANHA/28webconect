'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminClientWithHistory } from '@/types/admin-client';
import { ClientHistory } from '@/components/admin/ClientHistory';
import { formatDate, formatPhoneNumber } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-shadcn';
import Button from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Building2,
  Phone,
  Mail,
  Calendar,
  Clock,
  Power,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientHistoryClientProps {
  client: AdminClientWithHistory;
}

/**
 * Client Component do Histórico do Cliente
 * Exibe informações detalhadas e histórico em tabs
 * Chama API routes para operações (não importa server actions diretamente)
 */
export default function ClientHistoryClient({ client }: ClientHistoryClientProps) {
  const router = useRouter();
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [deactivateSuccess, setDeactivateSuccess] = useState(false);

  const isActive = client.emailVerified !== null;

  // Calcular projetos ativos
  const activeProjectsCount = client.projects.filter(
    (p) => p.status === 'ATIVO' || p.status === 'AGUARDANDO_APROVACAO'
  ).length;

  // Desativar cliente via API route
  const handleDeactivate = async () => {
    setIsDeactivating(true);
    setDeactivateError(null);

    try {
      const response = await fetch(`/api/admin/clients/${client.id}/deactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setDeactivateSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setDeactivateError(result.error || 'Erro ao desativar cliente');
      }
    } catch (error) {
      setDeactivateError('Erro ao desativar cliente. Tente novamente.');
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informações do Cliente */}
      <Card className="bg-dark-bg-secondary border-neutral-gray/10">
        <CardHeader>
          <CardTitle className="text-lg text-neutral-white flex items-center gap-2">
            <User className="w-5 h-5 text-accent-primary" />
            Informações do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Nome */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-gray">Nome</p>
                <p className="font-medium text-neutral-white">{client.name || 'Não informado'}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-gray">Email</p>
                <p className="font-medium text-neutral-white">{client.email}</p>
              </div>
            </div>

            {/* Empresa */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-gray">Empresa</p>
                <p className="font-medium text-neutral-white">
                  {client.company || 'Não informada'}
                </p>
              </div>
            </div>

            {/* Telefone */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-gray">Telefone</p>
                <p className="font-medium text-neutral-white">
                  {client.phone ? formatPhoneNumber(client.phone) : 'Não informado'}
                </p>
              </div>
            </div>

            {/* Data de Cadastro */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-gray">Data de Cadastro</p>
                <p className="font-medium text-neutral-white">{formatDate(client.createdAt)}</p>
              </div>
            </div>

            {/* Último Login */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-gray">Último Acesso</p>
                <p className="font-medium text-neutral-white">
                  {client.lastLoginAt ? formatDate(client.lastLoginAt) : 'Nunca'}
                </p>
              </div>
            </div>
          </div>

          {/* Botão de Desativar */}
          {isActive && (
            <div className="mt-6 pt-6 border-t border-neutral-gray/10">
              <Button
                variant="primary"
                onClick={() => setIsDeactivateDialogOpen(true)}
                disabled={activeProjectsCount > 0}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Power className="w-4 h-4 mr-2" />
                Desativar Cliente
              </Button>
              {activeProjectsCount > 0 && (
                <p className="text-sm text-amber-400 mt-2">
                  Este cliente possui {activeProjectsCount} projeto(s) ativo(s). Conclua ou cancele
                  os projetos antes de desativar.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico em Tabs */}
      <Card className="bg-dark-bg-secondary border-neutral-gray/10">
        <CardContent className="p-6">
          <ClientHistory client={client} />
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Desativação */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <DialogContent className="bg-dark-bg-secondary border-neutral-gray/10 text-neutral-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Confirmar Desativação
            </DialogTitle>
            <DialogDescription className="text-neutral-gray">
              Tem certeza que deseja desativar o cliente{' '}
              <span className="text-neutral-white font-medium">{client.name || client.email}</span>?
              Esta ação irá bloquear o acesso do cliente à plataforma.
            </DialogDescription>
          </DialogHeader>

          {deactivateError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              <XCircle className="w-5 h-5" />
              <p className="text-sm">{deactivateError}</p>
            </div>
          )}

          {deactivateSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm">Cliente desativado com sucesso!</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeactivateDialogOpen(false)}
              disabled={isDeactivating}
              className="border-neutral-gray/20 text-neutral-white hover:bg-dark-bg-primary"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeactivate}
              disabled={isDeactivating || deactivateSuccess}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {isDeactivating ? 'Desativando...' : 'Sim, Desativar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
