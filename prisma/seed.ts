import { PrismaClient, ServiceType, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding pricing plans...');

  const pricingPlans = [
    {
      name: 'ERP Cloud Básico',
      serviceType: ServiceType.ERP_BASICO,
      price: 1500.0,
      storageLimit: 1,
      order: 1,
      features: [
        'Sistema ERP completo na nuvem',
        'Gestão de estoque e vendas',
        'Relatórios básicos',
        'Suporte por email',
        '1 GB de armazenamento',
        'Até 5 usuários',
      ],
    },
    {
      name: 'ERP + E-commerce + Marketplace',
      serviceType: ServiceType.ERP_ECOMMERCE,
      price: 3500.0,
      storageLimit: 5,
      order: 2,
      features: [
        'Tudo do plano Básico',
        'Loja online integrada',
        'Integração com marketplaces',
        'Gateway de pagamento',
        'Gestão de pedidos online',
        '5 GB de armazenamento',
        'Até 15 usuários',
      ],
    },
    {
      name: 'ERP Premium + Marketplace',
      serviceType: ServiceType.ERP_PREMIUM,
      price: 7500.0,
      storageLimit: 20,
      order: 3,
      features: [
        'Tudo do plano E-commerce',
        'Módulos avançados (fiscal, financeiro)',
        'Integrações customizadas',
        'Suporte prioritário 24/7',
        'Treinamento da equipe',
        '20 GB de armazenamento',
        'Usuários ilimitados',
      ],
    },
    {
      name: 'Landing Page + Agente IA',
      serviceType: ServiceType.LANDING_IA,
      price: 2500.0,
      storageLimit: 2,
      order: 4,
      features: [
        'Landing page profissional',
        'Design responsivo',
        'Chat de IA integrado',
        'Formulários de captação',
        'Analytics integrado',
        '2 GB de armazenamento',
        'SEO otimizado',
      ],
    },
    {
      name: 'Landing Page + IA + WhatsApp',
      serviceType: ServiceType.LANDING_IA_WHATSAPP,
      price: 4000.0,
      storageLimit: 5,
      order: 5,
      features: [
        'Tudo do plano Landing + IA',
        'Integração com WhatsApp Business',
        'Automação de mensagens',
        'Chatbot WhatsApp com IA',
        'CRM integrado',
        '5 GB de armazenamento',
        'Suporte prioritário',
      ],
    },
  ];

  for (const plan of pricingPlans) {
    await prisma.pricingPlan.upsert({
      where: { serviceType: plan.serviceType },
      update: plan,
      create: plan,
    });
    console.log(`✅ Created/Updated: ${plan.name}`);
  }

  // Seed notification preferences for all users
  await seedNotificationPreferences();

  console.log('✨ Seeding completed!');
}

async function seedNotificationPreferences() {
  console.log('🌱 Seeding notification preferences...');

  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  if (users.length === 0) {
    console.log('ℹ️ No users found, skipping notification preferences seed');
    return;
  }

  const allTypes = Object.values(NotificationType);
  let created = 0;
  let skipped = 0;

  for (const user of users) {
    for (const type of allTypes) {
      // Defaults: SYSTEM only in-app, others all channels
      const isSystem = type === 'SISTEMA';

      const existing = await prisma.notificationPreference.findUnique({
        where: {
          userId_type: {
            userId: user.id,
            type,
          },
        },
      });

      if (!existing) {
        await prisma.notificationPreference.create({
          data: {
            userId: user.id,
            type,
            emailEnabled: !isSystem,
            pushEnabled: !isSystem,
            inAppEnabled: true,
          },
        });
        created++;
      } else {
        skipped++;
      }
    }
  }

  console.log(`✅ Created ${created} notification preferences`);
  console.log(`⏭️  Skipped ${skipped} (already exist)`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
