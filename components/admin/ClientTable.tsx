'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { AdminClientListItem, AdminClientFilters } from '@/types/admin-client';
import { ProjectStatus } from '@prisma/client';
import { formatDate, formatLastActivity } from '@/lib/utils';
import Input from '@/components/ui/InputComponent';
import Button from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Skeleton from '@/components/ui/Skeleton';
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientTableProps {
  clients: AdminClientListItem[];
  onFilterChange?: (filters: AdminClientFilters) => void | Promise<void>;
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 10;

/**
 * Tabela de clientes com filtros e paginação
 * Segue o padrão de BriefingTable.tsx
 */
export function ClientTable({ clients, onFilterChange, isLoading = false }: ClientTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  // Verificar se há filtros de data preenchidos
  const hasDateFilters = dateFrom || dateTo;

  // Aplicar filtros localmente apenas quando não há server-side filtering
  const filteredClients = useMemo(() => {
    // Se onFilterChange está disponível, não filtramos localmente (server-side filtering)
    if (onFilterChange) {
      return clients;
    }

    let result = [...clients];

    // Filtro por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (client) =>
          client.name?.toLowerCase().includes(term) ||
          client.email.toLowerCase().includes(term) ||
          client.company?.toLowerCase().includes(term)
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      result = result.filter((client) => {
        if (statusFilter === 'active') {
          return client.emailVerified !== null;
        }
        return client.emailVerified === null;
      });
    }

    // Filtro por data (local)
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      result = result.filter((client) => new Date(client.createdAt) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((client) => new Date(client.createdAt) <= toDate);
    }

    return result;
  }, [clients, searchTerm, statusFilter, dateFrom, dateTo, onFilterChange]);

  // Paginação
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredClients, currentPage]);

  // Aplicar filtros no servidor
  const applyServerFilters = useCallback(async () => {
    if (!onFilterChange) return;

    setIsApplyingFilters(true);
    try {
      const filters: AdminClientFilters = {};

      if (searchTerm) filters.searchTerm = searchTerm;
      if (statusFilter !== 'all') filters.status = statusFilter as 'active' | 'inactive';
      if (dateFrom) filters.dateFrom = new Date(dateFrom);
      if (dateTo) filters.dateTo = new Date(dateTo);

      await onFilterChange(filters);
    } finally {
      setIsApplyingFilters(false);
    }
  }, [onFilterChange, searchTerm, statusFilter, dateFrom, dateTo]);

  // Resetar página quando filtros mudam
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    setCurrentPage(1);
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    setCurrentPage(1);
  };

  // Debounced server filter application
  useEffect(() => {
    if (onFilterChange) {
      const timer = setTimeout(() => {
        applyServerFilters();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, statusFilter, dateFrom, dateTo, onFilterChange, applyServerFilters]);

  // Contar projetos ativos
  const getActiveProjectsCount = (client: AdminClientListItem) => {
    return (
      client.projects?.filter(
        (p) => p.status === ProjectStatus.ATIVO || p.status === ProjectStatus.AGUARDANDO_APROVACAO
      ).length || 0
    );
  };

  // Verificar se cliente está ativo
  const isClientActive = (client: AdminClientListItem) => {
    return client.emailVerified !== null;
  };

  // Skeleton loading
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="border rounded-lg">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (clients.length === 0) {
    return (
      <div className="text-center py-12 bg-dark-bg-secondary rounded-lg border border-dashed border-neutral-gray/20">
        <User className="w-12 h-12 text-neutral-gray mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-white mb-2">Nenhum cliente encontrado</h3>
        <p className="text-neutral-gray">Não há clientes cadastrados na plataforma.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray" />
            <Input
              placeholder="Buscar por nome, email ou empresa..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSearchChange(e.target.value)
              }
              className="pl-10 bg-dark-bg-primary border-neutral-gray/20 text-neutral-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-40 bg-dark-bg-primary border-neutral-gray/20 text-neutral-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-dark-bg-secondary border-neutral-gray/20">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtros de Data */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-4 h-4 text-neutral-gray shrink-0" />
            <span className="text-sm text-neutral-gray whitespace-nowrap">Cadastro:</span>
            <Input
              type="date"
              placeholder="De"
              value={dateFrom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleDateFromChange(e.target.value)
              }
              className="bg-dark-bg-primary border-neutral-gray/20 text-neutral-white"
            />
            <span className="text-neutral-gray">-</span>
            <Input
              type="date"
              placeholder="Até"
              value={dateTo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleDateToChange(e.target.value)
              }
              className="bg-dark-bg-primary border-neutral-gray/20 text-neutral-white"
            />
          </div>
          {isApplyingFilters && (
            <span className="text-sm text-neutral-gray self-center">Aplicando filtros...</span>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="border border-neutral-gray/10 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-dark-bg-secondary">
            <TableRow className="border-neutral-gray/10 hover:bg-transparent">
              <TableHead className="text-neutral-gray">Cliente</TableHead>
              <TableHead className="text-neutral-gray">Empresa</TableHead>
              <TableHead className="text-neutral-gray">Cadastro</TableHead>
              <TableHead className="text-neutral-gray">Último Acesso</TableHead>
              <TableHead className="text-neutral-gray text-center">Briefings</TableHead>
              <TableHead className="text-neutral-gray text-center">Projetos Ativos</TableHead>
              <TableHead className="text-neutral-gray text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-neutral-gray">
                  Nenhum cliente encontrado com os filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              paginatedClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="border-neutral-gray/10 hover:bg-accent-primary/5"
                >
                  {/* Cliente */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-accent-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-neutral-white">
                          {client.name || 'Sem nome'}
                        </div>
                        <div className="text-sm text-neutral-gray">{client.email}</div>
                        <div className="mt-1">
                          <Badge
                            variant={isClientActive(client) ? 'default' : 'secondary'}
                            className={cn(
                              'text-xs',
                              isClientActive(client)
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                            )}
                          >
                            {isClientActive(client) ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Empresa */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-neutral-gray" />
                      <span className="text-neutral-white">{client.company || '-'}</span>
                    </div>
                  </TableCell>

                  {/* Cadastro */}
                  <TableCell className="text-neutral-gray">
                    {formatDate(client.createdAt)}
                  </TableCell>

                  {/* Último Acesso */}
                  <TableCell className="text-neutral-gray">
                    {formatLastActivity(client.lastLoginAt)}
                  </TableCell>

                  {/* Briefings */}
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                      {client._count.briefings}
                    </span>
                  </TableCell>

                  {/* Projetos Ativos */}
                  <TableCell className="text-center">
                    <span
                      className={cn(
                        'inline-flex items-center justify-center w-8 h-8 rounded-full font-medium',
                        getActiveProjectsCount(client) > 0
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-gray-500/20 text-gray-400'
                      )}
                    >
                      {getActiveProjectsCount(client)}
                    </span>
                  </TableCell>

                  {/* Ações */}
                  <TableCell className="text-right">
                    <Link href={`/admin/clientes/${client.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-accent-primary hover:text-accent-primary hover:bg-accent-primary/10"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Histórico
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-gray">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredClients.length)} de{' '}
            {filteredClients.length} clientes
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-neutral-gray/20 text-neutral-white hover:bg-dark-bg-secondary disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-neutral-gray">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-neutral-gray/20 text-neutral-white hover:bg-dark-bg-secondary disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
