'use client';

import { useState, useMemo } from 'react';
import { BriefingListItem } from '@/types/admin-briefing';
import { BriefingStatus, ServiceType } from '@prisma/client';
import BriefingStatusBadge from './BriefingStatusBadge';
import Skeleton from '@/components/ui/Skeleton';
import { getServiceTypeLabel, getStatusLabel, formatBriefingDate } from '@/lib/briefing-utils';
import { Search, Filter, Calendar, Eye, FileText, X } from 'lucide-react';
import Link from 'next/link';

interface BriefingTableProps {
  briefings: BriefingListItem[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 10;

/**
 * Componente de tabela de briefings com filtros e paginação
 */
export default function BriefingTable({ briefings, isLoading = false }: BriefingTableProps) {
  // Estados de filtro
  const [statusFilter, setStatusFilter] = useState<BriefingStatus | 'ALL'>('ALL');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Aplicar filtros
  const filteredBriefings = useMemo(() => {
    return briefings.filter((briefing) => {
      // Filtro de status
      if (statusFilter !== 'ALL' && briefing.status !== statusFilter) {
        return false;
      }

      // Filtro de tipo de serviço
      if (serviceTypeFilter !== 'ALL' && briefing.serviceType !== serviceTypeFilter) {
        return false;
      }

      // Filtro de busca
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchSearch =
          briefing.companyName.toLowerCase().includes(search) ||
          briefing.user.name?.toLowerCase().includes(search) ||
          briefing.user.email.toLowerCase().includes(search) ||
          briefing.user.company?.toLowerCase().includes(search);

        if (!matchSearch) return false;
      }

      // Filtro de data - usando submittedAt (fallback para createdAt)
      const briefingDate = new Date(briefing.submittedAt || briefing.createdAt);

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (briefingDate < fromDate) return false;
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (briefingDate > toDate) return false;
      }

      return true;
    });
  }, [briefings, statusFilter, serviceTypeFilter, searchTerm, dateFrom, dateTo]);

