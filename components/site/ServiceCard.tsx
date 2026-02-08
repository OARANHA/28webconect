'use client';

import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

interface ServiceCardProps {
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  highlight: string;
  index: number;
  onView?: (serviceTitle: string) => void;
}

/**
 * Card de serviço com ilustração doodle e informações detalhadas
 */
export default function ServiceCard({
  title,
  description,
  features,
  icon,
  highlight,
  index,
  onView,
}: ServiceCardProps) {
  // Doodle elements based on index
  const doodleElements = [
    // ERP Básico - Gráficos
    <div key="doodle-0" className="absolute -top-2 -right-2 w-16 h-16 opacity-20">
      <svg viewBox="0 0 100 100" className="w-full h-full text-accent-primary">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        <path d="M30 50 L40 70 L60 30 L70 50" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>,
    // ERP + E-commerce - Carrinho
    <div key="doodle-1" className="absolute -top-3 -right-3 w-20 h-20 opacity-20">
      <svg viewBox="0 0 100 100" className="w-full h-full text-accent-primary">
        <rect
          x="20"
          y="40"
          width="60"
          height="40"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4,4"
        />
        <circle cx="35" cy="90" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="70" cy="90" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          d="M10 30 L20 40 M90 30 L80 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="3,3"
        />
      </svg>
    </div>,
    // ERP Premium - Premium/Diamond
    <div key="doodle-2" className="absolute -top-2 -right-2 w-16 h-16 opacity-20">
      <svg viewBox="0 0 100 100" className="w-full h-full text-accent-primary">
        <path
          d="M50 10 L90 50 L50 90 L10 50 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4,4"
        />
        <path d="M50 10 L50 90 M10 50 L90 50" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="50" r="5" fill="currentColor" />
      </svg>
    </div>,
    // Landing + IA - Chatbot
    <div key="doodle-3" className="absolute -top-3 -right-3 w-20 h-20 opacity-20">
      <svg viewBox="0 0 100 100" className="w-full h-full text-accent-primary">
        <rect
          x="10"
          y="20"
          width="80"
          height="50"
          rx="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4,4"
        />
        <circle cx="35" cy="45" r="5" fill="currentColor" />
        <circle cx="50" cy="45" r="5" fill="currentColor" />
        <circle cx="65" cy="45" r="5" fill="currentColor" />
        <path d="M30 70 L20 85 L40 70" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>,
    // Landing + IA + WhatsApp - Mensagens
    <div key="doodle-4" className="absolute -top-2 -right-2 w-16 h-16 opacity-20">
      <svg viewBox="0 0 100 100" className="w-full h-full text-accent-primary">
        <rect
          x="10"
          y="25"
          width="60"
          height="35"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="3,3"
        />
        <rect
          x="30"
          y="40"
          width="60"
          height="35"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M20 60 L10 75 L30 60" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card variant="dashed" className="h-full relative overflow-hidden group">
        {/* Doodle Illustration */}
        {doodleElements[index]}

        <div className="space-y-5 relative z-10">
          {/* Icon */}
          <div className="w-16 h-16 bg-accent-primary/20 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-bold text-neutral-white">{title}</h3>

          {/* Description */}
          <p className="text-neutral-gray leading-relaxed">{description}</p>

          {/* Features */}
          <ul className="space-y-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-accent-primary mt-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <span className="text-neutral-gray text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Highlight Badge */}
          <div className="pt-4">
            <span
              className={cn(
                'inline-block bg-accent-primary/10 text-accent-primary',
                'text-sm font-medium px-4 py-2 rounded-full',
                'border border-accent-primary/20'
              )}
            >
              ✨ {highlight}
            </span>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                trackEvent(AnalyticsEvents.SERVICO_VISUALIZADO, { servico: title });
                onView?.(title);
              }}
            >
              Saber mais →
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
