import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Adapter } from 'next-auth/adapters';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { UserRole } from '../types';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Verificar se email e senha foram fornecidos
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Rejeitar senhas com menos de 8 caracteres
        if ((credentials.password as string).length < 8) {
          return null;
        }

        // Buscar usuário no banco de dados
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // Verificar se usuário existe e tem senha
        if (!user || !user.password) {
          return null;
        }

        // Comparar senha fornecida com hash no banco
        const isValid = await bcrypt.compare(credentials.password as string, user.password);

        // Retornar usuário se credenciais forem válidas (sem a senha)
        if (isValid) {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword as any;
        }

        // Retornar null se credenciais inválidas
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/erro',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // Copiar dados do usuário para o token no login
      if (user) {
        token.id = user.id;
        token.role = user.role as string;
        token.emailVerified = user.emailVerified;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Mapear dados do token para a sessão
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.name = token.name as string | null;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});
