import type { Metadata } from 'next';
import Section from '@/components/ui/Section';
import FAQAccordion from '@/components/site/FAQAccordion';
import EventTracker from '@/components/analytics/EventTracker';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import StructuredData from '@/components/seo/StructuredData';
import { createFAQPageSchema } from '@/lib/seo';
import { generateMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = generateMetadata({
  title: 'Perguntas Frequentes',
  description:
    'Tire suas dúvidas sobre nossos serviços, processo de desenvolvimento, tecnologias utilizadas e mais.',
  path: 'faq',
  keywords: ['FAQ', 'perguntas frequentes', 'dúvidas', 'ajuda', 'suporte'],
  type: 'website',
});

const faqs = [
  // Categoria: Serviços
  {
    category: 'Serviços',
    question: 'O que é um sistema ERP?',
    answer:
      'ERP (Enterprise Resource Planning) é um sistema que integra todos os processos da sua empresa em uma única plataforma: financeiro, estoque, vendas, compras e muito mais. Nossos sistemas ERP são desenvolvidos na nuvem, permitindo acesso de qualquer lugar, com backups automáticos e atualizações constantes.',
  },
  {
    category: 'Serviços',
    question: 'Qual a diferença entre os planos de ERP?',
    answer:
      'O ERP Básico tem módulos essenciais para gestão empresarial (financeiro, estoque, vendas). O ERP + E-commerce adiciona loja online e integração com marketplaces (Mercado Livre, Shopee, Amazon). O ERP Premium inclui recursos avançados como multi-empresa, business intelligence, dashboards personalizados e suporte prioritário 24/7.',
  },
  {
    category: 'Serviços',
    question: 'Posso personalizar o sistema?',
    answer:
      'Sim! Todos os nossos sistemas são customizáveis para atender as necessidades específicas do seu negócio. Durante o processo de briefing, entendemos suas necessidades e adaptamos o sistema com campos personalizados, relatórios específicos, integrações e fluxos de trabalho sob medida.',
  },
  // Categoria: Processo
  {
    category: 'Processo',
    question: 'Como funciona o processo de briefing?',
    answer:
      'Após criar sua conta em nossa plataforma, você preenche um formulário detalhado sobre seu projeto, incluindo objetivos, requisitos, prazos e orçamento. Nossa equipe analisa todas as informações e retorna com uma proposta personalizada em até 48 horas úteis.',
  },
  {
    category: 'Processo',
    question: 'Quanto tempo leva para desenvolver?',
    answer:
      'O prazo depende da complexidade do projeto. Landing pages geralmente levam 2-3 semanas. Sistemas ERP básicos levam 1-2 meses. Projetos mais complexos, como ERP Premium com integrações, podem levar 3-6 meses. Fornecemos uma timeline detalhada na proposta.',
  },
  {
    category: 'Processo',
    question: 'Como acompanho o andamento do meu projeto?',
    answer:
      'Através do portal do cliente, você tem acesso a uma timeline visual em tempo real, pode acompanhar o progresso de cada etapa, enviar arquivos, trocar mensagens com a equipe e visualizar relatórios de produtividade. Também enviamos atualizações semanais por email.',
  },
  // Categoria: Técnico
  {
    category: 'Técnico',
    question: 'Quais tecnologias vocês utilizam?',
    answer:
      'Utilizamos as tecnologias mais modernas do mercado: Next.js e React para frontend, TypeScript para tipagem segura, PostgreSQL e Prisma ORM para banco de dados, Mistral AI para agentes inteligentes, Tailwind CSS para estilização, e Node.js para backend. Todas as nossas soluções são desenvolvidas com foco em performance e segurança.',
  },
  {
    category: 'Técnico',
    question: 'Meus dados estão seguros?',
    answer:
      'Sim! Segurança é nossa prioridade. Utilizamos criptografia SSL/TLS para todas as comunicações, backups automáticos diários, conformidade total com a LGPD (Lei Geral de Proteção de Dados), hospedagem em servidores seguros com certificações internacionais, e práticas de desenvolvimento seguro (OWASP).',
  },
  {
    category: 'Técnico',
    question: 'Vocês oferecem suporte técnico?',
    answer:
      'Sim! Todos os planos incluem suporte técnico. O plano ERP Básico inclui suporte por email em horário comercial. O plano ERP + E-commerce inclui suporte prioritário por email e chat. O ERP Premium oferece suporte 24/7 por email, chat e telefone, com tempo de resposta garantido.',
  },
  // Categoria: Comercial
  {
    category: 'Comercial',
    question: 'Como funciona o pagamento?',
    answer:
      'Após aprovação do briefing, enviamos uma proposta detalhada com valores e condições. Aceitamos pagamento à vista com desconto ou parcelado em até 12x no cartão de crédito. Para projetos grandes, trabalhamos com pagamentos parcelados conforme entregas de etapas.',
  },
  {
    category: 'Comercial',
    question: 'Existe contrato de fidelidade?',
    answer:
      'Não! Você pode cancelar quando quiser, sem multas ou taxas de rescisão. Acreditamos que nossa qualidade e serviço falam por si. Recomendamos, no entanto, um período mínimo de 12 meses para obter o melhor retorno sobre investimento.',
  },
  {
    category: 'Comercial',
    question: 'Vocês oferecem garantia?',
    answer:
      'Sim! Oferecemos 90 dias de garantia para correção de bugs e pequenos ajustes após a entrega final do projeto. Isso não inclui novas funcionalidades, apenas o que foi acordado no escopo original. Após esse período, oferecemos planos de manutenção mensal.',
  },
];

export default function FAQPage() {
  return (
    <>
      <EventTracker event="faq_acessada" trigger="mount" />
      {/* JSON-LD Structured Data */}
      <StructuredData data={createFAQPageSchema(faqs)} />

      {/* Hero Section */}
      <section className="pt-8 pb-16 md:pt-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-white mb-6">
              Tire Suas{' '}
              <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                Dúvidas
              </span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-gray">
              Encontre respostas para as perguntas mais frequentes sobre nossos serviços, processo
              de desenvolvimento e suporte.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Section className="py-0">
        <div className="max-w-3xl mx-auto">
          <FAQAccordion faqs={faqs} />
        </div>
      </Section>

      {/* CTA Section */}
      <Section>
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl p-8 md:p-12 border-2 border-dashed border-accent-primary/30">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-white mb-4">
              Não encontrou sua resposta?
            </h2>
            <p className="text-neutral-gray mb-6">
              Nossa equipe está pronta para ajudar. Entre em contato conosco e responderemos em até
              24 horas úteis.
            </p>
            <Link href="/contato">
              <Button variant="primary" size="lg">
                Entrar em Contato
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
