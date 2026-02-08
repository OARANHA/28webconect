'use client';

import { useState, useTransition } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  FileText,
  Briefcase,
  Send,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { AdminProjectWithRelations } from '@/types/admin-project';
import { ProjectStatus } from '@prisma/client';
import {
  fetchAdminProjectById,
  updateAdminProjectStatus,
  toggleAdminMilestone,
  addAdminProjectNote,
} from '@/lib/api/admin-projects';
import AdminProjectTimeline from '@/components/admin/AdminProjectTimeline';
import ProjectStatusBadge from '@/components/project/ProjectStatusBadge';
import ConfirmActionModal from '@/components/admin/ConfirmActionModal';
import Card from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { getProjectStatusLabel } from '@/lib/project-utils';

interface ProjectEditorClientProps {
  project: AdminProjectWithRelations;
}

/**
 * Client Component para edição de projeto
 * Gerencia milestones, status e notas
 * Usa API routes em vez de server actions diretas
 */
export default function ProjectEditorClient({ project: initialProject }: ProjectEditorClientProps) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  // Estados dos modais
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ProjectStatus | null>(null);

  // Estado do formulário de nota
  const [noteContent, setNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Estado do dropdown de status
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>(initialProject.status);

  // Query para manter dados atualizados
  const { data: project, isLoading } = useQuery({
    queryKey: ['admin-project', initialProject.id],
    queryFn: async () => {
      return await fetchAdminProjectById(initialProject.id);
    },
    initialData: initialProject,
    staleTime: 5000,
  });

  // Handler para toggle de milestone
  const handleToggleMilestone = async (milestoneId: string, completed: boolean) => {
    const result = await toggleAdminMilestone(project.id, milestoneId, completed);
    if (result) {
      toast.success(completed ? 'Milestone marcada como concluída' : 'Milestone desmarcada');
      queryClient.invalidateQueries({ queryKey: ['admin-project', project.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    }
  };

  // Handler para atualização de status
  const handleStatusChange = async () => {
    if (!pendingStatus) return;

    startTransition(async () => {
      try {
        await updateAdminProjectStatus(project.id, pendingStatus);
        toast.success('Status atualizado com sucesso');
        queryClient.invalidateQueries({ queryKey: ['admin-project', project.id] });
        queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
        setSelectedStatus(pendingStatus);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao atualizar status');
      }
      setIsStatusModalOpen(false);
      setPendingStatus(null);
    });
  };

  // Handler para adicionar nota
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || noteContent.length < 10) {
      toast.error('A nota deve ter pelo menos 10 caracteres');
      return;
    }

    setIsSubmittingNote(true);
    try {
      await addAdminProjectNote(project.id, noteContent);
      toast.success('Nota adicionada com sucesso');
      setNoteContent('');
      queryClient.invalidateQueries({ queryKey: ['admin-project', project.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar nota');
    }
    setIsSubmittingNote(false);
  };

  // Verificar se status requer confirmação
  const handleStatusSelect = (newStatus: ProjectStatus) => {
    if (newStatus === 'CANCELADO' || newStatus === 'ARQUIVADO') {
      setPendingStatus(newStatus);
      setIsStatusModalOpen(true);
    } else {
      startTransition(async () => {
        try {
          await updateAdminProjectStatus(project.id, newStatus);
          toast.success('Status atualizado com sucesso');
          queryClient.invalidateQueries({ queryKey: ['admin-project', project.id] });
          queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
          setSelectedStatus(newStatus);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Erro ao atualizar status');
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/admin/projetos"
          className="inline-flex items-center gap-1.5 text-neutral-gray hover:text-neutral-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Projetos
        </Link>
        <span className="text-neutral-gray">/</span>
        <span className="text-neutral-light truncate max-w-xs">{project.name}</span>
      </nav>

      {/* Header com ações */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 bg-dark-bg-secondary rounded-xl border border-neutral-gray/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-neutral-white">{project.name}</h2>
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="text-neutral-gray">
            Cliente: {project.user.name || 'Sem nome'} ({project.user.email})
          </p>
        </div>
      </div>

      {/* Grid de 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda */}
        <div className="space-y-6">
          {/* Informações do Cliente */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-accent-primary/10">
                  <User className="w-5 h-5 text-accent-primary" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-white">Informações do Cliente</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-neutral-gray mt-0.5" />
                  <div>
                    <span className="text-sm text-neutral-gray block">Nome</span>
                    <span className="text-neutral-white">
                      {project.user.name || 'Não informado'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-neutral-gray mt-0.5" />
                  <div>
                    <span className="text-sm text-neutral-gray block">Email</span>
                    <span className="text-neutral-white">{project.user.email}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-neutral-gray mt-0.5" />
                  <div>
                    <span className="text-sm text-neutral-gray block">Telefone</span>
                    <span className="text-neutral-white">
                      {project.user.phone || 'Não informado'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-neutral-gray mt-0.5" />
                  <div>
                    <span className="text-sm text-neutral-gray block">Empresa</span>
                    <span className="text-neutral-white">
                      {project.user.company || 'Não informado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Informações do Projeto */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/10">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-white">Informações do Projeto</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-neutral-gray mt-0.5" />
                  <div>
                    <span className="text-sm text-neutral-gray block">Nome</span>
                    <span className="text-neutral-white">{project.name}</span>
                  </div>
                </div>
                {project.description && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-neutral-gray mt-0.5" />
                    <div>
                      <span className="text-sm text-neutral-gray block">Descrição</span>
                      <p className="text-neutral-white text-sm mt-1">{project.description}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-neutral-gray mt-0.5" />
                  <div>
                    <span className="text-sm text-neutral-gray block">Data de Criação</span>
                    <span className="text-neutral-white">{formatDate(project.createdAt)}</span>
                  </div>
                </div>
                {project.startedAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-neutral-gray mt-0.5" />
                    <div>
                      <span className="text-sm text-neutral-gray block">Data de Início</span>
                      <span className="text-neutral-white">{formatDate(project.startedAt)}</span>
                    </div>
                  </div>
                )}
                {project.completedAt && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <div>
                      <span className="text-sm text-neutral-gray block">Data de Conclusão</span>
                      <span className="text-emerald-400">{formatDate(project.completedAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Alterar Status */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-500/10">
                  <Briefcase className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-white">Alterar Status</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-gray mb-2">Status Atual</label>
                  <ProjectStatusBadge status={project.status} />
                </div>

                <div>
                  <label className="block text-sm text-neutral-gray mb-2">Novo Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusSelect(e.target.value as ProjectStatus)}
                    disabled={isPending}
                    className="w-full px-4 py-2.5 bg-dark-bg border border-neutral-gray/20 rounded-lg text-neutral-white focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors disabled:opacity-50"
                  >
                    {Object.values(ProjectStatus).map((status) => (
                      <option key={status} value={status}>
                        {getProjectStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-xs text-neutral-gray">
                  Atenção: Alterações para &quot;Cancelado&quot; ou &quot;Arquivado&quot; requerem
                  confirmação.
                </p>
              </div>
            </div>
          </Card>

          {/* Briefing Vinculado */}
          {project.briefing && (
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-500/10">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-white">Briefing Vinculado</h3>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-white">{project.briefing.companyName}</p>
                    <p className="text-sm text-neutral-gray">{project.briefing.serviceType}</p>
                  </div>
                  <Link
                    href={`/admin/briefings/${project.briefing.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-accent-primary hover:text-accent-secondary bg-accent-primary/10 hover:bg-accent-primary/20 rounded-lg transition-colors"
                  >
                    Ver Briefing
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Coluna Direita */}
        <div className="space-y-6">
          {/* Timeline do Projeto */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-white mb-4">Timeline do Projeto</h3>
              <AdminProjectTimeline
                milestones={project.milestones}
                onToggleMilestone={handleToggleMilestone}
              />
            </div>
          </Card>

          {/* Adicionar Nota */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-white mb-4">Adicionar Nota</h3>
              <form onSubmit={handleAddNote} className="space-y-4">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Digite uma nota ou mensagem para o cliente..."
                  rows={4}
                  className="w-full px-4 py-3 bg-dark-bg border border-neutral-gray/20 rounded-lg text-neutral-white placeholder-neutral-gray focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-gray">Mínimo 10 caracteres</span>
                  <button
                    type="submit"
                    disabled={isSubmittingNote || noteContent.length < 10}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent-primary hover:bg-accent-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmittingNote ? 'Enviando...' : 'Enviar Nota'}
                  </button>
                </div>
              </form>
            </div>
          </Card>

          {/* Comentários */}
          {project.comments.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-white mb-4">
                  Histórico de Notas ({project.comments.length})
                </h3>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {project.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 bg-dark-bg rounded-lg border border-neutral-gray/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-white">
                          {comment.user.name || 'Usuário'}
                        </span>
                        <span className="text-xs text-neutral-gray">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-light">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Arquivos */}
          {project.files.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-white mb-4">
                  Arquivos do Projeto ({project.files.length})
                </h3>
                <div className="space-y-2">
                  {project.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-dark-bg rounded-lg border border-neutral-gray/10"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-neutral-gray" />
                        <div>
                          <p className="text-sm text-neutral-white truncate max-w-[200px]">
                            {file.filename}
                          </p>
                          <p className="text-xs text-neutral-gray">
                            por {file.user.name || 'Usuário'} • {formatDate(file.uploadedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Confirmação */}
      <ConfirmActionModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setPendingStatus(null);
        }}
        onConfirm={handleStatusChange}
        title={pendingStatus === 'CANCELADO' ? 'Cancelar Projeto' : 'Arquivar Projeto'}
        message={
          pendingStatus === 'CANCELADO'
            ? 'Tem certeza que deseja cancelar este projeto? Esta ação não pode ser desfeita e o cliente será notificado.'
            : 'Tem certeza que deseja arquivar este projeto? Projetos arquivados não podem ser modificados.'
        }
        confirmText={pendingStatus === 'CANCELADO' ? 'Cancelar Projeto' : 'Arquivar Projeto'}
        variant={pendingStatus === 'CANCELADO' ? 'danger' : 'warning'}
      />
    </div>
  );
}
