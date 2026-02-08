import { Metadata } from 'next';
import { getServerSession } from '@/lib/auth-utils';
import { getPricingPlans } from '@/app/actions/pricing';
import PricingCard from '@/components/pricing/PricingCard';
import Link from 'next/link';
import {
  Lock,
  LogIn,
  UserPlus,
  CheckCircle,
  FileText,
  LineChart,
  Bot,
  DollarSign,
  Info,
} from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Planos e Preços - 28Web Connect',
  description:
    'Conheça nossos planos de ERP, E-commerce e Landing Pages com IA. Crie uma conta para acessar preços exclusivos.',
  alternates: {
    canonical: '/precos',
  },
};

/**
 * Página de Preços Unificada
 * Detecta sessão do usuário e renderiza conteúdo apropriado:
 * - Usuário logado: mostra planos de preços com CTA para briefing
 * - Usuário não logado: mostra página de bloqueio com call-to-action
 */
export default async function PricingPage() {
  // Verificar se usuário está logado
  const session = await getServerSession();
  const isAuthenticated = !!session?.user;

  // Buscar planos apenas se usuário estiver logado
  const plans = isAuthenticated ? await getPricingPlans() : [];

  // Conteúdo para usuários NÃO logados (página de bloqueio)
  if (!isAuthenticated) {
    const benefits = [
      {
        icon: FileText,
        title: 'Acesso à tabela de preços completa',
        description: 'Veja todos os planos e funcionalidades detalhadas',
      },
      {
        icon: LineChart,
        title: 'Envio de briefing personalizado',
        description: 'Conte-nos sobre seu projeto e receba uma proposta',
      },
      {
        icon: CheckCircle,
        title: 'Acompanhamento de projetos',
        description: 'Acompanhe o progresso do seu projeto em tempo real',
      },
      {
        icon: Bot,
        title: 'Chat com IA 24/7',
        description: 'Tire dúvidas e receba suporte a qualquer momento',
      },
    ];

    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="max-w-4xl mx-auto px-4 text-center">
            {/* Ícone de Cadeado */}
            <div className="inline-flex items-center justify-center p-4 bg-accent-primary/10 rounded-full mb-6">
              <Lock className="w-10 h-10 text-accent-primary" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-neutral-white mb-6">
              Conheça Nossos Planos
            </h1>

            <p className="text-xl text-neutral-gray mb-8 max-w-2xl mx-auto">
              Faça login para visualizar preços e detalhes completos dos nossos planos de ERP,
              E-commerce e Landing Pages com IA.
            </p>

            {/* Botões CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button variant="primary" size="lg">
                  <LogIn className="w-5 h-5 mr-2" />
                  Fazer Login
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button variant="secondary" size="lg">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Criar Conta Grátis
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Seção de Benefícios */}
        <section className="py-16 bg-dark-bg-secondary border-y border-neutral-gray/10">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-white text-center mb-12">
              Por que criar uma conta?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-accent-primary/10 rounded-full mb-4">
                      <Icon className="w-6 h-6 text-accent-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-neutral-gray">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Seção de Planos Preview (Sem Preços) */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-white text-center mb-4">
              Nossas Soluções
            </h2>
            <p className="text-neutral-gray text-center mb-12 max-w-2xl mx-auto">
              Oferecemos soluções completas para diferentes necessidades de negócio
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ERP */}
              <div className="p-6 bg-dark-bg-secondary rounded-xl border border-neutral-gray/10">
                <h3 className="text-xl font-bold text-neutral-white mb-2">ERP</h3>
                <p className="text-neutral-gray mb-4">
                  Sistemas de gestão empresarial completos com controle de estoque, financeiro e
                  relatórios.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-neutral-light">
                    <CheckCircle className="w-4 h-4 text-accent-primary" />
                    ERP Básico
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-light">
                    <CheckCircle className="w-4 h-4 text-accent-primary" />
                    ERP + E-commerce
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-light">
                    <CheckCircle className="w-4 h-4 text-accent-primary" />
                    ERP Premium
                  </li>
                </ul>
              </div>

              {/* Landing Pages */}
              <div className="p-6 bg-dark-bg-secondary rounded-xl border border-neutral-gray/10">
                <h3 className="text-xl font-bold text-neutral-white mb-2">Landing Pages</h3>
                <p className="text-neutral-gray mb-4">
                  Páginas de alta conversão com copy gerada por IA e design otimizado.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-neutral-light">
                    <CheckCircle className="w-4 h-4 text-accent-primary" />
                    Landing Page IA
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-light">
                    <CheckCircle className="w-4 h-4 text-accent-primary" />
                    Landing + WhatsApp Bot
                  </li>
                </ul>
              </div>

              {/* Suporte */}
              <div className="p-6 bg-dark-bg-secondary rounded-xl border border-neutral-gray/10">
                <h3 className="text-xl font-bold text-neutral-white mb-2">Suporte Completo</h3>
                <p className="text-neutral-gray mb-4">
                  Todos os planos incluem suporte técnico e acesso ao nosso chat com IA 24/7.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-neutral-light">
                    <CheckCircle className="w-4 h-4 text-accent-primary" />
                    Suporte técnico
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-light">
                    <CheckCircle className="w-4 h-4 text-accent-primary" />
                    Chat com IA 24/7
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-light">
                    <CheckCircle className="w-4 h-4 text-accent-primary" />
                    Atualizações inclusas
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-neutral-white mb-4">Pronto para começar?</h2>
            <p className="text-neutral-gray mb-8">
              Crie sua conta gratuitamente e tenha acesso completo à nossa tabela de preços.
            </p>
            <Link href="/cadastro">
              <Button variant="primary" size="lg">
                <UserPlus className="w-5 h-5 mr-2" />
                Criar Conta Grátis
              </Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // Conteúdo para usuários LOGADOS (página de preços)
  return (
    <div className="max-w-7xl mx-auto py-10">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-accent-primary/10 rounded-full mb-4">
          <DollarSign className="w-6 h-6 text-accent-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-white mb-4">
          Nossos Planos e Preços
        </h1>
        <p className="text-lg text-neutral-gray max-w-2xl mx-auto">
          Escolha o plano ideal para o seu negócio. Soluções completas em ERP, E-commerce e Landing
          Pages com IA.
        </p>
      </div>

      {/* Grid de Planos */}
      {plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} variant="client" />
          ))}
        </div>
      ) : (
        /* Estado Vazio */
        <div className="text-center py-16 bg-dark-bg-secondary rounded-xl border border-neutral-gray/10">
          <Info className="w-12 h-12 text-neutral-gray mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-white mb-2">
            Nenhum plano disponível no momento
          </h3>
          <p className="text-neutral-gray max-w-md mx-auto">
            Estamos preparando novos planos para você. Entre em contato conosco para mais
            informações.
          </p>
        </div>
      )}

      {/* Nota de rodapé */}
      <div className="mt-12 text-center">
        <p className="text-sm text-neutral-gray">
          Todos os preços estão em Reais (BRL) e podem ser parcelados no cartão de crédito.
          <br />
          Precisa de um plano personalizado?{' '}
          <a href="/contato" className="text-accent-primary hover:underline">
            Entre em contato
          </a>
        </p>
      </div>
    </div>
  );
}
