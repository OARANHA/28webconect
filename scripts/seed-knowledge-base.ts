/**
 * Script de seed para indexação inicial da base de conhecimento RAG
 *
 * Uso:
 *   npm run seed:knowledge           # Indexa apenas se não houver documentos
 *   npm run seed:knowledge --force   # Limpa e reindexa tudo
 */

import { storeDocument, countDocuments, deleteDocument, getAllDocuments } from '../lib/embeddings';

// Documentos da base de conhecimento
const KNOWLEDGE_DOCUMENTS = [
  // Páginas do Site
  {
    content: `Bem-vindo à 28Web Connect. Somos especialistas em desenvolvimento web, sistemas ERP, e-commerce e agentes de IA. Nossa missão é transformar negócios através da tecnologia, oferecendo soluções personalizadas que aumentam a produtividade e impulsionam vendas. Atuamos com pequenas, médias e grandes empresas, desde startups até corporações estabelecidas. Nossa equipe multidisciplinar combina expertise técnica com visão de negócio para entregar resultados mensuráveis.`,
    metadata: { type: 'page', title: 'Home', url: '/', category: 'institucional' },
  },
  {
    content: `Serviços 28Web Connect - Oferecemos soluções completas em tecnologia: ERP Cloud Básico para gestão empresarial, ERP + E-commerce + Marketplace para venda multicanal, ERP Premium com Business Intelligence, Landing Page com Agente IA para atendimento 24/7, e Landing + IA + WhatsApp Business API. Todos os nossos serviços incluem hospedagem, suporte técnico, backups automáticos e atualizações contínuas.`,
    metadata: { type: 'page', title: 'Serviços', url: '/servicos', category: 'institucional' },
  },
  {
    content: `Sobre a 28Web Connect - Fundada em 2023, nascemos da visão de democratizar o acesso à tecnologia de ponta para empresas de todos os portes. Nossa equipe é formada por desenvolvedores, designers e especialistas em negócios apaixonados por criar soluções que fazem a diferença. Valorizamos transparência, inovação e parceria de longo prazo com nossos clientes.`,
    metadata: { type: 'page', title: 'Sobre', url: '/sobre', category: 'institucional' },
  },
  {
    content: `Perguntas Frequentes 28Web Connect - O que é um sistema ERP? ERP (Enterprise Resource Planning) é um sistema que integra todos os processos da sua empresa em uma única plataforma. Qual a diferença entre os planos de ERP? O ERP Básico tem módulos essenciais, o ERP + E-commerce adiciona loja online e marketplaces, e o ERP Premium inclui BI e recursos avançados. Posso personalizar o sistema? Sim, todos os sistemas são customizáveis. Como funciona o processo de briefing? Após criar conta, você preenche um formulário detalhado e nossa equipe retorna com proposta em até 48 horas.`,
    metadata: { type: 'page', title: 'FAQ', url: '/faq', category: 'institucional' },
  },
  {
    content: `Contato 28Web Connect - Entre em contato conosco pelo email contato@28webconnect.com ou telefone (11) 99999-9999. Horário de atendimento: Segunda a Sexta, das 9h às 18h. Siga-nos nas redes sociais: Facebook, Instagram e LinkedIn. Para questões sobre proteção de dados e LGPD, contate nosso DPO pelo email dpo@28webconnect.com.`,
    metadata: { type: 'page', title: 'Contato', url: '/contato', category: 'institucional' },
  },

  // FAQs Detalhadas
  {
    content: `Pergunta: O que é um sistema ERP? Resposta: ERP (Enterprise Resource Planning) é um sistema que integra todos os processos da sua empresa em uma única plataforma: financeiro, estoque, vendas, compras e muito mais. Nossos sistemas ERP são desenvolvidos na nuvem, permitindo acesso de qualquer lugar, com backups automáticos e atualizações constantes.`,
    metadata: { type: 'faq', question: 'O que é um sistema ERP?', category: 'Serviços' },
  },
  {
    content: `Pergunta: Qual a diferença entre os planos de ERP? Resposta: O ERP Básico tem módulos essenciais para gestão empresarial (financeiro, estoque, vendas). O ERP + E-commerce adiciona loja online e integração com marketplaces (Mercado Livre, Shopee, Amazon). O ERP Premium inclui recursos avançados como multi-empresa, business intelligence, dashboards personalizados e suporte prioritário 24/7.`,
    metadata: {
      type: 'faq',
      question: 'Qual a diferença entre os planos de ERP?',
      category: 'Serviços',
    },
  },
  {
    content: `Pergunta: Posso personalizar o sistema? Resposta: Sim! Todos os nossos sistemas são customizáveis para atender as necessidades específicas do seu negócio. Durante o processo de briefing, entendemos suas necessidades e adaptamos o sistema com campos personalizados, relatórios específicos, integrações e fluxos de trabalho sob medida.`,
    metadata: { type: 'faq', question: 'Posso personalizar o sistema?', category: 'Serviços' },
  },
  {
    content: `Pergunta: Como funciona o processo de briefing? Resposta: Após criar sua conta em nossa plataforma, você preenche um formulário detalhado sobre seu projeto, incluindo objetivos, requisitos, prazos e orçamento. Nossa equipe analisa todas as informações e retorna com uma proposta personalizada em até 48 horas úteis.`,
    metadata: {
      type: 'faq',
      question: 'Como funciona o processo de briefing?',
      category: 'Processo',
    },
  },
  {
    content: `Pergunta: Quanto tempo leva para desenvolver? Resposta: O prazo depende da complexidade do projeto. Landing pages geralmente levam 2-3 semanas. Sistemas ERP básicos levam 1-2 meses. Projetos mais complexos, como ERP Premium com integrações, podem levar 3-6 meses. Fornecemos uma timeline detalhada na proposta.`,
    metadata: {
      type: 'faq',
      question: 'Quanto tempo leva para desenvolver?',
      category: 'Processo',
    },
  },
  {
    content: `Pergunta: Como acompanho o andamento do meu projeto? Resposta: Através do portal do cliente, você tem acesso a uma timeline visual em tempo real, pode acompanhar o progresso de cada etapa, enviar arquivos, trocar mensagens com a equipe e visualizar relatórios de produtividade. Também enviamos atualizações semanais por email.`,
    metadata: {
      type: 'faq',
      question: 'Como acompanho o andamento do meu projeto?',
      category: 'Processo',
    },
  },
  {
    content: `Pergunta: Quais tecnologias vocês utilizam? Resposta: Utilizamos as tecnologias mais modernas do mercado: Next.js e React para frontend, TypeScript para tipagem segura, PostgreSQL e Prisma ORM para banco de dados, Mistral AI para agentes inteligentes, Tailwind CSS para estilização, e Node.js para backend. Todas as nossas soluções são desenvolvidas com foco em performance e segurança.`,
    metadata: { type: 'faq', question: 'Quais tecnologias vocês utilizam?', category: 'Técnico' },
  },
  {
    content: `Pergunta: Meus dados estão seguros? Resposta: Sim! Segurança é nossa prioridade. Utilizamos criptografia SSL/TLS para todas as comunicações, backups automáticos diários, conformidade total com a LGPD (Lei Geral de Proteção de Dados), hospedagem em servidores seguros com certificações internacionais, e práticas de desenvolvimento seguro (OWASP).`,
    metadata: { type: 'faq', question: 'Meus dados estão seguros?', category: 'Técnico' },
  },
  {
    content: `Pergunta: Vocês oferecem suporte técnico? Resposta: Sim! Todos os planos incluem suporte técnico. O plano ERP Básico inclui suporte por email em horário comercial. O plano ERP + E-commerce inclui suporte prioritário por email e chat. O ERP Premium oferece suporte 24/7 por email, chat e telefone, com tempo de resposta garantido.`,
    metadata: { type: 'faq', question: 'Vocês oferecem suporte técnico?', category: 'Técnico' },
  },
  {
    content: `Pergunta: Como funciona o pagamento? Resposta: Após aprovação do briefing, enviamos uma proposta detalhada com valores e condições. Aceitamos pagamento à vista com desconto ou parcelado em até 12x no cartão de crédito. Para projetos grandes, trabalhamos com pagamentos parcelados conforme entregas de etapas.`,
    metadata: { type: 'faq', question: 'Como funciona o pagamento?', category: 'Comercial' },
  },
  {
    content: `Pergunta: Existe contrato de fidelidade? Resposta: Não! Você pode cancelar quando quiser, sem multas ou taxas de rescisão. Acreditamos que nossa qualidade e serviço falam por si. Recomendamos, no entanto, um período mínimo de 12 meses para obter o melhor retorno sobre investimento.`,
    metadata: { type: 'faq', question: 'Existe contrato de fidelidade?', category: 'Comercial' },
  },
  {
    content: `Pergunta: Vocês oferecem garantia? Resposta: Sim! Oferecemos 90 dias de garantia para correção de bugs e pequenos ajustes após a entrega final do projeto. Isso não inclui novas funcionalidades, apenas o que foi acordado no escopo original. Após esse período, oferecemos planos de manutenção mensal.`,
    metadata: { type: 'faq', question: 'Vocês oferecem garantia?', category: 'Comercial' },
  },

  // Serviços Detalhados
  {
    content: `ERP Cloud Básico - Nossa solução de gestão empresarial completa na nuvem para pequenas e médias empresas inclui: Módulo Financeiro com contas a pagar e receber, Controle de Estoque em tempo real, Gestão de Vendas e Pedidos, Relatórios Gerenciais detalhados, Acesso Multi-usuário com controle de permissões, e Backup Automático diário. Ideal para empresas que querem começar a digitalizar seus processos.`,
    metadata: { type: 'service', name: 'ERP Cloud Básico', category: 'ERP', tier: 'básico' },
  },
  {
    content: `ERP + E-commerce + Marketplace - Solução completa com loja online e integração com principais marketplaces. Inclui todos os recursos do ERP Básico mais: Loja Online Completa personalizada, Integração com Mercado Livre para sincronização automática, Integração com Shopee, Integração com Amazon, e Sincronização Automática de Estoque entre todos os canais. Perfeito para quem quer vender em múltiplos canais com estoque unificado.`,
    metadata: {
      type: 'service',
      name: 'ERP + E-commerce + Marketplace',
      category: 'ERP',
      tier: 'intermediário',
    },
  },
  {
    content: `ERP Premium + Marketplace - Solução enterprise com business intelligence e recursos avançados. Inclui todos os recursos do plano anterior mais: Multi-empresa para gestão centralizada de várias unidades, Business Intelligence (BI) com dashboards analíticos, Dashboards Personalizados, Integrações Ilimitadas via API, API Completa documentada, e Suporte Prioritário 24/7. Para empresas que precisam de máxima performance e controle.`,
    metadata: {
      type: 'service',
      name: 'ERP Premium + Marketplace',
      category: 'ERP',
      tier: 'premium',
    },
  },
  {
    content: `Landing Page + Agente IA - Site institucional moderno com chat inteligente para atendimento 24/7. Inclui: Design Responsivo Premium adaptado a todos os dispositivos, Chat IA Mistral com tecnologia RAG para respostas contextualizadas, Formulário de Contato integrado, SEO Otimizado para melhor ranking no Google, Analytics Integrado para métricas de visitantes, e Hospedagem Inclusa de alta performance. Atendimento inteligente que nunca dorme.`,
    metadata: {
      type: 'service',
      name: 'Landing Page + Agente IA',
      category: 'Web',
      tier: 'básico',
    },
  },
  {
    content: `Landing + IA + WhatsApp - Presença digital completa com integração WhatsApp Business API. Inclui todos os recursos do plano anterior mais: WhatsApp Business API oficial, Chatbot WhatsApp inteligente, Automação de Mensagens para respostas rápidas, Múltiplos Atendentes simultâneos, e Relatórios de Conversas detalhados. Centralize todo seu atendimento digital em uma única plataforma.`,
    metadata: {
      type: 'service',
      name: 'Landing + IA + WhatsApp',
      category: 'Web',
      tier: 'avançado',
    },
  },

  // Tabela de Preços (visão geral)
  {
    content: `Tabela de Preços 28Web Connect - Oferecemos 5 planos diferentes para atender diversas necessidades: ERP Cloud Básico (entrada), ERP + E-commerce + Marketplace (multicanal), ERP Premium (enterprise), Landing Page + Agente IA (presença digital), e Landing + IA + WhatsApp (atendimento completo). Cada plano foi desenhado para diferentes estágios de maturidade digital do negócio. Todos incluem hospedagem, suporte e atualizações.`,
    metadata: {
      type: 'pricing',
      plans: ['ERP Básico', 'ERP E-commerce', 'ERP Premium', 'Landing IA', 'Landing WhatsApp'],
    },
  },

  // Políticas
  {
    content: `Política de Privacidade 28Web Connect - Comprometemo-nos com a proteção de seus dados pessoais em conformidade com a LGPD. Coletamos apenas dados necessários para prestação dos serviços. Seus dados são armazenados de forma segura e criptografada. Não vendemos nem compartilhamos seus dados com terceiros sem consentimento. Você tem direito a acessar, corrigir e solicitar exclusão de seus dados. Para exercer seus direitos, contate nosso DPO.`,
    metadata: {
      type: 'page',
      title: 'Política de Privacidade',
      url: '/politica-privacidade',
      category: 'legal',
    },
  },
  {
    content: `Termos de Uso 28Web Connect - Ao utilizar nossos serviços, você concorda com estes termos. Fornecemos serviços de desenvolvimento de software e consultoria tecnológica. O cliente é responsável por fornecer informações precisas e pagar nos prazos acordados. Reservamo-nos o direito de suspender serviços em caso de violação dos termos. A propriedade intelectual do código desenvolvido é transferida ao cliente após pagamento integral.`,
    metadata: { type: 'page', title: 'Termos de Uso', url: '/termos-uso', category: 'legal' },
  },
];

