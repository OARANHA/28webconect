'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdminClientWithHistory } from '@/types/admin-client';
import { BriefingStatus, ProjectStatus } from '@prisma/client';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Button from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-shadcn';
import {
  FileText,
  FolderKanban,
  MessageSquare,
  Paperclip,
  Eye,
  ExternalLink,
  FileIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientHistoryProps {
  client: AdminClientWithHistory;
}

const BRIEFING_STATUS_CONFIG: Record<BriefingStatus, { label: string; color: string }> = {
  RASCUNHO: { label: 'Rascunho', color: 'bg-gray-500/20 text-gray-400' },
  ENVIADO: { label: 'Enviado', color: 'bg-blue-500/20 text-blue-400' },
  EM_ANALISE: { label: 'Em Análise', color: 'bg-amber-500/20 text-amber-400' },
  APROVADO: { label: 'Aprovado', color: 'bg-emerald-500/20 text-emerald-400' },
  REJEITADO: { label: 'Rejeitado', color: 'bg-red-500/20 text-red-400' },
};

const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  ATIVO: { label: 'Ativo', color: 'bg-emerald-500/20 text-emerald-400' },
  CONCLUIDO: { label: 'Concluído', color: 'bg-blue-500/20 text-blue-400' },
  PAUSADO: { label: 'Pausado', color: 'bg-amber-500/20 text-amber-400' },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400' },
  ARQUIVADO: { label: 'Arquivado', color: 'bg-gray-500/20 text-gray-400' },
  AGUARDANDO_APROVACAO: { label: 'Aguardando', color: 'bg-purple-500/20 text-purple-400' },
};

/**
 * Componente de histórico do cliente com tabs
 */
