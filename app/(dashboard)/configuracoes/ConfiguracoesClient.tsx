'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User } from 'next-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { PrivacySettings } from '@/components/settings/PrivacySettings';
import { User as UserIcon, Shield, Lock, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfiguracoesClientProps {
  user: User & { marketingConsent: boolean };
}

const tabs = [
  {
    id: 'perfil',
    label: 'Perfil',
    icon: UserIcon,
  },
  {
    id: 'seguranca',
    label: 'Segurança',
    icon: Lock,
  },
  {
    id: 'privacidade',
    label: 'Privacidade',
    icon: Shield,
  },
  {
    id: 'notificacoes',
    label: 'Notificações',
    icon: Bell,
    href: '/configuracoes/notificacoes',
  },
];

export function ConfiguracoesClient({ user }: ConfiguracoesClientProps) {
  const [activeTab, setActiveTab] = useState('perfil');

  return (
    <div className="container max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-neutral-gray">
        <span className="hover:text-neutral-white transition-colors">
          <Link href="/dashboard">Dashboard</Link>
        </span>
        <span className="mx-2">&gt;</span>
        <span className="text-neutral-white">Configurações</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-white">Configurações da Conta</h1>
        <p className="text-neutral-gray mt-1">
          Gerencie suas informações pessoais, segurança e privacidade
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tabs List - Desktop: horizontal, Mobile: scrollable */}
        <TabsList className="w-full justify-start bg-dark-bg-secondary border border-neutral-gray/10 p-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            // Se for notificações, renderizar como Link
            if (tab.href) {
              return (
                <Link key={tab.id} href={tab.href} className="contents">
                  <TabsTrigger
                    value={tab.id}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-md transition-all',
                      'data-[state=active]:bg-accent-primary data-[state=active]:text-white',
                      'data-[state=inactive]:text-neutral-gray data-[state=inactive]:hover:text-neutral-white'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label}</span>
                  </TabsTrigger>
                </Link>
              );
            }

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md transition-all whitespace-nowrap',
                  'data-[state=active]:bg-accent-primary data-[state=active]:text-white',
                  'data-[state=inactive]:text-neutral-gray data-[state=inactive]:hover:text-neutral-white'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="perfil" className="mt-6">
          <div className="bg-dark-bg-secondary border border-neutral-gray/10 rounded-lg p-6">
            <ProfileSettings initialData={user} />
          </div>
        </TabsContent>

        <TabsContent value="seguranca" className="mt-6">
          <div className="bg-dark-bg-secondary border border-neutral-gray/10 rounded-lg p-6">
            <SecuritySettings userId={user.id} />
          </div>
        </TabsContent>

        <TabsContent value="privacidade" className="mt-6">
          <div className="bg-dark-bg-secondary border border-neutral-gray/10 rounded-lg p-6">
            <PrivacySettings userId={user.id} marketingConsent={user.marketingConsent} />
          </div>
        </TabsContent>

        <TabsContent value="notificacoes" className="mt-6">
          <div className="bg-dark-bg-secondary border border-neutral-gray/10 rounded-lg p-6">
            <p className="text-neutral-gray text-center py-8">
              Redirecionando para página de notificações...
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
