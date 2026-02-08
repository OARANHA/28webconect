'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { BriefingWithRelations } from '@/types/admin-briefing';
import { getBriefingById, markBriefingAsInAnalysis } from '@/app/actions/admin-briefings';
import BriefingDetails from '@/components/admin/BriefingDetails';
import BriefingStatusBadge from '@/components/admin/BriefingStatusBadge';
import ApproveBriefingModal from '@/components/admin/ApproveBriefingModal';
import RejectBriefingModal from '@/components/admin/RejectBriefingModal';
import { canApproveBriefing, canRejectBriefing, canMarkAsInAnalysis } from '@/lib/briefing-utils';

interface BriefingDetailsClientProps {
  briefing: BriefingWithRelations;
}

/**
 * Client Component para página de detalhes do briefing
 * Gerencia ações de aprovação, rejeição e marcação como em análise
 */
export default function BriefingDetailsClient({
  briefing: initialBriefing,
}: BriefingDetailsClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Estados dos modais
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Query para manter dados atualizados
  const { data: briefing, isLoading } = useQuery({
    queryKey: ['briefing', initialBriefing.id],
    queryFn: async () => {
      const result = await getBriefingById(initialBriefing.id);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Erro ao buscar briefing');
    },
    initialData: initialBriefing,
    staleTime: 5000,
  });

  // Mutation para marcar como em análise
  const markAsInAnalysisMutation = {
    isPending: false, // Será implementado se necessário
  };

  const handleMarkAsInAnalysis = async () => {
    const result = await markBriefingAsInAnalysis(briefing.id);
    if (result.success) {
      toast.success('Briefing marcado como em análise');
      queryClient.invalidateQueries({ queryKey: ['briefing', briefing.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-briefings'] });
    } else {
      toast.error(result.error || 'Erro ao atualizar status');
    }
  };

  // Verificações de permissão
  const showApproveButton = canApproveBriefing(briefing);
  const showRejectButton = canRejectBriefing(briefing);
  const showMarkAsInAnalysisButton = canMarkAsInAnalysis(briefing);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/admin/briefings"
          className="inline-flex items-center gap-1.5 text-neutral-gray hover:text-neutral-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Briefings
        </Link>
        <span className="text-neutral-gray">/</span>
        <span className="text-neutral-light truncate max-w-xs">{briefing.companyName}</span>
      </nav>

      {/* Header com ações */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 bg-dark-bg-secondary rounded-xl border border-neutral-gray/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-neutral-white">{briefing.companyName}</h2>
            <BriefingStatusBadge status={briefing.status} />
          </div>
          <p className="text-neutral-gray">
            Cliente: {briefing.user.name || 'Sem nome'} ({briefing.user.email})
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-3">
          {showMarkAsInAnalysisButton && (
            <button
              onClick={handleMarkAsInAnalysis}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-lg transition-colors"
            >
              <Clock className="w-4 h-4" />
              Marcar como Em Análise
            </button>
          )}

          {showRejectButton && (
            <button
              onClick={() => setIsRejectModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Rejeitar Briefing
            </button>
          )}

          {showApproveButton && (
            <button
              onClick={() => setIsApproveModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Aprovar Briefing
            </button>
          )}
        </div>
      </div>

      {/* Detalhes do briefing */}
      <BriefingDetails briefing={briefing} />

      {/* Modais */}
      <ApproveBriefingModal
        briefingId={briefing.id}
        companyName={briefing.companyName}
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['briefing', briefing.id] });
          queryClient.invalidateQueries({ queryKey: ['admin-briefings'] });
        }}
      />

      <RejectBriefingModal
        briefingId={briefing.id}
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['briefing', briefing.id] });
          queryClient.invalidateQueries({ queryKey: ['admin-briefings'] });
        }}
      />
    </div>
  );
}
