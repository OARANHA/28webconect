import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireEmailVerified } from '@/lib/auth-utils';
import { getProjectById } from '@/app/actions/projects';
import { calculateProgress } from '@/lib/project-utils';
import { formatDate, formatFileSize } from '@/lib/utils';
import { checkStorageLimit } from '@/lib/file-upload';
import Card from '@/components/ui/Card';
import ProjectStatusBadge from '@/components/project/ProjectStatusBadge';
import ProgressBar from '@/components/project/ProgressBar';
import ProjectTimeline from '@/components/project/ProjectTimeline';
import FileUpload from '@/components/project/FileUpload';
import FileList from '@/components/project/FileList';
import CommentSection from '@/components/project/CommentSection';
import {
  ArrowLeft,
  Calendar,
  FileText,
  MessageSquare,
  HardDrive,
  AlertTriangle,
  Globe,
  Palette,
  Code,
  ShoppingCart,
  Building2,
  Clock,
} from 'lucide-react';
import { ServiceType } from '@prisma/client';

interface ProjectDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * Gera metadata dinâmica para a página de detalhes
 */
export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  // Note: Não podemos acessar session aqui, então usamos um título genérico
  return {
    title: 'Detalhes do Projeto | 28Web Connect',
    description: 'Visualize os detalhes e acompanhe o progresso do seu projeto',
  };
}

const serviceTypeIcons: Record<ServiceType, React.ReactNode> = {
  ERP_BASICO: <Globe className="w-5 h-5" />,
  ERP_ECOMMERCE: <ShoppingCart className="w-5 h-5" />,
  ERP_PREMIUM: <Building2 className="w-5 h-5" />,
  LANDING_IA: <Code className="w-5 h-5" />,
  LANDING_IA_WHATSAPP: <MessageSquare className="w-5 h-5" />,
};

const serviceTypeLabels: Record<ServiceType, string> = {
  ERP_BASICO: 'ERP Cloud Básico',
  ERP_ECOMMERCE: 'ERP + E-commerce',
  ERP_PREMIUM: 'ERP Cloud Premium',
  LANDING_IA: 'Landing Page com IA',
  LANDING_IA_WHATSAPP: 'Landing Page IA + WhatsApp',
};

/**
 * Página de detalhes do projeto - Server Component
 */