export function ClientHistory({ client }: ClientHistoryProps) {
  const [activeTab, setActiveTab] = useState('briefings');

  // Verificar se há dados
  const hasBriefings = client.briefings.length > 0;
  const hasProjects = client.projects.length > 0;
  const hasComments = client.projectComments.length > 0;
  const hasFiles = client.projectFiles.length > 0;

  // Função para formatar tamanho de arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-dark-bg-secondary">
        <TabsTrigger
          value="briefings"
          className="data-[state=active]:bg-accent-primary/20 data-[state=active]:text-accent-primary"
        >
          <FileText className="w-4 h-4 mr-2" />
          Briefings
          {hasBriefings && (
            <span className="ml-2 text-xs bg-neutral-gray/20 px-2 py-0.5 rounded-full">
              {client.briefings.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="projects"
          className="data-[state=active]:bg-accent-primary/20 data-[state=active]:text-accent-primary"
        >
          <FolderKanban className="w-4 h-4 mr-2" />
          Projetos
          {hasProjects && (
            <span className="ml-2 text-xs bg-neutral-gray/20 px-2 py-0.5 rounded-full">
              {client.projects.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="comments"
          className="data-[state=active]:bg-accent-primary/20 data-[state=active]:text-accent-primary"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Comentários
          {hasComments && (
            <span className="ml-2 text-xs bg-neutral-gray/20 px-2 py-0.5 rounded-full">
              {client.projectComments.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="files"
          className="data-[state=active]:bg-accent-primary/20 data-[state=active]:text-accent-primary"
        >
          <Paperclip className="w-4 h-4 mr-2" />
          Arquivos
          {hasFiles && (
            <span className="ml-2 text-xs bg-neutral-gray/20 px-2 py-0.5 rounded-full">
              {client.projectFiles.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      {/* Tab Briefings */}
      <TabsContent value="briefings" className="mt-4">
        {!hasBriefings ? (
          <EmptyState icon={FileText} message="Nenhum briefing enviado ainda." />
        ) : (
          <div className="space-y-3">
            {client.briefings.map((briefing) => (
              <Card key={briefing.id} className="bg-dark-bg-secondary border-neutral-gray/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-neutral-white">{briefing.companyName}</h4>
                        <Badge
                          className={cn('text-xs', BRIEFING_STATUS_CONFIG[briefing.status].color)}
                        >
                          {BRIEFING_STATUS_CONFIG[briefing.status].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-gray">
                        <span>Serviço: {briefing.serviceType.replace(/_/g, ' ')}</span>
                        <span>•</span>
                        <span>Criado: {formatDate(briefing.createdAt)}</span>
                        {briefing.submittedAt && (
                          <>
                            <span>•</span>
                            <span>Enviado: {formatDate(briefing.submittedAt)}</span>
                          </>
                        )}
                      </div>
                      {briefing.project && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <span className="text-neutral-gray">Projeto vinculado:</span>
                          <Link
                            href={`/admin/projetos/${briefing.project.id}`}
                            className="text-accent-primary hover:underline flex items-center gap-1"
                          >
                            {briefing.project.name}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                    <Link href={`/admin/briefings/${briefing.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-accent-primary hover:text-accent-primary hover:bg-accent-primary/10"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Tab Projetos */}
      <TabsContent value="projects" className="mt-4">
        {!hasProjects ? (
          <EmptyState icon={FolderKanban} message="Nenhum projeto criado ainda." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {client.projects.map((project) => (
              <Card key={project.id} className="bg-dark-bg-secondary border-neutral-gray/10">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-neutral-white">{project.name}</CardTitle>
                      <p className="text-sm text-neutral-gray mt-1 line-clamp-2">
                        {project.description || 'Sem descrição'}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        'text-xs shrink-0',
                        PROJECT_STATUS_CONFIG[project.status].color
                      )}
                    >
                      {PROJECT_STATUS_CONFIG[project.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Progresso */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-gray">Progresso</span>
                      <span className="text-neutral-white">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-dark-bg-primary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-primary rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-neutral-gray">
                      Etapas: {project.milestones.filter((m) => m.completed).length} /{' '}
                      {project.milestones.length}
                    </span>
                  </div>

                  {/* Arquivos e Comentários */}
                  <div className="flex items-center gap-4 text-sm text-neutral-gray">
                    <span className="flex items-center gap-1">
                      <Paperclip className="w-4 h-4" />
                      {project._count.files} arquivo(s)
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {project._count.comments} comentário(s)
                    </span>
                  </div>

                  {/* Datas */}
                  <div className="mt-3 pt-3 border-t border-neutral-gray/10 text-sm text-neutral-gray">
                    {project.startDate && <span>Início: {formatDate(project.startDate)}</span>}
                    {project.endDate && (
                      <span className="ml-4">Término: {formatDate(project.endDate)}</span>
                    )}
                  </div>

                  <Link href={`/admin/projetos/${project.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full border-neutral-gray/20 text-neutral-white hover:bg-dark-bg-primary"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Projeto
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Tab Comentários */}
      <TabsContent value="comments" className="mt-4">
        {!hasComments ? (
          <EmptyState icon={MessageSquare} message="Nenhum comentário ainda." />
        ) : (
          <div className="space-y-3">
            {client.projectComments.map((comment) => (
              <Card key={comment.id} className="bg-dark-bg-secondary border-neutral-gray/10">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-accent-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-neutral-white">
                          {client.name || 'Cliente'}
                        </span>
                        <span className="text-neutral-gray">em</span>
                        <Link
                          href={`/admin/projetos/${comment.project.id}`}
                          className="text-accent-primary hover:underline"
                        >
                          {comment.project.name}
                        </Link>
                      </div>
                      <p className="text-neutral-gray text-sm">{comment.content}</p>
                      <span className="text-xs text-neutral-gray mt-2 block">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Tab Arquivos */}
      <TabsContent value="files" className="mt-4">
        {!hasFiles ? (
          <EmptyState icon={Paperclip} message="Nenhum arquivo enviado ainda." />
        ) : (
          <div className="grid gap-3">
            {client.projectFiles.map((file) => (
              <Card key={file.id} className="bg-dark-bg-secondary border-neutral-gray/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-accent-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-white truncate max-w-md">
                          {file.filename}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-neutral-gray">
                          <span>{formatFileSize(file.filesize)}</span>
                          <span>•</span>
                          <span>{formatDate(file.uploadedAt)}</span>
                          <span>•</span>
                          <span>em {file.project.name}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-neutral-gray/20 text-neutral-gray">
                      {file.mimetype.split('/')[1]?.toUpperCase() || file.mimetype}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  message: string;
}

function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-dark-bg-secondary rounded-lg border border-dashed border-neutral-gray/20">
      <Icon className="w-12 h-12 text-neutral-gray mx-auto mb-4" />
      <p className="text-neutral-gray">{message}</p>
    </div>
  );
}
