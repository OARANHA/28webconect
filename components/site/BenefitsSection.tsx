'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';

const benefits = [
  {
    title: 'Atendimento Personalizado',
    description:
      'Cada projeto é único. Trabalhamos próximo ao cliente para entender e atender suas necessidades.',
    icon: '🤝',
  },
  {
    title: 'Tecnologia de Ponta',
    description:
      'Utilizamos as mais recentes tecnologias para garantir performance, segurança e escalabilidade.',
    icon: '🚀',
  },
  {
    title: 'Suporte Contínuo',
    description: 'Acompanhamento pós-entrega com suporte técnico e manutenção preventiva.',
    icon: '🛠️',
  },
  {
    title: 'Preço Justo',
    description: 'Orçamento transparente sem surpresas. Soluções que cabem no seu bolso.',
    icon: '💰',
  },
];

/**
 * Seção de benefícios da home
 * Grid responsivo com animações CSS
 */
export default function BenefitsSection() {
  return (
    <Section className="bg-dark-bg-secondary/50">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Coluna Esquerda - Texto */}
        <div className="animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-white mb-6">
            Por que escolher a <span className="text-accent-primary">28Web Connect</span>?
          </h2>
          <p className="text-lg text-neutral-gray mb-8">
            Combinamos expertise técnica com criatividade para entregar soluções que fazem a
            diferença no seu negócio.
          </p>
          <Link href="/sobre" prefetch={false}>
            <Button variant="primary" size="lg">
              Conheça Nossa História
            </Button>
          </Link>
        </div>

        {/* Coluna Direita - Grid de benefícios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card variant="elevated" className="h-full">
                <div className="text-3xl mb-3">{benefit.icon}</div>
                <h3 className="font-semibold text-neutral-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-neutral-gray">{benefit.description}</p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
