import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VerificationTokenType } from '@prisma/client';

/**
 * Rota API para verificação de email
 * GET /api/auth/verify-email?token=xxx
 *
 * Segurança: Apenas tokens do tipo VERIFICATION são aceitos nesta rota.
 * Tokens de PASSWORD_RESET não podem ser usados para verificar email.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  // 1. Validar se token foi fornecido
  if (!token) {
    return NextResponse.redirect(new URL('/verificar-email?error=token_invalido', request.url));
  }

  try {
    // 2. Buscar token no banco apenas do tipo VERIFICATION
    // Isso impede que um token de PASSWORD_RESET seja usado para verificar email
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: VerificationTokenType.VERIFICATION,
      },
    });

    // 3. Validar se token existe
    if (!tokenRecord) {
      return NextResponse.redirect(new URL('/verificar-email?error=token_invalido', request.url));
    }

    // 4. Validar se token não expirou
    if (tokenRecord.expires < new Date()) {
      return NextResponse.redirect(new URL('/verificar-email?error=token_expirado', request.url));
    }

    // 5. Buscar usuário pelo identifier (email)
    const user = await prisma.user.findUnique({
      where: { email: tokenRecord.identifier },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/verificar-email?error=token_invalido', request.url));
    }

    // 6. Atualizar emailVerified
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // 7. Deletar token usado (one-time use)
    await prisma.verificationToken.delete({
      where: { token },
    });

    // 8. Redirecionar para dashboard com sucesso
    return NextResponse.redirect(new URL('/dashboard?verified=true', request.url));
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return NextResponse.redirect(new URL('/verificar-email?error=erro_servidor', request.url));
  }
}
