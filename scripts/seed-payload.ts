import { getPayload } from 'payload';
import config from '../payload.config';

async function seed() {
  console.log('🌱 Iniciando seed do Payload CMS...\n');

  const payload = await getPayload({
    config,
  });

  // Sample blog posts
  const samplePosts = [
    {
      title: 'Como Escolher a Tecnologia Certa para seu Projeto',
      slug: 'como-escolher-tecnologia-projeto',
      excerpt:
        'Descubra os fatores-chave para selecionar a stack tecnológica ideal para o seu próximo projeto de desenvolvimento web.',
      content: [
        {
          children: [
            {
              text: 'Escolher a tecnologia certa é fundamental para o sucesso de qualquer projeto digital. Neste artigo, vamos explorar os principais fatores que devem ser considerados.',
            },
          ],
        },
        {
          type: 'h2',
          children: [{ text: 'Entenda suas Necessidades' }],
        },
        {
          children: [
            { text: 'Antes de escolher qualquer tecnologia, é essencial entender claramente:' },
          ],
        },
        {
          type: 'ul',
          children: [
            { type: 'li', children: [{ text: 'O objetivo do projeto' }] },
            { type: 'li', children: [{ text: 'O público-alvo' }] },
            { type: 'li', children: [{ text: 'A escalabilidade necessária' }] },
            { type: 'li', children: [{ text: 'O orçamento disponível' }] },
          ],
        },
        {
          type: 'h2',
          children: [{ text: 'Principais Tecnologias em 2024' }],
        },
        {
          children: [
            {
              text: 'O ecossistema de desenvolvimento web continua evoluindo rapidamente. Algumas das tecnologias mais populares incluem Next.js, React, Node.js e diversas soluções em cloud.',
            },
          ],
        },
      ],
      status: 'published',
      publishedAt: new Date('2024-01-15').toISOString(),
      category: 'tecnologia',
      tags: [{ tag: 'tecnologia' }, { tag: 'desenvolvimento' }, { tag: 'dicas' }],
      seo: {
        metaTitle: 'Como Escolher a Tecnologia Certa para seu Projeto | 28Web',
        metaDescription:
          'Guia completo para escolher a stack tecnológica ideal. React, Next.js, Node.js e mais - descubra o que melhor se adapta ao seu projeto.',
      },
    },
    {
      title: '5 Dicas para Melhorar a Performance do seu Site',
      slug: '5-dicas-performance-site',
      excerpt:
        'Aprenda técnicas práticas para otimizar a velocidade e performance do seu website, melhorando o SEO e a experiência do usuário.',
      content: [
        {
          children: [
            {
              text: 'A performance de um site é crucial para o sucesso online. Sites rápidos têm melhor ranqueamento no Google e maior taxa de conversão.',
            },
          ],
        },
        {
          type: 'h2',
          children: [{ text: '1. Otimize as Imagens' }],
        },
        {
          children: [
            {
              text: 'Imagens são frequentemente o maior vilão da performance. Use formatos modernos como WebP, implemente lazy loading e sirva imagens responsivas.',
            },
          ],
        },
        {
          type: 'h2',
          children: [{ text: '2. Utilize CDN' }],
        },
        {
          children: [
            {
              text: 'Uma Content Delivery Network distribui seus arquivos estáticos por servidores ao redor do mundo, reduzindo a latência para usuários distantes.',
            },
          ],
        },
        {
          type: 'h2',
          children: [{ text: '3. Minifique Recursos' }],
        },
        {
          children: [
            {
              text: 'CSS, JavaScript e HTML minificados têm tamanho reduzido e carregam mais rápido. Ferramentas de build modernas fazem isso automaticamente.',
            },
          ],
        },
      ],
      status: 'published',
      publishedAt: new Date('2024-02-01').toISOString(),
      category: 'tutoriais',
      tags: [{ tag: 'performance' }, { tag: 'seo' }, { tag: 'tutorial' }],
      seo: {
        metaTitle: '5 Dicas para Melhorar Performance do Site | 28Web',
        metaDescription:
          'Técnicas práticas de otimização web: imagens, CDN, cache e mais. Acelere seu site e melhore seu ranking no Google.',
      },
    },
    {
      title: 'O Futuro do E-commerce: Tendências para 2024',
      slug: 'futuro-ecommerce-tendencias-2024',
      excerpt:
        'Explore as principais tendências que estão moldando o futuro do comércio eletrônico e como se preparar para elas.',
      content: [
        {
          children: [
            {
              text: 'O e-commerce continua evoluindo a passos largos. Empresas que não acompanham as tendências ficam para trás na competição digital.',
            },
          ],
        },
        {
          type: 'h2',
          children: [{ text: 'Inteligência Artificial' }],
        },
        {
          children: [
            {
              text: 'A IA está revolucionando a experiência de compra online. Chatbots inteligentes, recomendações personalizadas e busca por imagem são apenas o começo.',
            },
          ],
        },
        {
          type: 'h2',
          children: [{ text: 'Compra por Voz' }],
        },
        {
          children: [
            {
              text: 'Com o crescimento de assistentes virtuais, a compra por voz está se tornando cada vez mais comum. Otimize seu site para busca por voz.',
            },
          ],
        },
        {
          type: 'h2',
          children: [{ text: 'Sustentabilidade' }],
        },
        {
          children: [
            {
              text: 'Consumidores estão cada vez mais conscientes da importância da sustentabilidade. Destaque práticas eco-friendly na sua loja.',
            },
          ],
        },
      ],
      status: 'published',
      publishedAt: new Date('2024-02-10').toISOString(),
      category: 'negocios',
      tags: [{ tag: 'ecommerce' }, { tag: 'tendencias' }, { tag: 'negocios' }],
      seo: {
        metaTitle: 'Tendências de E-commerce 2024 | 28Web Connect',
        metaDescription:
          'Descubra as principais tendências do comércio eletrônico: IA, compra por voz, sustentabilidade e mais. Prepare-se para o futuro.',
      },
    },
    {
      title: 'Case de Sucesso: Sistema ERP para Indústria',
      slug: 'case-sistema-erp-industria',
      excerpt:
        'Como desenvolvemos um sistema ERP completo que aumentou a produtividade em 40% para uma indústria do setor têxtil.',
      content: [
        {
          children: [
            {
              text: 'Neste case, compartilhamos os desafios e soluções de um projeto de ERP desenvolvido para uma indústria têxtil em crescimento.',
            },
          ],
        },
        {
          type: 'h2',
          children: [{ text: 'O Desafio' }],
        },
        {
          children: [
            {
              text: 'A empresa enfrentava dificuldades com processos manuais, falta de integração entre departamentos e dificuldade de obter relatórios em tempo real.',
            },
          ],
        },
        {
          type: 'h2',
          children: [{ text: 'A Solução' }],
        },
        {
          children: [
            {
              text: 'Desenvolvemos um sistema ERP modular com gestão de estoque, financeiro, produção e integração com marketplaces.',
            },
          ],
        },
        {
          type: 'h2',
          children: [{ text: 'Resultados' }],
        },
        {
          type: 'ul',
          children: [
            { type: 'li', children: [{ text: 'Aumento de 40% na produtividade' }] },
            { type: 'li', children: [{ text: 'Redução de 60% no tempo de fechamento mensal' }] },
            { type: 'li', children: [{ text: 'Integração com 5 marketplaces' }] },
            { type: 'li', children: [{ text: 'Dashboard em tempo real' }] },
          ],
        },
      ],
      status: 'published',
      publishedAt: new Date('2024-01-25').toISOString(),
      category: 'cases',
      tags: [{ tag: 'erp' }, { tag: 'case' }, { tag: 'industria' }],
      seo: {
        metaTitle: 'Case ERP: Aumento de 40% na Produtividade | 28Web',
        metaDescription:
          'Case de sucesso: Sistema ERP completo para indústria têxtil. Veja como aumentamos a produtividade em 40%.',
      },
    },
  ];

  // Sample portfolio projects
  const sampleProjects = [
    {
      title: 'Sistema ERP Completo',
      slug: 'sistema-erp-completo',
      shortDescription:
        'Sistema ERP integrado com gestão de estoque, financeiro, vendas e relatórios em tempo real.',
      description: [
        {
          children: [
            {
              text: 'Desenvolvemos um sistema ERP completo e personalizado para atender às necessidades específicas de uma empresa em crescimento.',
            },
          ],
        },
        {
          type: 'h3',
          children: [{ text: 'Funcionalidades Principais' }],
        },
        {
          type: 'ul',
          children: [
            { type: 'li', children: [{ text: 'Gestão de estoque com controle de lotes' }] },
            { type: 'li', children: [{ text: 'Módulo financeiro completo' }] },
            { type: 'li', children: [{ text: 'Gestão de vendas e CRM' }] },
            { type: 'li', children: [{ text: 'Relatórios e dashboards em tempo real' }] },
            { type: 'li', children: [{ text: 'Integração com marketplaces' }] },
          ],
        },
        {
          type: 'h3',
          children: [{ text: 'Tecnologias Utilizadas' }],
        },
        {
          children: [
            {
              text: 'O sistema foi desenvolvido com tecnologias modernas e escaláveis, garantindo performance e segurança.',
            },
          ],
        },
      ],
      client: 'Indústria Têxtil XYZ',
      category: 'erp',
      technologies: [
        { technology: 'Next.js' },
        { technology: 'Node.js' },
        { technology: 'PostgreSQL' },
        { technology: 'Prisma' },
        { technology: 'Docker' },
      ],
      completedAt: new Date('2024-01-15').toISOString(),
      featured: true,
      projectUrl: 'https://exemplo-erp.com.br',
      seo: {
        metaTitle: 'Sistema ERP Completo | Case 28Web Connect',
        metaDescription:
          'Sistema ERP desenvolvido sob medida com gestão de estoque, financeiro e integração com marketplaces.',
      },
    },
    {
      title: 'E-commerce Premium',
      slug: 'ecommerce-premium',
      shortDescription:
        'Loja virtual de alta conversão com checkout otimizado, integração com múltiplos gateways e área administrativa completa.',
      description: [
        {
          children: [
            {
              text: 'E-commerce desenvolvido para uma marca de moda premium, focado em conversão e experiência do usuário.',
            },
          ],
        },
        {
          type: 'h3',
          children: [{ text: 'Destaques do Projeto' }],
        },
        {
          type: 'ul',
          children: [
            { type: 'li', children: [{ text: 'Checkout otimizado em 3 passos' }] },
            { type: 'li', children: [{ text: 'Integração com 5 gateways de pagamento' }] },
            { type: 'li', children: [{ text: 'Sistema de recomendação de produtos' }] },
            { type: 'li', children: [{ text: 'Área administrativa completa' }] },
            { type: 'li', children: [{ text: 'App mobile complementar' }] },
          ],
        },
      ],
      client: 'Fashion Brand',
      category: 'ecommerce',
      technologies: [
        { technology: 'Next.js' },
        { technology: 'Stripe' },
        { technology: 'Shopify API' },
        { technology: 'Tailwind CSS' },
      ],
      completedAt: new Date('2023-12-20').toISOString(),
      featured: true,
      projectUrl: 'https://exemplo-ecommerce.com',
      seo: {
        metaTitle: 'E-commerce Premium | Case 28Web Connect',
        metaDescription:
          'Loja virtual de alta conversão com checkout otimizado e múltiplos gateways de pagamento.',
      },
    },
    {
      title: 'Landing Page High-Converting',
      slug: 'landing-page-high-converting',
      shortDescription:
        'Landing page otimizada para campanhas de marketing digital com A/B testing e analytics avançado.',
      description: [
        {
          children: [
            {
              text: 'Landing page desenvolvida para campanha de lançamento de produto, com foco máximo em conversão.',
            },
          ],
        },
        {
          type: 'h3',
          children: [{ text: 'Recursos Implementados' }],
        },
        {
          type: 'ul',
          children: [
            { type: 'li', children: [{ text: 'Design focado em conversão' }] },
            { type: 'li', children: [{ text: 'A/B testing integrado' }] },
            { type: 'li', children: [{ text: 'Analytics avançado' }] },
            { type: 'li', children: [{ text: 'Formulários otimizados' }] },
            { type: 'li', children: [{ text: 'Integração com email marketing' }] },
          ],
        },
      ],
      client: 'Tech Startup',
      category: 'landing-page',
      technologies: [
        { technology: 'React' },
        { technology: 'Framer Motion' },
        { technology: 'Google Analytics' },
        { technology: 'Vercel' },
      ],
      completedAt: new Date('2023-11-10').toISOString(),
      featured: false,
      seo: {
        metaTitle: 'Landing Page High-Converting | Case 28Web',
        metaDescription:
          'Landing page otimizada para conversão com A/B testing e analytics avançado.',
      },
    },
    {
      title: 'Sistema de Agendamento',
      slug: 'sistema-agendamento',
      shortDescription:
        'Plataforma completa de agendamento online com notificações automáticas e gestão de equipe.',
      description: [
        {
          children: [
            { text: 'Sistema de agendamento completo desenvolvido para clínicas e consultórios.' },
          ],
        },
        {
          type: 'h3',
          children: [{ text: 'Funcionalidades' }],
        },
        {
          type: 'ul',
          children: [
            { type: 'li', children: [{ text: 'Agendamento online 24/7' }] },
            { type: 'li', children: [{ text: 'Notificações por WhatsApp e email' }] },
            { type: 'li', children: [{ text: 'Gestão de múltiplas unidades' }] },
            { type: 'li', children: [{ text: 'App para profissionais' }] },
          ],
        },
      ],
      client: 'Rede de Clínicas Saúde+',
      category: 'sistema-customizado',
      technologies: [
        { technology: 'Next.js' },
        { technology: 'Node.js' },
        { technology: 'MongoDB' },
        { technology: 'Twilio' },
      ],
      completedAt: new Date('2024-02-01').toISOString(),
      featured: true,
      projectUrl: 'https://exemplo-agendamento.com',
      seo: {
        metaTitle: 'Sistema de Agendamento Online | Case 28Web',
        metaDescription:
          'Plataforma completa de agendamento com notificações automáticas e gestão de equipe.',
      },
    },
  ];

  try {
    // Create posts
    console.log('📝 Criando posts do blog...');
    for (const post of samplePosts) {
      try {
        await payload.create({
          collection: 'posts',
          data: post as any,
        });
        console.log(`  ✅ Post criado: ${post.title}`);
      } catch (error: any) {
        if (error.message?.includes('duplicate')) {
          console.log(`  ⚠️ Post já existe: ${post.title}`);
        } else {
          console.error(`  ❌ Erro ao criar post: ${post.title}`, error.message);
        }
      }
    }

    // Create projects
    console.log('\n🏗️ Criando projetos do portfólio...');
    for (const project of sampleProjects) {
      try {
        await payload.create({
          collection: 'portfolio',
          data: project as any,
        });
        console.log(`  ✅ Projeto criado: ${project.title}`);
      } catch (error: any) {
        if (error.message?.includes('duplicate')) {
          console.log(`  ⚠️ Projeto já existe: ${project.title}`);
        } else {
          console.error(`  ❌ Erro ao criar projeto: ${project.title}`, error.message);
        }
      }
    }

    console.log('\n✨ Seed concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   Posts: ${samplePosts.length}`);
    console.log(`   Projetos: ${sampleProjects.length}`);
    console.log('\n🚀 Acesse o admin em: http://localhost:3000/cms');
  } catch (error) {
    console.error('\n❌ Erro durante o seed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run seed
seed();
