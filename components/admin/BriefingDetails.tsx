'use client';

import { BriefingWithRelations } from '@/types/admin-briefing';
import {
  getServiceTypeLabel,
  formatBriefingDate,
  getStatusLabel,
  canApproveBriefing,
  canRejectBriefing,
} from '@/lib/briefing-utils';
import BriefingStatusBadge from './BriefingStatusBadge';
import Card from '@/components/ui/Card';
import {
  User,
  Building2,
  Mail,
  Phone,
  Briefcase,
  Target,
  Wallet,
  Calendar,
  Layers,
  Image,
  Link2,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface BriefingDetailsProps {
  briefing: BriefingWithRelations;
}

/**
 * Componente de visualização detalhada de briefing
 * Layout em grid com informações do cliente e detalhes do briefing
 */
export default function BriefingDetails({ briefing }: BriefingDetailsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Coluna 1: Informações do Cliente */}
      <div className="space-y-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-accent-primary/10">
                <User className="w-5 h-5 text-accent-primary" />
              </div>
              <h2 className="text-lg font-semibold text-neutral-white">Informações do Cliente</h2>
            </div>

            <div className="space-y-4">
              <InfoRow icon={User} label="Nome" value={briefing.user.name || 'Não informado'} />
              <InfoRow
                icon={Mail}
                label="Email"
                value={briefing.user.email}
                href={`mailto:${briefing.user.email}`}
              />
              <InfoRow
                icon={Phone}
                label="Telefone"
                value={briefing.user.phone || 'Não informado'}
              />
              <InfoRow
                icon={Building2}
                label="Empresa (cadastro)"
                value={briefing.user.company || 'Não informado'}
              />
            </div>
          </div>
        </Card>

        {/* Metadados do Briefing */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-500/10">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-lg font-semibold text-neutral-white">Histórico</h2>
            </div>

            <div className="space-y-4">
              <InfoRow
                icon={Clock}
                label="Criado em"
                value={formatBriefingDate(briefing.createdAt)}
              />
              <InfoRow
                icon={SendIcon}
                label="Enviado em"
                value={formatBriefingDate(briefing.submittedAt)}
              />
              <InfoRow
                icon={CheckCircle}
                label="Analisado em"
                value={formatBriefingDate(briefing.reviewedAt)}
              />

              {/* Status atual */}
              <div className="pt-4 border-t border-neutral-gray/10">
                <span className="text-sm text-neutral-gray block mb-2">Status Atual</span>
                <BriefingStatusBadge status={briefing.status} />
              </div>

              {/* Motivo de rejeição */}
              {briefing.status === 'REJEITADO' && briefing.rejectionReason && (
                <div className="pt-4 border-t border-neutral-gray/10">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                    <div>
                      <span className="text-sm text-red-400 block mb-1">Motivo da Rejeição</span>
                      <p className="text-sm text-neutral-light bg-red-500/10 p-3 rounded-lg">
                        {briefing.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Link para projeto */}
              {briefing.project && (
                <div className="pt-4 border-t border-neutral-gray/10">
                  <span className="text-sm text-neutral-gray block mb-2">Projeto Vinculado</span>
                  <Link
                    href={`/admin/projetos/${briefing.project.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver Projeto: {briefing.project.name}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Coluna 2: Detalhes do Briefing */}
      <div className="space-y-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/10">
                <Briefcase className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-neutral-white">Detalhes do Briefing</h2>
            </div>

            <div className="space-y-4">
              <InfoRow
                icon={Layers}
                label="Tipo de Serviço"
                value={getServiceTypeLabel(briefing.serviceType)}
                highlight
              />
              <InfoRow icon={Building2} label="Nome da Empresa" value={briefing.companyName} />
              <InfoRow icon={Target} label="Ramo de Atividade" value={briefing.segment} />
            </div>

            {/* Objetivos */}
            <div className="mt-6 pt-6 border-t border-neutral-gray/10">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-neutral-gray" />
                <span className="text-sm text-neutral-gray">Objetivos</span>
              </div>
              <div className="bg-dark-bg p-4 rounded-lg border border-neutral-gray/10">
                <p className="text-neutral-light whitespace-pre-wrap">{briefing.objectives}</p>
              </div>
            </div>

            {/* Orçamento e Prazo */}
            <div className="mt-6 pt-6 border-t border-neutral-gray/10 grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-neutral-gray" />
                  <span className="text-sm text-neutral-gray">Orçamento Estimado</span>
                </div>
                <span className="text-neutral-white font-medium">
                  {briefing.budget || 'Não informado'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-neutral-gray" />
                  <span className="text-sm text-neutral-gray">Prazo Desejado</span>
                </div>
                <span className="text-neutral-white font-medium">
                  {briefing.deadline || 'Não informado'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Campos Opcionais */}
        {(briefing.features || briefing.references || briefing.integrations) && (
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-500/10">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-white">Informações Adicionais</h2>
              </div>

              <div className="space-y-6">
                {briefing.features && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="w-4 h-4 text-neutral-gray" />
                      <span className="text-sm text-neutral-gray">Funcionalidades Específicas</span>
                    </div>
                    <div className="bg-dark-bg p-4 rounded-lg border border-neutral-gray/10">
                      <p className="text-neutral-light whitespace-pre-wrap">{briefing.features}</p>
                    </div>
                  </div>
                )}

                {briefing.references && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Image className="w-4 h-4 text-neutral-gray" />
                      <span className="text-sm text-neutral-gray">Referências Visuais</span>
                    </div>
                    <div className="bg-dark-bg p-4 rounded-lg border border-neutral-gray/10">
                      <p className="text-neutral-light whitespace-pre-wrap">
                        {briefing.references}
                      </p>
                    </div>
                  </div>
                )}

                {briefing.integrations && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Link2 className="w-4 h-4 text-neutral-gray" />
                      <span className="text-sm text-neutral-gray">Integrações Necessárias</span>
                    </div>
                    <div className="bg-dark-bg p-4 rounded-lg border border-neutral-gray/10">
                      <p className="text-neutral-light whitespace-pre-wrap">
                        {briefing.integrations}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Informações Adicionais em JSON */}
        {briefing.additionalInfo && (
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-orange-500/10">
                  <FileText className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-white">Dados Extras</h2>
              </div>
              <pre className="bg-dark-bg p-4 rounded-lg border border-neutral-gray/10 overflow-x-auto">
                <code className="text-sm text-neutral-light">
                  {JSON.stringify(briefing.additionalInfo, null, 2)}
                </code>
              </pre>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// Ícone auxiliar
function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
  highlight?: boolean;
}

function InfoRow({ icon: Icon, label, value, href, highlight }: InfoRowProps) {
  const content = (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-neutral-gray mt-0.5" />
      <div className="flex-1">
        <span className="text-sm text-neutral-gray block">{label}</span>
        <span className={`${highlight ? 'text-accent-primary font-medium' : 'text-neutral-white'}`}>
          {value}
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block hover:bg-dark-bg/50 p-2 -mx-2 rounded-lg transition-colors group"
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return <div className="p-2 -mx-2">{content}</div>;
}
