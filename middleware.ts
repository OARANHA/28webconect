import NextAuth from 'next-auth';
import { auth } from './lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkStorageLimit } from './lib/file-upload';

// Rotas protegidas que requerem autenticação
const protectedRoutes = ['/dashboard', '/briefing', '/projetos', '/configuracoes'];

// Rotas administrativas que requerem role específica
const adminRoutes = ['/admin'];

// Rotas públicas que não requerem autenticação
const publicRoutes = [
  '/',
  '/servicos',
  '/sobre',
  '/faq',
  '/contato',
  '/login',
  '/cadastro',
  '/recuperar-senha',
  '/verificar-email',
  '/redefinir-senha',
  '/politica-privacidade',
  '/termos-uso',
  '/politica-cookies',
];

// Rotas de API públicas
const publicApiRoutes = ['/api/auth/verify-email'];

/**
 * Middleware de autenticação e autorização
 *
 * Fluxo de verificação:
 * 1. Rotas de API públicas -> permitir
 * 2. Rotas públicas -> permitir
 * 3. Rotas protegidas -> requer autenticação + email verificado
 * 4. Rotas admin -> requer role ADMIN ou SUPER_ADMIN
 * 5. Verificação de storage -> adiciona header de warning se próximo do limite
 */
export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  // Verificar se é uma rota de API pública
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname.startsWith(route));

  if (isPublicApiRoute) {
    return NextResponse.next();
  }

  // Verificar se a rota é pública
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Verificar se a rota é protegida
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Verificar se a rota é administrativa
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  const isLoggedIn = !!req.auth;

  // Se for rota pública, permitir acesso
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Se não estiver logado e a rota for protegida, redirecionar para login
  if (!isLoggedIn && (isProtectedRoute || isAdminRoute)) {
    const absoluteURL = new URL('/login', req.nextUrl.origin);
    return NextResponse.redirect(absoluteURL);
  }

  // Se estiver logado mas a rota for administrativa, verificar role
  if (isLoggedIn && isAdminRoute) {
    const userRole = req.auth?.user?.role;
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      const absoluteURL = new URL('/dashboard', req.nextUrl.origin);
      return NextResponse.redirect(absoluteURL);
    }
  }

  // Se estiver logado mas o email não estiver verificado e a rota for protegida
  if (isLoggedIn && isProtectedRoute) {
    const emailVerified = req.auth?.user?.emailVerified;
    const isVerifyEmailPage = pathname === '/verificar-email';

    if (!emailVerified && !isVerifyEmailPage) {
      const absoluteURL = new URL('/verificar-email', req.nextUrl.origin);
      return NextResponse.redirect(absoluteURL);
    }
  }

  // Cria resposta base
  const response = NextResponse.next();

  // Verifica storage se usuário está logado e acessando páginas de projeto
  if (isLoggedIn && req.auth?.user?.id && pathname.includes('/projetos')) {
    try {
      const storageCheck = await checkStorageLimit(req.auth.user.id);

      // Adiciona header de warning se usuário está próximo do limite (>90%)
      if (storageCheck.percentage >= 90) {
        response.headers.set('X-Storage-Warning', 'true');
        response.headers.set('X-Storage-Percentage', storageCheck.percentage.toString());
      }
    } catch (error) {
      // Silencia erros de verificação de storage no middleware
      console.warn('Erro ao verificar storage no middleware:', error);
    }
  }

  return response;
});

// Configuração do matcher para otimizar performance
// Apenas rotas que precisam de verificação são processadas
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/briefing/:path*',
    '/projetos/:path*',
    '/configuracoes/:path*',
    '/api/auth/verify-email',
  ],
};
