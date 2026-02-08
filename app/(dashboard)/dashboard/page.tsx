import { Metadata } from 'next';
import Link from 'next/link';
import { requireEmailVerified } from '@/lib/auth-utils';
import { getProjectsByUserId, getActiveProjectsCount } from '@/app/actions/projects';
import { ProjectStatus } from '@prisma/client';
import {
  FolderKanban,
  FileText,
  MessageSquare,
  Rocket,
  Plus,
  ArrowRight,
  Briefcase,
  Tag,
} from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyState from '@/components/dashboard/EmptyState';
import ProjectCard from '@/components/project/ProjectCard';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Dashboard | 28Web Connect',
  description: 'Gerencie seus projetos e acompanhe o progresso',
};

/**
 * Página inicial do Dashboard - Server Component
 * Exibe estatísticas e lista de projetos ativos
 */
export default async function DashboardPage() {
  const session = await requireEmailVerified();

  // Buscar dados reais
  const [activeProjectsResponse, activeCountResponse] = await Promise.all([
    getProjectsByUserId(session.user.id, ProjectStatus.ATIVO),
    getActiveProjectsCount(session.user.id),
  ]);

  const activeProjects = activeProjectsResponse.success ? activeProjectsResponse.data || [] : [];

  const activeCount = activeCountResponse.success ? activeCountResponse.data || 0 : 0;

  // Dados de estatísticas (placeholder para outras métricas)
  const stats = {
    projectsActive: activeCount,
    briefingsSent: 0, // TODO: Implementar contagem de briefings
    messagesUnread: 0, // TODO: Implementar contagem de mensagens
  };

  const displayName = session.user.name || 'Cliente';
  const hasProjects = activeProjects.length > 0;

  return (
    <div className="space-y-8">
      {/* Mensagem de boas-vindas */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-white">Bem-vindo, {displayName}!</h2>
        <p className="text-neutral-gray mt-1">
          Acompanhe seus projetos e gerencie suas solicitações
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <DashboardCard
          title="Projetos Ativos"
          value={stats.projectsActive}
          icon={<FolderKanban className="w-6 h-6" />}
          variant="accent"
        />
        <DashboardCard
          title="Briefings Enviados"
          value={stats.briefingsSent}
          icon={<FileText className="w-6 h-6" />}
        />
        <DashboardCard
          title="Mensagens"
          value={stats.messagesUnread}
          icon={<MessageSquare className="w-6 h-6" />}
        />
      </div>

      {/* Ações Rápidas */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/briefing"
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl',
              'bg-accent-primary/10 border border-accent-primary/30',
              'hover:bg-accent-primary/20 transition-colors group'
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-accent-primary flex items-center justify-center text-white">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-neutral-white group-hover:text-accent-primary transition-colors">
                Enviar Briefing
              </div>
              <div className="text-xs text-neutral-gray">Iniciar novo projeto</div>
            </div>
          </Link>

          <Link
            href="/precos"
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl',
              'bg-dark-bg-secondary border border-neutral-gray/20',
              'hover:border-accent-primary/30 transition-colors group'
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-neutral-gray/20 flex items-center justify-center text-neutral-gray group-hover:text-accent-primary transition-colors">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-neutral-white">Ver Preços</div>
              <div className="text-xs text-neutral-gray">Conheça nossos planos</div>
            </div>
          </Link>

          <Link
            href="/projetos"
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl',
              'bg-dark-bg-secondary border border-neutral-gray/20',
              'hover:border-accent-primary/30 transition-colors group'
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-neutral-gray/20 flex items-center justify-center text-neutral-gray group-hover:text-accent-primary transition-colors">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-neutral-white">Meus Projetos</div>
              <div className="text-xs text-neutral-gray">Ver todos os projetos</div>
            </div>
          </Link>

          <Link
            href="/suporte"
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl',
              'bg-dark-bg-secondary border border-neutral-gray/20',
              'hover:border-accent-primary/30 transition-colors group'
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-neutral-gray/20 flex items-center justify-center text-neutral-gray group-hover:text-accent-primary transition-colors">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-neutral-white">Suporte</div>
              <div className="text-xs text-neutral-gray">Fale conosco</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Projetos Ativos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-white">Projetos Ativos</h3>
          {hasProjects && (
            <Link
              href="/projetos"
              className="flex items-center gap-1 text-sm text-accent-primary hover:text-accent-secondary transition-colors"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {hasProjects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {activeProjects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} variant="compact" />
            ))}
          </div>
        ) : (
          <Card variant="dashed" className="py-12">
            <EmptyState
              icon={<Rocket className="w-full h-full" />}
              title="Nenhum projeto ativo"
              description="Envie um briefing para iniciar seu primeiro projeto conosco. Nossa equipe está pronta para transformar sua ideia em realidade."
              actionLabel="Enviar Briefing"
              actionHref="/briefing"
            />
          </Card>
        )}

        {/* Mostrar indicador se há mais projetos */}
        {activeProjects.length > 3 && (
          <div className="text-center mt-4">
            <Link
              href="/projetos"
              className="inline-flex items-center gap-2 text-sm text-neutral-gray hover:text-accent-primary transition-colors"
            >
              E mais {activeProjects.length - 3} projeto{activeProjects.length - 3 > 1 ? 's' : ''}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
