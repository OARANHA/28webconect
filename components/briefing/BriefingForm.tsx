'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ServiceType } from '@prisma/client';
import {
  Building2,
  ShoppingCart,
  Crown,
  Sparkles,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  Loader2,
} from 'lucide-react';

import Input from '@/components/ui/InputComponent';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import StepIndicator from './StepIndicator';
import FieldGroup from './FieldGroup';
import { saveDraft, submitBriefing, loadDraft } from '@/app/actions/briefing';
import {
  briefingDraftSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  BriefingDraftData,
} from '@/lib/validations/briefing';

interface BriefingFormProps {
  userId: string;
  initialServiceType?: string;
}

// Configuração dos steps
const STEPS = [
  { label: 'Tipo de Serviço', description: 'Escolha o serviço desejado' },
  { label: 'Sua Empresa', description: 'Informações básicas' },
  { label: 'Objetivos', description: 'Detalhes do projeto' },
  { label: 'Revisão', description: 'Verifique e envie' },
];

// Opções de tipo de serviço com ícones e descrições
const SERVICE_OPTIONS = [
  {
    value: ServiceType.ERP_BASICO,
    label: 'ERP Básico',
    description: 'Gestão empresarial essencial',
    icon: Building2,
    features: ['Controle de estoque', 'Gestão financeira', 'Relatórios básicos'],
  },
  {
    value: ServiceType.ERP_ECOMMERCE,
    label: 'ERP + E-commerce',
    description: 'Integração completa com loja virtual',
    icon: ShoppingCart,
    features: ['Integração Shopify/Woo', 'Gestão de pedidos', 'Sincronização automática'],
  },
  {
    value: ServiceType.ERP_PREMIUM,
    label: 'ERP Premium',
    description: 'Solução completa personalizada',
    icon: Crown,
    features: ['Módulos customizáveis', 'API dedicada', 'Suporte prioritário'],
  },
  {
    value: ServiceType.LANDING_IA,
    label: 'Landing Page IA',
    description: 'Página de alta conversão com IA',
    icon: Sparkles,
    features: ['Copy gerada por IA', 'Design otimizado', 'A/B testing automático'],
  },
  {
    value: ServiceType.LANDING_IA_WHATSAPP,
    label: 'Landing IA + WhatsApp',
    description: 'Landing page com bot WhatsApp',
    icon: MessageCircle,
    features: ['Bot WhatsApp integrado', 'Atendimento 24/7', 'Qualificação automática'],
  },
];

/**
 * Componente principal do formulário de briefing
 * Multi-step com auto-save e campos condicionais
 */
