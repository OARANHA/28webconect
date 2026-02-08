'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

/**
 * Hero Section da página inicial
 * Usa animações CSS ao invés de framer-motion para melhor performance
 */
export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="min-h-[calc(100vh-5rem)] flex items-center relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Coluna Esquerda - Texto */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-neutral-white">Transforme Sua</span>
              <br />
              <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                Presença Digital
              </span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-gray max-w-xl">
              Especialistas em desenvolvimento web, sistemas ERP, e-commerce e agentes de IA para
              impulsionar seu negócio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/cadastro" prefetch={true}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Criar Conta
                </Button>
              </Link>
              <Link
                href="/servicos"
                prefetch={false}
                onMouseEnter={() => {
                  // Prefetch manual via API do Next.js
                  router.prefetch('/servicos');
                }}
              >
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                  Conheça Nossos Serviços
                </Button>
              </Link>
            </div>
          </div>

          {/* Coluna Direita - Ilustração */}
          <div className="relative hidden lg:block animate-fade-in animation-delay-200">
            <div className="relative">
              {/* Elementos visuais orgânicos com animação CSS */}
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Círculo principal */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 rounded-full border-2 border-dashed border-accent-primary/30" />

                {/* Elementos decorativos com animação flutuante CSS */}
                <div className="absolute top-1/4 left-0 w-24 h-24 bg-accent-primary/10 rounded-full border border-accent-primary/20 animate-float" />
                <div
                  className="absolute bottom-1/4 right-0 w-32 h-32 bg-accent-secondary/10 rounded-full border border-accent-secondary/20 animate-float"
                  style={{ animationDelay: '1s' }}
                />
                <div
                  className="absolute top-0 right-1/4 w-16 h-16 bg-dark-bg-secondary rounded-xl border-2 border-dashed border-neutral-gray/20 flex items-center justify-center animate-float"
                  style={{ animationDelay: '0.5s' }}
                >
                  <span className="text-2xl">💻</span>
                </div>
                <div
                  className="absolute bottom-0 left-1/4 w-20 h-20 bg-dark-bg-secondary rounded-xl border-2 border-dashed border-neutral-gray/20 flex items-center justify-center animate-float"
                  style={{ animationDelay: '1.5s' }}
                >
                  <span className="text-2xl">🚀</span>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-dark-bg-secondary rounded-2xl border-2 border-dashed border-accent-primary/30 flex items-center justify-center animate-pulse-slow">
                  <span className="text-5xl">🌐</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent-primary/5 to-transparent pointer-events-none" />
    </section>
  );
}
