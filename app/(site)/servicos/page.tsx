import type { Metadata } from 'next';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { generateMetadata } from '@/lib/seo';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const ServiceCard = dynamic(() => import('@/components/site/ServiceCard'), {
  ssr: true,
  loading: () => (
    <div className="h-[600px] bg-neutral-dark/50 rounded-2xl border-2 border-dashed border-accent-primary/30 animate-pulse" />
  ),
});

export const metadata: Metadata = generateMetadata({
  title: 'Nossos Serviços',
  description:
    'Soluções completas em desenvolvimento web, ERP, e-commerce e agentes de IA. Escolha o plano ideal para o seu negócio.',
  path: 'servicos',
  keywords: ['ERP', 'e-commerce', 'desenvolvimento web', 'IA', 'marketplace', 'sistemas'],
  type: 'website',
});

const services = [
  {
    title: 'ERP Cloud Básico',
    description: 'Gestão empresarial completa na nuvem para pequenas e médias empresas',
    icon: '📊',
    features: [
      'Módulo Financeiro (contas a pagar/receber)',
      'Controle de Estoque',
      'Gestão de Vendas e Pedidos',
      'Relatórios Gerenciais',
      'Acesso Multi-usuário',
      'Backup Automático',
    ],
    highlight: 'Ideal para começar a digitalizar seu negócio',
  },
  {
    title: 'ERP + E-commerce + Marketplace',
    description: 'Solução completa com loja online e integração com principais marketplaces',
    icon: '🛒',
    features: [
      'Todos os recursos do ERP Básico',
      'Loja Online Completa',
      'Integração Mercado Livre',
      'Integração Shopee',
      'Integração Amazon',
      'Sincronização Automática de Estoque',
    ],
    highlight: 'Venda em múltiplos canais com estoque unificado',
  },
  {
    title: 'ERP Premium + Marketplace',
    description: 'Solução enterprise com business intelligence e recursos avançados',
    icon: '💎',
    features: [
      'Todos os recursos do plano anterior',
      'Multi-empresa (gestão centralizada)',
      'Business Intelligence (BI)',
      'Dashboards Personalizados',
      'Integrações Ilimitadas',
      'API Completa',
      'Suporte Prioritário 24/7',
    ],
    highlight: 'Para empresas que precisam de máxima performance',
  },
  {
    title: 'Landing Page + Agente IA',
    description: 'Site institucional moderno com chat inteligente para atendimento 24/7',
    icon: '🤖',
    features: [
      'Design Responsivo Premium',
      'Chat IA Mistral (RAG)',
      'Formulário de Contato',
      'SEO Otimizado',
      'Analytics Integrado',
      'Hospedagem Inclusa',
    ],
    highlight: 'Atendimento inteligente que nunca dorme',
  },
  {
    title: 'Landing + IA + WhatsApp',
    description: 'Presença digital completa com integração WhatsApp Business API',
    icon: '💬',
    features: [
      'Todos os recursos do plano anterior',
      'WhatsApp Business API',
      'Chatbot WhatsApp',
      'Automação de Mensagens',
      'Múltiplos Atendentes',
      'Relatórios de Conversas',
    ],
    highlight: 'Centralize todo seu atendimento digital',
  },
];

export default function ServicosPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-8 pb-16 md:pt-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-white mb-6">
              Nossos{' '}
              <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                Serviços
              </span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-gray">
              Soluções completas para impulsionar seu negócio no mundo digital. Escolha o plano que
              melhor atende às suas necessidades.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <Section className="py-0">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {services.map((service, index) => (
                <div
                  key={service.title}
                  className="h-[600px] bg-neutral-dark/50 rounded-2xl border-2 border-dashed border-accent-primary/30 animate-pulse"
                />
              ))}
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <ServiceCard key={service.title} {...service} index={index} />
            ))}
          </div>
        </Suspense>
      </Section>

      {/* CTA Section */}
      <Section className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl p-8 md:p-16 border-2 border-dashed border-accent-primary/30">
          <div className="text-center max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-white mb-4">
              Não tem certeza qual o melhor plano?
            </h2>
            <p className="text-lg text-neutral-gray mb-8">
              Entre em contato conosco para uma consultoria gratuita. Vamos entender suas
              necessidades e recomendar a melhor solução.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contato">
                <Button variant="primary" size="lg">
                  Falar com Especialista
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="ghost" size="lg">
                  Ver Perguntas Frequentes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