  // Paginação
  const totalPages = Math.ceil(filteredBriefings.length / ITEMS_PER_PAGE);
  const paginatedBriefings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBriefings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBriefings, currentPage]);

  // Reset página quando filtros mudam
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Limpar filtros de data
  const clearDateFilters = () => {
    setDateFrom('');
    setDateTo('');
    handleFilterChange();
  };

  // Verificar se há filtros de data ativos
  const hasDateFilters = dateFrom || dateTo;

  if (isLoading) {
    return <BriefingTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col gap-4 p-4 bg-dark-bg-secondary rounded-xl border border-neutral-gray/10">
        {/* Linha 1: Busca, Status e Tipo de Serviço */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray" />
            <input
              type="text"
              placeholder="Buscar por cliente, email ou empresa..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleFilterChange();
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-neutral-gray/20 rounded-lg text-neutral-white placeholder-neutral-gray focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
            />
          </div>

          {/* Filtro de Status */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-gray" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as BriefingStatus | 'ALL');
                handleFilterChange();
              }}
              className="px-4 py-2.5 bg-dark-bg border border-neutral-gray/20 rounded-lg text-neutral-white focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
            >
              <option value="ALL">Todos os Status</option>
              {Object.values(BriefingStatus).map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Tipo de Serviço */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-gray" />
            <select
              value={serviceTypeFilter}
              onChange={(e) => {
                setServiceTypeFilter(e.target.value as ServiceType | 'ALL');
                handleFilterChange();
              }}
              className="px-4 py-2.5 bg-dark-bg border border-neutral-gray/20 rounded-lg text-neutral-white focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
            >
              <option value="ALL">Todos os Serviços</option>
              {Object.values(ServiceType).map((type) => (
                <option key={type} value={type}>
                  {getServiceTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Linha 2: Filtro de Data */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-neutral-gray/10">
          <div className="flex items-center gap-2 text-sm text-neutral-gray">
            <Calendar className="w-4 h-4" />
            <span>Período:</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-gray whitespace-nowrap">De:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  handleFilterChange();
                }}
                className="px-3 py-2 bg-dark-bg border border-neutral-gray/20 rounded-lg text-neutral-white text-sm focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-gray whitespace-nowrap">Até:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  handleFilterChange();
                }}
                className="px-3 py-2 bg-dark-bg border border-neutral-gray/20 rounded-lg text-neutral-white text-sm focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
              />
            </div>

            {hasDateFilters && (
              <button
                onClick={clearDateFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-neutral-gray hover:text-neutral-white hover:bg-neutral-gray/10 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Limpar datas
              </button>
            )}
          </div>

          {hasDateFilters && (
            <div className="text-sm text-neutral-gray">
              Filtrando por: {dateFrom && new Date(dateFrom).toLocaleDateString('pt-BR')}{' '}
              {dateFrom && dateTo && ' - '} {dateTo && new Date(dateTo).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-sm text-neutral-light">
        <span>
          {filteredBriefings.length} briefing{filteredBriefings.length !== 1 ? 's' : ''} encontrado
          {filteredBriefings.length !== 1 ? 's' : ''}
        </span>
        {filteredBriefings.length > 0 && (
          <span>
            Página {currentPage} de {totalPages}
          </span>
        )}
      </div>

      {/* Tabela */}
      {filteredBriefings.length === 0 ? (
        <BriefingEmptyState />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-gray/10">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-bg-secondary border-b border-neutral-gray/10">
                <th className="text-left px-4 py-3 text-sm font-semibold text-neutral-light">
                  Cliente
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-neutral-light">
                  Empresa
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-neutral-light">
                  Serviço
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-neutral-light">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-neutral-light">
                  Enviado em
                </th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-neutral-light">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-gray/10">
              {paginatedBriefings.map((briefing) => (
                <tr key={briefing.id} className="hover:bg-dark-bg-secondary/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-neutral-white">
                        {briefing.user.name || 'Sem nome'}
                      </span>
                      <span className="text-sm text-neutral-gray">{briefing.user.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-neutral-white">{briefing.companyName}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-neutral-light">
                      {getServiceTypeLabel(briefing.serviceType)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <BriefingStatusBadge status={briefing.status} />
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-neutral-light">
                      {formatBriefingDate(briefing.submittedAt || briefing.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/briefings/${briefing.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-accent-primary hover:text-accent-secondary bg-accent-primary/10 hover:bg-accent-primary/20 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-neutral-white bg-dark-bg-secondary border border-neutral-gray/20 rounded-lg hover:bg-neutral-gray/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                currentPage === page
                  ? 'bg-accent-primary text-white'
                  : 'bg-dark-bg-secondary text-neutral-white border border-neutral-gray/20 hover:bg-neutral-gray/10'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-neutral-white bg-dark-bg-secondary border border-neutral-gray/20 rounded-lg hover:bg-neutral-gray/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton loading state para a tabela
 */
function BriefingTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filtros skeleton */}
      <div className="flex gap-4 p-4 bg-dark-bg-secondary rounded-xl">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Tabela skeleton */}
      <div className="rounded-xl border border-neutral-gray/10 overflow-hidden">
        <div className="bg-dark-bg-secondary p-4">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-neutral-gray/10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="grid grid-cols-6 gap-4">
                <Skeleton className="h-12 col-span-1" />
                <Skeleton className="h-12 col-span-1" />
                <Skeleton className="h-12 col-span-1" />
                <Skeleton className="h-8 col-span-1 w-24" />
                <Skeleton className="h-12 col-span-1" />
                <Skeleton className="h-10 col-span-1 w-28 justify-self-end" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Estado vazio quando não há briefings
 */
function BriefingEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-dark-bg-secondary rounded-xl border border-neutral-gray/10 border-dashed">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-neutral-gray/10 mb-4">
        <FileText className="w-8 h-8 text-neutral-gray" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-white mb-2">Nenhum briefing encontrado</h3>
      <p className="text-neutral-gray text-center max-w-md">
        Não encontramos briefings com os filtros selecionados. Tente ajustar os filtros ou aguarde
        novos envios.
      </p>
    </div>
  );
}
