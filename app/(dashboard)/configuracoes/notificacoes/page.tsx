import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireEmailVerified } from '@/lib/auth-utils';
import { getNotificationPreferences } from '@/app/actions/notifications';
import { NotificationPreferences } from '@/components/settings/NotificationPreferences';

export const metadata: Metadata = {
  title: 'Preferências de Notificações | 28Web Connect',
  description: 'Configure suas preferências de notificações',
};

/**
 * Página de preferências de notificações - Server Component
 */
export default async function NotificacoesConfigPage() {
  const session = await requireEmailVerified();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const result = await getNotificationPreferences(session.user.id);
  const preferences = result.success && result.data ? result.data : [];

  return (
    <div className="container max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-neutral-gray">
        <span className="hover:text-neutral-white transition-colors">
          <a href="/configuracoes">Configurações</a>
        </span>
        <span className="mx-2">&gt;</span>
        <span className="text-neutral-white">Notificações</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-white">Preferências de Notificações</h1>
        <p className="text-neutral-gray mt-1">
          Configure como deseja receber notificações para cada tipo de evento
        </p>
      </div>

      {/* Componente de preferências */}
      <NotificationPreferences initialPreferences={preferences} userId={session.user.id} />
    </div>
  );
}
