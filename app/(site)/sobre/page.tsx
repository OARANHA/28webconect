import type { Metadata } from 'next';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import StructuredData, { createOrganizationSchema } from '@/components/seo/StructuredData';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Sobre Nós',
  description:
    'Conheça a história da 28Web Connect. Especialistas em desenvolvimento web, ERP e soluções digitais para empresas desde 2020.',
  path: 'sobre',
  keywords: ['sobre', 'história', 'empresa', 'valores', 'missão', '28Web Connect'],
  type: 'website',
});

const values = [
  {
    title: 'Inovação',
    description:
      'Buscamos constantemente novas tecnologias e abordagens para entregar soluções de ponta aos nossos clientes.',
    icon: '💡',
  },
  {
    title: 'Qualidade',
    description:
      'Comprometimento com excelência em cada linha de código, cada design e cada interação com o cliente.',
    icon: '⭐',
  },
  {
    title: 'Transparência',
    description:
      'Comunicação clara e honesta. Sem surpresas, sem custos ocultos, apenas resultados reais.',
    icon: '🤝',
  },
  {
    title: 'Parceria',
    description:
      'Não somos apenas fornecedores, somos parceiros no crescimento do seu negócio. Seu sucesso é o nosso sucesso.',
    icon: '🚀',
  },
];

const milestones = [
  {
    year: '2020',
    title: 'Fundação',
    description:
      'A 28Web Connect nasceu da visão de democratizar o acesso à tecnologia para pequenas e médias empresas.',
  },
  {
    year: '2021',
    title: 'Especialização em ERP',
    description:
      'Lançamento dos sistemas 28Pro e 28Facil, focados em gestão empresarial para diferentes segmentos.',
  },
  {
    year: '2022',
    title: 'Expansão E-commerce',
    description: 'Integração com marketplaces e desenvolvimento de lojas virtuais completas.',
  },
  {
    year: '2023',
    title: 'Era da IA',
    description:
      'Implementação de agentes de inteligência artificial para atendimento e automação de processos.',
  },
  {
    year: '2024',
    title: 'Visão de Futuro',
    description:
      'Continuamos inovando para oferecer as melhores soluções tecnológicas aos nossos clientes.',
  },
];

export default function SobrePage() {
  return (
    <>
      {/* JSON-LD Structured Data - Organization schema is already in root layout */}

      {/* Hero Section */}
      <section className="pt-8 pb-16 md:pt-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-white mb-6">
                Transformando{' '}
                <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                  Ideias
                </span>{' '}
                em Soluções Digitais
              </h1>
              <p className="text-lg md:text-xl text-neutral-gray leading-relaxed">
                Na 28Web Connect, acreditamos que a tecnologia deve ser acessível a todos. Nossa
                missão é ajudar empresas de todos os tamanhos a aproveitarem o poder digital para
                crescer e prosperar.
              </p>
            </div>

            <div className="relative animate-fade-in">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Team illustration */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 rounded-3xl border-2 border-dashed border-accent-primary/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl">👨‍💻👩‍💻🚀</div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-dark-bg-secondary rounded-xl border-2 border-dashed border-neutral-gray/20 flex items-center justify-center">
                  <span className="text-3xl">💡</span>
                </div>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-dark-bg-secondary rounded-xl border-2 border-dashed border-neutral-gray/20 flex items-center justify-center">
                  <span className="text-3xl">🎯</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <Section title="Nossa História">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-primary to-accent-secondary md:-translate-x-1/2" />

          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.year}
                className={`relative flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-accent-primary rounded-full border-4 border-dark-bg md:-translate-x-1/2 z-10" />

                {/* Content */}
                <div
                  className={`ml-12 md:ml-0 md:w-1/2 ${
                    index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'
                  }`}
                >
                  <span className="text-accent-primary font-bold text-xl">{milestone.year}</span>
                  <h3 className="text-xl font-semibold text-neutral-white mt-2">
                    {milestone.title}
                  </h3>
                  <p className="text-neutral-gray mt-2">{milestone.description}</p>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block md:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Values Section */}
      <Section title="Nossos Valores" className="bg-dark-bg-secondary/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {values.map((value) => (
            <div key={value.title}>
              <Card variant="elevated" className="h-full">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-neutral-white mb-2">{value.title}</h3>
                <p className="text-neutral-gray">{value.description}</p>
              </Card>
            </div>
          ))}
        </div>
      </Section>

      {/* Mission Statement */}
      <Section>
        <div className="text-center max-w-3xl mx-auto animate-fade-in">
          <blockquote className="text-2xl md:text-3xl font-medium text-neutral-white italic leading-relaxed">
            "Nossa missão é <span className="text-accent-primary">democratizar a tecnologia</span>,
            oferecendo soluções digitais acessíveis e de qualidade para que empresas de todos os
            tamanhos possam competir no mundo digital."
          </blockquote>
          <p className="text-neutral-gray mt-6">— Equipe 28Web Connect</p>
        </div>
      </Section>
    </>
  );
}