export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const session = await requireEmailVerified();

  const response = await getProjectById(params.id, session.user.id);

  if (!response.success || !response.data) {
    notFound();
  }

  const project = response.data;
  const progress = calculateProgress(project.milestones);

  const serviceType = project.briefing?.serviceType;
  const filesCount = project._count?.files || 0;
  const commentsCount = project._count?.comments || 0;

  // Verifica se usuário é dono do projeto
  const isOwner = project.userId === session.user.id;

  // Busca informações de storage
  const storageCheck = await checkStorageLimit(session.user.id);
  const storageInfo = storageCheck.storageInfo;
  const isStorageFull = storageCheck.percentage >= 100;
  const isStorageWarning = storageCheck.percentage >= 90;

  return (
    <div className="space-y-6">
      {/* Header com botão voltar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/projetos"
            className="inline-flex items-center gap-1.5 text-neutral-gray hover:text-accent-primary transition-colors text-sm mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para projetos
          </Link>
          <h1 className="text-2xl font-bold text-neutral-white">{project.name}</h1>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      {/* Grid de informações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card de progresso */}
          <Card>
            <h2 className="text-lg font-semibold text-neutral-white mb-4">Progresso do Projeto</h2>
            <ProgressBar progress={progress} size="lg" showLabel />
            <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-neutral-gray/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-white">
                  {project.milestones.filter((m) => m.completed).length}
                </div>
                <div className="text-xs text-neutral-gray">Concluídas</div>
              </div>
              <div className="text-center border-x border-neutral-gray/10">
                <div className="text-2xl font-bold text-neutral-white">
                  {project.milestones.length}
                </div>
                <div className="text-xs text-neutral-gray">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-primary">
                  {Math.round(progress)}%
                </div>
                <div className="text-xs text-neutral-gray">Progresso</div>
              </div>
            </div>
          </Card>

          {/* Card de timeline */}
          <Card>
            <h2 className="text-lg font-semibold text-neutral-white mb-4">Etapas do Projeto</h2>
            <ProjectTimeline milestones={project.milestones} isReadOnly={true} />
          </Card>

          {/* Seção de Arquivos */}
          {isOwner && (
            <>
              {/* Alerta de storage */}
              {isStorageFull ? (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400">
                      Limite de armazenamento atingido
                    </p>
                    <p className="text-sm text-red-300/80">
                      Entre em contato para fazer um upgrade do seu plano.
                    </p>
                  </div>
                </div>
              ) : isStorageWarning ? (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-400">
                      Você está usando {storageCheck.percentage}% do seu armazenamento
                    </p>
                    <p className="text-sm text-amber-300/80">
                      Considere fazer um upgrade do seu plano em breve.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Upload de arquivos */}
              {!isStorageFull && <FileUpload projectId={project.id} />}

              {/* Lista de arquivos */}
              <FileList projectId={project.id} userId={session.user.id} canDelete={isOwner} />
            </>
          )}

          {/* Seção de Comentários */}
          <CommentSection
            projectId={project.id}
            milestones={project.milestones}
            initialComments={project.comments.slice(0, 10)}
            userId={session.user.id}
            userRole={session.user.role}
          />

          {/* Descrição do projeto */}
          {project.description && (
            <Card>
              <h2 className="text-lg font-semibold text-neutral-white mb-3">Sobre o Projeto</h2>
              <p className="text-neutral-gray whitespace-pre-wrap">{project.description}</p>
            </Card>
          )}
        </div>

        {/* Coluna lateral */}
        <div className="space-y-6">
          {/* Informações do projeto */}
          <Card>
            <h2 className="text-lg font-semibold text-neutral-white mb-4">Informações</h2>
            <div className="space-y-4">
              {serviceType && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                    {serviceTypeIcons[serviceType]}
                  </div>
                  <div>
                    <div className="text-xs text-neutral-gray">Tipo de Serviço</div>
                    <div className="text-sm font-medium text-neutral-white">
                      {serviceTypeLabels[serviceType]}
                    </div>
                  </div>
                </div>
              )}

              {project.briefing?.companyName && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-gray">Empresa</div>
                    <div className="text-sm font-medium text-neutral-white">
                      {project.briefing.companyName}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-neutral-gray">Criado em</div>
                  <div className="text-sm font-medium text-neutral-white">
                    {formatDate(project.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-neutral-gray">Última atualização</div>
                  <div className="text-sm font-medium text-neutral-white">
                    {formatDate(project.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Estatísticas */}
          <Card>
            <h2 className="text-lg font-semibold text-neutral-white mb-4">Estatísticas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-bg-primary rounded-lg p-4 text-center">
                <FileText className="w-5 h-5 mx-auto mb-2 text-accent-primary" />
                <div className="text-xl font-bold text-neutral-white">{filesCount}</div>
                <div className="text-xs text-neutral-gray">Arquivos</div>
              </div>
              <div className="bg-dark-bg-primary rounded-lg p-4 text-center">
                <MessageSquare className="w-5 h-5 mx-auto mb-2 text-accent-primary" />
                <div className="text-xl font-bold text-neutral-white">{commentsCount}</div>
                <div className="text-xs text-neutral-gray">Comentários</div>
              </div>
            </div>
          </Card>

          {/* Indicador de Storage */}
          {storageInfo && (
            <Card>
              <h2 className="text-lg font-semibold text-neutral-white mb-4">Armazenamento</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-gray">Usado</span>
                      <span className="text-xs font-medium text-neutral-white">
                        {formatFileSize(storageInfo.used)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-gray/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          storageCheck.percentage >= 90
                            ? 'bg-red-500'
                            : storageCheck.percentage >= 70
                              ? 'bg-amber-500'
                              : 'bg-accent-primary'
                        }`}
                        style={{ width: `${Math.min(storageCheck.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-neutral-gray/60">
                        {storageCheck.percentage}% utilizado
                      </span>
                      <span className="text-xs text-neutral-gray/60">
                        {formatFileSize(storageInfo.limit)} total
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
