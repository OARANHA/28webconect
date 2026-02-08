import webpush from 'web-push';

/**
 * Script para gerar VAPID keys para Web Push Notifications
 *
 * Uso:
 *   npx tsx scripts/generate-vapid-keys.ts
 *
 * Saída:
 *   VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY para configurar no .env.local
 */

console.log('='.repeat(60));
console.log('Gerador de VAPID Keys - 28Web Connect');
console.log('='.repeat(60));
console.log();

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID Keys geradas com sucesso!');
console.log();
console.log('Adicione as seguintes variáveis ao seu .env.local:');
console.log();
console.log('='.repeat(60));
console.log('# Web Push Notifications (VAPID)');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:noreply@28webconnect.com`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log('='.repeat(60));
console.log();
console.log('⚠️  IMPORTANTE:');
console.log('1. Nunca compartilhe a VAPID_PRIVATE_KEY');
console.log('2. Mantenha as keys seguras no seu .env.local');
console.log('3. NEXT_PUBLIC_VAPID_PUBLIC_KEY é necessária no frontend');
console.log('4. VAPID_SUBJECT deve ser um email ou URL válida');
console.log();
console.log('📝 Após configurar no .env.local:');
console.log('   1. Reinicie o servidor de desenvolvimento');
console.log('   2. Execute: npx prisma db push (se ainda não executou)');
console.log('   3. Teste as push notifications no navegador');
console.log();
