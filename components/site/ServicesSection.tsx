'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Section from '@/components/ui/Section';

const services = [
  {
    title: 'Sistemas ERP',
    description: 'Gestão completa do seu negócio com sistemas integrados sob medida.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    title: 'E-commerce',
    description: 'Lojas online completas com pagamento, estoque e gestão de pedidos.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
  },
  {
    title: 'Agentes de IA',
    description: 'Automação inteligente com agentes de IA para otimizar seus processos.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

/**
 * Seção de serviços da home
 * Cards com animações CSS stagger
 */
export default function ServicesSection() {
  return (
    <Section
      title="Nossos Serviços"
      subtitle="Soluções completas para impulsionar seu negócio no mundo digital"
      id="servicos"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div
            key={service.title}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Card variant="dashed" className="h-full group">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-accent-primary/20 rounded-xl flex items-center justify-center text-accent-primary group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-neutral-white">{service.title}</h3>
                <p className="text-neutral-gray leading-relaxed">{service.description}</p>
                <Link
                  href="/servicos"
                  prefetch={false}
                  className="inline-flex items-center gap-2 text-accent-primary hover:text-accent-secondary transition-colors group/link"
                >
                  Saiba Mais
                  <svg
                    className="w-4 h-4 group-hover/link:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </Section>
  );
}
