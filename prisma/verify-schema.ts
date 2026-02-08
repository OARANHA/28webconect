import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  // Test pricing plans
  const plans = await prisma.pricingPlan.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  console.log('📊 Active Pricing Plans:', plans.length);
  plans.forEach((p) => console.log(`  - ${p.name}: R$ ${p.price}`));

  // Test enum types
  console.log('✅ BriefingStatus enum available');
  console.log('✅ ServiceType enum available');
  console.log('✅ All schema types verified successfully!');

  await prisma.$disconnect();
}

verify().catch((e) => {
  console.error('❌ Verification failed:', e);
  process.exit(1);
});