export default function BriefingForm({ userId, initialServiceType }: BriefingFormProps) {
  const router = useRouter();
  // Determinar step inicial baseado na pré-seleção de serviço
  const getInitialStep = () => {
    if (initialServiceType && SERVICE_OPTIONS.some((s) => s.value === initialServiceType)) {
      return 2; // Pular para step 2 se serviço estiver pré-selecionado
    }
    return 1;
  };

  const [currentStep, setCurrentStep] = useState(getInitialStep());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  // Estado para rastrear os valores do último salvamento
  const [lastSavedData, setLastSavedData] = useState<Partial<BriefingDraftData> | null>(null);
  // Ref para controlar se há um salvamento pendente
  const isSavingRef = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
    trigger,
    getValues,
  } = useForm<BriefingDraftData>({
    resolver: zodResolver(briefingDraftSchema),
    mode: 'onBlur',
    defaultValues: {
      serviceType: initialServiceType as ServiceType | undefined,
      companyName: '',
      segment: '',
      objectives: '',
      budget: '',
      deadline: '',
      features: '',
      integrations: '',
      references: '',
    },
  });

  // Observar mudanças no serviceType para campos condicionais
  const selectedServiceType = watch('serviceType');

  // Carregar rascunho ao montar o componente
  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const result = await loadDraft(userId);
        if (result.success && result.data) {
          reset(result.data);
          setLastSavedData(result.data);
          toast.success('Rascunho carregado', {
            description: 'Seus dados anteriores foram restaurados.',
          });
          setLastSaved(new Date());
        }
      } catch {
        toast.error('Erro ao carregar rascunho');
      } finally {
        setIsLoadingDraft(false);
      }
    };

    fetchDraft();
  }, [userId, reset]);

  // Função para comparar se os dados mudaram desde o último salvamento
  const hasDataChanged = useCallback(
    (currentData: BriefingDraftData): boolean => {
      if (!lastSavedData) return true;

      const fieldsToCompare: (keyof BriefingDraftData)[] = [
        'serviceType',
        'companyName',
        'segment',
        'objectives',
        'budget',
        'deadline',
        'features',
        'references',
        'integrations',
      ];

      return fieldsToCompare.some((field) => {
        const current = currentData[field];
        const saved = lastSavedData[field];
        return current !== saved;
      });
    },
    [lastSavedData]
  );

  // Auto-save a cada 1 minuto quando houver alterações
  const handleAutoSave = useCallback(async () => {
    if (isSavingRef.current) return;

    const data = getValues();

    // Verifica se os dados realmente mudaram desde o último salvamento
    if (!hasDataChanged(data)) {
      return;
    }

    isSavingRef.current = true;
    try {
      const result = await saveDraft(userId, data);
      if (result.success) {
        setLastSaved(new Date());
        setLastSavedData({ ...data });
        // Reset do form para limpar o estado dirty sem perder os valores
        reset(data, { keepValues: true, keepDirty: false });
        toast.success('Rascunho salvo automaticamente', {
          duration: 2000,
        });
      }
    } catch {
      console.error('Erro ao salvar rascunho automaticamente');
    } finally {
      isSavingRef.current = false;
    }
  }, [getValues, hasDataChanged, reset, userId]);

  // Extrair valores observados para o dependency array
  const watchedValues = watch();

  useEffect(() => {
    // Só agenda o auto-save se o formulário estiver dirty
    if (!isDirty) return;

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 60000); // 1 minuto

    return () => clearTimeout(timer);
  }, [watchedValues, isDirty, handleAutoSave]);

  // Validar step atual antes de avançar usando schemas específicos
  const validateCurrentStep = async (): Promise<boolean> => {
    const data = getValues();

    try {
      switch (currentStep) {
        case 1:
          await step1Schema.parseAsync({ serviceType: data.serviceType });
          return true;
        case 2:
          await step2Schema.parseAsync({
            companyName: data.companyName,
            segment: data.segment,
          });
          return true;
        case 3:
          await step3Schema.parseAsync({ objectives: data.objectives });
          return true;
        case 4:
          return true;
        default:
          return true;
      }
    } catch (error) {
      // Dispara a validação do react-hook-form para mostrar os erros na UI
      const fieldsToValidate: Record<number, (keyof BriefingDraftData)[]> = {
        1: ['serviceType'],
        2: ['companyName', 'segment'],
        3: ['objectives'],
        4: [],
      };
      const fields = fieldsToValidate[currentStep];
      if (fields && fields.length > 0) {
        await trigger(fields);
      }
      return false;
    }
  };

  // Avançar para o próximo step
  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Voltar para o step anterior
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Submeter formulário completo
  const onSubmit = async (data: BriefingDraftData) => {
    if (!data.serviceType) {
      toast.error('Selecione um tipo de serviço');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitBriefing(userId, data as Required<BriefingDraftData>);
      if (result.success) {
        toast.success('Briefing enviado com sucesso!', {
          description: 'Nossa equipe entrará em contato em breve.',
        });
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Erro ao enviar briefing');
      }
    } catch {
      toast.error('Erro de conexão. Tente novamente');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatar tempo desde o último salvamento
  const getLastSavedText = (): string => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 60000);
    if (diff < 1) return 'Salvo agora';
    if (diff === 1) return 'Salvo há 1 minuto';
    return `Salvo há ${diff} minutos`;
  };

  // Verificar se o serviço selecionado requer campos específicos
  const isErpService = selectedServiceType?.startsWith('ERP');
  const showIntegrations =
    selectedServiceType === ServiceType.ERP_BASICO ||
    selectedServiceType === ServiceType.ERP_ECOMMERCE ||
    selectedServiceType === ServiceType.ERP_PREMIUM ||
    selectedServiceType === ServiceType.LANDING_IA_WHATSAPP;
  const showReferences =
    selectedServiceType === ServiceType.ERP_ECOMMERCE ||
    selectedServiceType === ServiceType.ERP_PREMIUM ||
    selectedServiceType === ServiceType.LANDING_IA ||
    selectedServiceType === ServiceType.LANDING_IA_WHATSAPP;
  const showFeatures =
    selectedServiceType === ServiceType.ERP_BASICO ||
    selectedServiceType === ServiceType.ERP_ECOMMERCE ||
    selectedServiceType === ServiceType.ERP_PREMIUM ||
    selectedServiceType === ServiceType.LANDING_IA ||
    selectedServiceType === ServiceType.LANDING_IA_WHATSAPP;

  if (isLoadingDraft) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
        <span className="ml-3 text-neutral-gray">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Indicador de progresso */}
      <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />

      {/* Indicador de auto-save */}
      {lastSaved && (
        <div className="flex items-center justify-end text-xs text-neutral-gray">
          <Save className="w-3 h-3 mr-1" />
          {getLastSavedText()}
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Tipo de Serviço */}
        {currentStep === 1 && (
          <FieldGroup title="Escolha o Tipo de Serviço" required>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SERVICE_OPTIONS.map((service) => {
                const Icon = service.icon;
                const isSelected = selectedServiceType === service.value;

                return (
                  <label
                    key={service.value}
                    className={`relative flex flex-col p-5 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-accent-primary bg-accent-primary/10'
                        : 'border-neutral-gray/20 hover:border-neutral-gray/40 bg-dark-bg-secondary'
                    }`}
                  >
                    <input
                      type="radio"
                      value={service.value}
                      {...register('serviceType')}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          isSelected ? 'bg-accent-primary' : 'bg-neutral-gray/10'
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-neutral-gray'}`}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-neutral-white">{service.label}</h4>
                        <p className="text-sm text-neutral-gray mt-1">{service.description}</p>
                        <ul className="mt-3 space-y-1">
                          {service.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-neutral-gray flex items-center gap-1"
                            >
                              <span className="text-accent-primary">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.serviceType && (
              <p className="text-sm text-red-400 mt-2" role="alert">
                {errors.serviceType.message}
              </p>
            )}
          </FieldGroup>
        )}

        {/* Step 2: Informações da Empresa */}
        {currentStep === 2 && (
          <FieldGroup
            title="Sobre sua Empresa"
            description="Conte-nos um pouco sobre o seu negócio"
            required
          >
            <Input
              label="Nome da Empresa"
              placeholder="Ex: Acme Inc."
              error={errors.companyName?.message}
              required
              {...register('companyName')}
            />
            <Input
              label="Ramo de Atividade"
              placeholder="Ex: E-commerce de moda, Consultoria de TI, etc."
              error={errors.segment?.message}
              required
              {...register('segment')}
            />
          </FieldGroup>
        )}

        {/* Step 3: Objetivos e Requisitos */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <FieldGroup
              title="Objetivos do Projeto"
              description="Descreva o que você deseja alcançar"
              required
            >
              <Textarea
                label="Objetivos e Metas"
                placeholder="Descreva seus objetivos, metas e o que você espera alcançar com este projeto..."
                error={errors.objectives?.message}
                maxLength={2000}
                showCounter
                autoResize
                required
                {...register('objectives')}
              />
            </FieldGroup>

            <FieldGroup
              title="Orçamento e Prazo"
              description="Informações opcionais para planejamento"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Orçamento Estimado"
                  placeholder="Ex: R$ 5.000 - R$ 10.000"
                  error={errors.budget?.message}
                  {...register('budget')}
                />
                <Input
                  label="Prazo Desejado"
                  placeholder="Ex: 3 meses, Urgente"
                  error={errors.deadline?.message}
                  {...register('deadline')}
                />
              </div>
            </FieldGroup>

            {/* Campos condicionais baseados no tipo de serviço */}
            {showFeatures && (
              <FieldGroup
                title={isErpService ? 'Funcionalidades Desejadas' : 'Recursos Esperados'}
                description="Descreva as funcionalidades ou recursos que você precisa"
              >
                <Textarea
                  label="Funcionalidades"
                  placeholder={
                    isErpService
                      ? 'Ex: Controle de estoque, emissão de notas fiscais, relatórios financeiros...'
                      : 'Ex: Formulário de contato, galeria de imagens, integração com redes sociais...'
                  }
                  error={errors.features?.message}
                  maxLength={2000}
                  showCounter
                  autoResize
                  {...register('features')}
                />
              </FieldGroup>
            )}

            {showReferences && (
              <FieldGroup
                title="Referências Visuais"
                description="Links ou descrições de referências que você gosta"
              >
                <Textarea
                  label="Referências"
                  placeholder="Cole links de sites, descreva estilos visuais que você gosta, ou anexe referências no próximo passo..."
                  error={errors.references?.message}
                  maxLength={2000}
                  showCounter
                  autoResize
                  {...register('references')}
                />
              </FieldGroup>
            )}

            {showIntegrations && (
              <FieldGroup
                title="Integrações Necessárias"
                description="Sistemas que precisam ser integrados"
              >
                <Textarea
                  label="Integrações"
                  placeholder={
                    isErpService
                      ? 'Ex: Mercado Pago, PagSeguro, Shopify, Tiny, Bling...'
                      : 'Ex: WhatsApp Business, HubSpot, RD Station, Mailchimp...'
                  }
                  error={errors.integrations?.message}
                  maxLength={2000}
                  showCounter
                  autoResize
                  {...register('integrations')}
                />
              </FieldGroup>
            )}
          </div>
        )}

        {/* Step 4: Revisão */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <FieldGroup
              title="Resumo do Briefing"
              description="Revise suas informações antes de enviar"
            >
              <div className="space-y-4">
                <div className="p-4 bg-dark-bg rounded-lg">
                  <h4 className="text-sm font-medium text-neutral-gray mb-1">Tipo de Serviço</h4>
                  <p className="text-neutral-white">
                    {SERVICE_OPTIONS.find((s) => s.value === selectedServiceType)?.label ||
                      'Não selecionado'}
                  </p>
                </div>

                <div className="p-4 bg-dark-bg rounded-lg">
                  <h4 className="text-sm font-medium text-neutral-gray mb-1">Empresa</h4>
                  <p className="text-neutral-white">{getValues('companyName') || '-'}</p>
                  <p className="text-sm text-neutral-gray mt-1">{getValues('segment') || '-'}</p>
                </div>

                <div className="p-4 bg-dark-bg rounded-lg">
                  <h4 className="text-sm font-medium text-neutral-gray mb-1">Objetivos</h4>
                  <p className="text-neutral-white whitespace-pre-wrap">
                    {getValues('objectives') || '-'}
                  </p>
                </div>

                {(getValues('budget') || getValues('deadline')) && (
                  <div className="p-4 bg-dark-bg rounded-lg">
                    <h4 className="text-sm font-medium text-neutral-gray mb-1">
                      Orçamento e Prazo
                    </h4>
                    <p className="text-neutral-white">Orçamento: {getValues('budget') || '-'}</p>
                    <p className="text-neutral-white">Prazo: {getValues('deadline') || '-'}</p>
                  </div>
                )}

                {getValues('features') && (
                  <div className="p-4 bg-dark-bg rounded-lg">
                    <h4 className="text-sm font-medium text-neutral-gray mb-1">Funcionalidades</h4>
                    <p className="text-neutral-white whitespace-pre-wrap">
                      {getValues('features')}
                    </p>
                  </div>
                )}

                {getValues('references') && (
                  <div className="p-4 bg-dark-bg rounded-lg">
                    <h4 className="text-sm font-medium text-neutral-gray mb-1">Referências</h4>
                    <p className="text-neutral-white whitespace-pre-wrap">
                      {getValues('references')}
                    </p>
                  </div>
                )}

                {getValues('integrations') && (
                  <div className="p-4 bg-dark-bg rounded-lg">
                    <h4 className="text-sm font-medium text-neutral-gray mb-1">Integrações</h4>
                    <p className="text-neutral-white whitespace-pre-wrap">
                      {getValues('integrations')}
                    </p>
                  </div>
                )}
              </div>
            </FieldGroup>
          </div>
        )}

        {/* Botões de navegação */}
        <div className="flex items-center justify-between pt-6 border-t border-neutral-gray/10">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className={currentStep === 1 ? 'invisible' : ''}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          {currentStep < STEPS.length ? (
            <Button type="button" variant="primary" onClick={handleNext} disabled={isSubmitting}>
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Briefing
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
