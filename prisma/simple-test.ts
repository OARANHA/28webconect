import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Testar a conexão com o banco de dados
    await prisma.$connect();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');

    // Testar a busca de usuários
    const users = await prisma.user.findMany();
    console.log('✅ Busca de usuários realizada com sucesso:', users);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro ao testar o Prisma:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
