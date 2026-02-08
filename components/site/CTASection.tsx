'use client';

import Link from 'next/link';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';

/**
 * Seção de Call-to-Action da home
 */
export default function CTASection() {
  return (
    <Section className="relative overflow-hidden">
      <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl p-8 md:p-16 border-2 border-dashed border-accent-primary/30">
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-lg text-neutral-gray mb-8">
            Crie sua conta gratuita e dê o primeiro passo para transformar sua presença digital.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro" prefetch={true}>
              <Button variant="primary" size="lg">
                Criar Conta Grátis
              </Button>
            </Link>
            <Link href="/contato" prefetch={false}>
              <Button variant="outline" size="lg">
                Falar com Especialista
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