/**
 * Processa documentos em lote para evitar rate limit
 */
async function processBatch(
  documents: typeof KNOWLEDGE_DOCUMENTS,
  batchSize: number = 5
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = { success: 0, failed: 0, errors: [] as string[] };

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    console.log(
      `\n📦 Processando lote ${Math.floor(i / batchSize) + 1} de ${Math.ceil(documents.length / batchSize)}...`
    );

    await Promise.all(
      batch.map(async (doc, index) => {
        const docNumber = i + index + 1;
        try {
          console.log(
            `  📝 Indexando documento ${docNumber}/${documents.length}: ${doc.metadata.type} - ${doc.metadata.title || doc.metadata.name || doc.metadata.question}`
          );

          await storeDocument(doc.content, doc.metadata);
          results.success++;
          console.log(`  ✅ Documento ${docNumber} indexado com sucesso`);
        } catch (error) {
          results.failed++;
          const errorMsg = `Falha ao indexar documento ${docNumber}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
          results.errors.push(errorMsg);
          console.error(`  ❌ ${errorMsg}`);
        }
      })
    );

    // Delay entre lotes para evitar rate limit
    if (i + batchSize < documents.length) {
      console.log('  ⏳ Aguardando 1 segundo antes do próximo lote...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Limpa todos os documentos existentes
 */
async function clearAllDocuments(): Promise<number> {
  console.log('\n🧹 Limpando documentos existentes...');
  const documents = await getAllDocuments();

  for (const doc of documents) {
    await deleteDocument(doc.id);
  }

  console.log(`  ✅ ${documents.length} documentos removidos`);
  return documents.length;
}

/**
 * Função principal
 */
async function main() {
  const startTime = Date.now();
  const args = process.argv.slice(2);
  const forceMode = args.includes('--force');

  console.log('🚀 Iniciando indexação da base de conhecimento RAG\n');
  console.log('='.repeat(50));

  try {
    // Verificar variáveis de ambiente
    if (!process.env.MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY não configurada no ambiente');
    }

    // Verificar documentos existentes
    const existingCount = await countDocuments();
    console.log(`\n📊 Documentos existentes: ${existingCount}`);

    if (existingCount > 0 && !forceMode) {
      console.log('\n⚠️  Já existem documentos indexados.');
      console.log('    Use --force para limpar e reindexar tudo.');
      console.log('    Saindo sem alterações.\n');
      process.exit(0);
    }

    // Limpar se estiver em modo force
    if (forceMode && existingCount > 0) {
      await clearAllDocuments();
    }

    // Processar documentos
    console.log(`\n📚 Indexando ${KNOWLEDGE_DOCUMENTS.length} documentos...\n`);
    const results = await processBatch(KNOWLEDGE_DOCUMENTS, 5);

    // Resumo
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n' + '='.repeat(50));
    console.log('📈 RESUMO DA INDEXAÇÃO');
    console.log('='.repeat(50));
    console.log(`✅ Sucesso: ${results.success} documentos`);
    console.log(`❌ Falhas: ${results.failed} documentos`);
    console.log(`⏱️  Duração: ${duration}s`);

    if (results.errors.length > 0) {
      console.log('\n⚠️  Erros encontrados:');
      results.errors.forEach((err) => console.log(`   - ${err}`));
    }

    const finalCount = await countDocuments();
    console.log(`\n📊 Total de documentos no banco: ${finalCount}`);
    console.log('\n✨ Indexação concluída!\n');

    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n💥 Erro fatal:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

export { KNOWLEDGE_DOCUMENTS };
