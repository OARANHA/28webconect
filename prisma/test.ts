import { prisma } from '../lib/prisma';

async function testPrisma() {
  try {
    // Testar a conexão com o banco de dados
    await prisma.$connect();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');

    // Testar a criação de um usuário
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        role: 'CLIENTE',
        marketingConsent: false,
      },
    });
    console.log('✅ Usuário criado com sucesso:', user);

    // Testar a busca de usuários
    const users = await prisma.user.findMany();
    console.log('✅ Busca de usuários realizada com sucesso:', users);

    // Limpar o usuário de teste
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
    console.log('✅ Usuário de teste removido com sucesso');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro ao testar o Prisma:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testPrisma();
