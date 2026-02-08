'use client';

import Link from 'next/link';
import { Check, Edit, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { PricingPlan, ServiceType } from '@prisma/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface PricingCardProps {
  plan: PricingPlan;
  variant?: 'client' | 'admin';
  onEdit?: (plan: PricingPlan) => void;
  onToggleActive?: (planId: string) => void;
}

/**
 * Formata o preço em reais brasileiros
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(price);
}

/**
 * Retorna o label do tipo de serviço
 */
function getServiceTypeLabel(serviceType: ServiceType): string {
  const labels: Record<ServiceType, string> = {
    [ServiceType.ERP_BASICO]: 'ERP Básico',
    [ServiceType.ERP_ECOMMERCE]: 'ERP + E-commerce',
    [ServiceType.ERP_PREMIUM]: 'ERP Premium',
    [ServiceType.LANDING_IA]: 'Landing Page IA',
    [ServiceType.LANDING_IA_WHATSAPP]: 'Landing IA + WhatsApp',
  };
  return labels[serviceType] || serviceType;
}

/**
 * Retorna a descrição do tipo de serviço
 */
function getServiceTypeDescription(serviceType: ServiceType): string {
  const descriptions: Record<ServiceType, string> = {
    [ServiceType.ERP_BASICO]: 'Gestão empresarial essencial',
    [ServiceType.ERP_ECOMMERCE]: 'Integração completa com loja virtual',
    [ServiceType.ERP_PREMIUM]: 'Solução completa personalizada',
    [ServiceType.LANDING_IA]: 'Página de alta conversão com IA',
    [ServiceType.LANDING_IA_WHATSAPP]: 'Landing page com bot WhatsApp',
  };
  return descriptions[serviceType] || '';
}

/**
 * Verifica se é serviço de landing page (investimento único)
 */
function isLandingService(serviceType: ServiceType): boolean {
  return serviceType === ServiceType.LANDING_IA || serviceType === ServiceType.LANDING_IA_WHATSAPP;
}

/**
 * Componente de Card de Preço
 * Exibe informações de um plano de preços
 * Variantes: 'client' para visualização do cliente, 'admin' para gestão
 */
export default function PricingCard({
  plan,
  variant = 'client',
  onEdit,
  onToggleActive,
}: PricingCardProps) {
  const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];

  const handleEdit = () => {
    if (onEdit) {
      onEdit(plan);
    }
  };

  const handleToggle = () => {
    if (onToggleActive) {
      onToggleActive(plan.id);
    }
  };

  // Variante Cliente
  if (variant === 'client') {
    return (
      <Card variant="elevated" className="h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-neutral-white mb-2">{plan.name}</h3>
          <p className="text-sm text-neutral-gray">{getServiceTypeDescription(plan.serviceType)}</p>
        </div>

        {/* Preço */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-accent-primary">
            {formatPrice(Number(plan.price))}
          </div>
          <p className="text-sm text-neutral-gray mt-1">
            {isLandingService(plan.serviceType) ? 'investimento único' : 'por mês'}
          </p>
        </div>

        {/* Storage Badge */}
        <div className="flex justify-center mb-6">
          <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-sm font-medium">
            {plan.storageLimit} GB de armazenamento
          </span>
        </div>

        {/* Features */}
        <div className="flex-1 mb-6">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
                <span className="text-neutral-light text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <Link href={`/briefing?service=${plan.serviceType}`}>
          <Button variant="primary" className="w-full">
            Enviar Briefing
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </Card>
    );
  }

  // Variante Admin
  return (
    <Card
      variant={plan.isActive ? 'default' : 'dashed'}
      className={`h-full flex flex-col ${!plan.isActive ? 'opacity-75' : ''}`}
    >
      {/* Header com Ordem */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-neutral-white">{plan.name}</h3>
          <p className="text-xs text-neutral-gray">{getServiceTypeLabel(plan.serviceType)}</p>
        </div>
        <span className="text-xs text-neutral-gray bg-neutral-gray/10 px-2 py-1 rounded">
          #{plan.order + 1}
        </span>
      </div>

      {/* Preço */}
      <div className="mb-4">
        <div className="text-2xl font-bold text-accent-primary">
          {formatPrice(Number(plan.price))}
        </div>
        <p className="text-xs text-neutral-gray">
          {isLandingService(plan.serviceType) ? 'investimento único' : 'por mês'}
        </p>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            plan.isActive
              ? 'bg-green-500/20 text-green-400'
              : 'bg-neutral-gray/20 text-neutral-gray'
          }`}
        >
          {plan.isActive ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* Storage */}
      <div className="mb-4 text-sm text-neutral-light">
        <span className="text-accent-primary font-medium">{plan.storageLimit} GB</span> de
        armazenamento
      </div>

      {/* Features Preview */}
      <div className="flex-1 mb-4">
        <p className="text-xs text-neutral-gray mb-2">
          {features.length} feature{features.length !== 1 ? 's' : ''}
        </p>
        <ul className="space-y-1">
          {features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-xs text-neutral-light">
              <Check className="w-3 h-3 text-accent-primary" />
              <span className="truncate">{feature}</span>
            </li>
          ))}
          {features.length > 3 && (
            <li className="text-xs text-neutral-gray pl-5">+{features.length - 3} mais...</li>
          )}
        </ul>
      </div>

      {/* Ações */}
      <div className="flex gap-2 pt-4 border-t border-neutral-gray/10">
        <Button variant="secondary" size="sm" className="flex-1" onClick={handleEdit}>
          <Edit className="w-4 h-4 mr-1" />
          Editar
        </Button>
        <Button
          variant={plan.isActive ? 'outline' : 'primary'}
          size="sm"
          className="flex-1"
          onClick={handleToggle}
        >
          {plan.isActive ? (
            <>
              <EyeOff className="w-4 h-4 mr-1" />
              Desativar
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-1" />
              Ativar
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
