/**
 * Unit Tests: Authentication Server Actions
 *
 * Tests for authentication-related server actions:
 * - registerUser
 * - loginUser
 * - sendPasswordReset
 * - resetPassword
 * - sendVerificationEmail
 * - validateResetToken
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  registerUser,
  loginUser,
  sendPasswordReset,
  resetPassword,
  sendVerificationEmail,
  validateResetToken,
} from '../auth';
import { prisma } from '@/lib/prisma';
import { signIn } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { createMockUser, createMockVerificationToken } from '@/lib/test-utils';
import { VerificationTokenType } from '@prisma/client';

describe('Auth Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // REGISTER USER
  // ============================================================================

  describe('registerUser', () => {
    it('should register a new user with valid data', async () => {
      // Arrange
      const userData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'SenhaSegura123!',
        company: 'Empresa Teste',
        phone: '(11) 99999-9999',
        marketingConsent: true,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(
        createMockUser({
          email: userData.email,
          name: userData.name,
        })
      );
      vi.mocked(sendEmail).mockResolvedValue({ success: true });

      // Act
      const result = await registerUser(userData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('criada');
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: userData.email,
            name: userData.name,
            role: 'CLIENTE',
          }),
        })
      );
    });

    it('should return error for existing email', async () => {
      // Arrange
      const existingUser = createMockUser({ email: 'exists@example.com' });
      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);

      // Act
      const result = await registerUser({
        name: 'Teste',
        email: 'exists@example.com',
        password: 'SenhaSegura123!',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('já está cadastrado');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should handle short password error', async () => {
      // Act
      const result = await registerUser({
        name: 'Teste',
        email: 'teste@example.com',
        password: '123', // Too short
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('8 caracteres');
    });

    it('should handle Prisma unique constraint error', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockRejectedValue({
        code: 'P2002',
        message: 'Unique constraint failed',
      });

      // Act
      const result = await registerUser({
        name: 'Teste',
        email: 'teste@example.com',
        password: 'SenhaSegura123!',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('já está cadastrado');
    });

    it('should not block registration if email fails to send', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(createMockUser());
      vi.mocked(sendEmail).mockResolvedValue({ success: false, error: 'SMTP error' });

      // Act
      const result = await registerUser({
        name: 'Teste',
        email: 'teste@example.com',
        password: 'SenhaSegura123!',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('criada');
    });
  });

  // ============================================================================
  // LOGIN USER
  // ============================================================================

  describe('loginUser', () => {
    it('should login with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'joao@example.com',
        password: 'SenhaSegura123!',
      };

      vi.mocked(signIn).mockResolvedValue({ error: null });
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        createMockUser({
          email: loginData.email,
          emailVerified: new Date(),
        })
      );
      vi.mocked(prisma.user.update).mockResolvedValue(createMockUser());

      // Act
      const result = await loginUser(loginData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.requiresVerification).toBe(false);
      expect(signIn).toHaveBeenCalledWith(
        'credentials',
        expect.objectContaining({
          email: loginData.email,
          password: loginData.password,
          redirect: false,
        })
      );
    });

    it('should indicate unverified email', async () => {
      // Arrange
      vi.mocked(signIn).mockResolvedValue({ error: null });
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        createMockUser({
          emailVerified: null, // Unverified
        })
      );
      vi.mocked(prisma.user.update).mockResolvedValue(createMockUser());

      // Act
      const result = await loginUser({
        email: 'teste@example.com',
        password: 'SenhaSegura123!',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.requiresVerification).toBe(true);
    });

    it('should return error for invalid credentials', async () => {
      // Arrange
      vi.mocked(signIn).mockResolvedValue({ error: 'CredentialsSignin' });

      // Act
      const result = await loginUser({
        email: 'teste@example.com',
        password: 'SenhaErrada123!',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('incorretos');
    });

    it('should update lastLoginAt on successful login', async () => {
      // Arrange
      vi.mocked(signIn).mockResolvedValue({ error: null });
      vi.mocked(prisma.user.findUnique).mockResolvedValue(createMockUser());
      vi.mocked(prisma.user.update).mockResolvedValue(createMockUser());

      // Act
      await loginUser({
        email: 'teste@example.com',
        password: 'SenhaSegura123!',
      });

      // Assert
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { lastLoginAt: expect.any(Date) },
        })
      );
    });
  });

  // ============================================================================
  // SEND PASSWORD RESET
  // ============================================================================

  describe('sendPasswordReset', () => {
    it('should send reset email for existing user', async () => {
      // Arrange
      const email = 'joao@example.com';
      vi.mocked(prisma.user.findUnique).mockResolvedValue(createMockUser({ email }));
      vi.mocked(prisma.verificationToken.deleteMany).mockResolvedValue({ count: 0 });
      vi.mocked(prisma.verificationToken.create).mockResolvedValue(
        createMockVerificationToken({
          identifier: email,
          type: 'PASSWORD_RESET',
        })
      );
      vi.mocked(sendEmail).mockResolvedValue({ success: true });

      // Act
      const result = await sendPasswordReset({ email });

      // Assert
      expect(result.success).toBe(true);
      expect(prisma.verificationToken.create).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
    });

    it('should return success even for non-existing user (security)', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      // Act
      const result = await sendPasswordReset({ email: 'unknown@example.com' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Se o email existir');
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should delete old tokens before creating new one', async () => {
      // Arrange
      const email = 'joao@example.com';
      vi.mocked(prisma.user.findUnique).mockResolvedValue(createMockUser({ email }));
      vi.mocked(prisma.verificationToken.deleteMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.verificationToken.create).mockResolvedValue(createMockVerificationToken());
      vi.mocked(sendEmail).mockResolvedValue({ success: true });

      // Act
      await sendPasswordReset({ email });

      // Assert
      expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            identifier: email,
            type: VerificationTokenType.PASSWORD_RESET,
          }),
        })
      );
    });
  });

  // ============================================================================
  // RESET PASSWORD
  // ============================================================================

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      // Arrange
      const token = 'valid-token';
      const newPassword = 'NovaSenhaSegura123!';
      const user = createMockUser();

      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(
        createMockVerificationToken({
          token,
          type: 'PASSWORD_RESET',
          expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        })
      );
      vi.mocked(prisma.user.findUnique).mockResolvedValue(user);
      vi.mocked(prisma.user.update).mockResolvedValue(user);
      vi.mocked(prisma.verificationToken.delete).mockResolvedValue({} as any);

      // Act
      const result = await resetPassword(token, newPassword);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('redefinida');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: expect.any(String),
          }),
        })
      );
      expect(prisma.verificationToken.delete).toHaveBeenCalledWith({ where: { token } });
    });

    it('should reject short password', async () => {
      // Act
      const result = await resetPassword('token', '123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('8 caracteres');
    });

    it('should reject invalid token', async () => {
      // Arrange
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(null);

      // Act
      const result = await resetPassword('invalid-token', 'NovaSenha123!');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('inválido');
    });

    it('should reject expired token', async () => {
      // Arrange
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(
        createMockVerificationToken({
          token: 'expired-token',
          type: 'PASSWORD_RESET',
          expires: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        })
      );

      // Act
      const result = await resetPassword('expired-token', 'NovaSenha123!');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('expirado');
    });
  });

  // ============================================================================
  // SEND VERIFICATION EMAIL
  // ============================================================================

  describe('sendVerificationEmail', () => {
    it('should send verification email for unverified user', async () => {
      // Arrange
      const email = 'unverified@example.com';
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        createMockUser({
          email,
          emailVerified: null,
        })
      );
      vi.mocked(prisma.verificationToken.deleteMany).mockResolvedValue({ count: 0 });
      vi.mocked(prisma.verificationToken.create).mockResolvedValue(createMockVerificationToken());
      vi.mocked(sendEmail).mockResolvedValue({ success: true });

      // Act
      const result = await sendVerificationEmail(email);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('enviado');
      expect(sendEmail).toHaveBeenCalled();
    });

    it('should reject for already verified email', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        createMockUser({
          emailVerified: new Date(),
        })
      );

      // Act
      const result = await sendVerificationEmail('verified@example.com');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('já verificado');
    });

    it('should return success for non-existing user (security)', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      // Act
      const result = await sendVerificationEmail('unknown@example.com');

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Se o email existir');
    });
  });

  // ============================================================================
  // VALIDATE RESET TOKEN
  // ============================================================================

  describe('validateResetToken', () => {
    it('should validate non-expired token', async () => {
      // Arrange
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(
        createMockVerificationToken({
          token: 'valid-token',
          type: 'PASSWORD_RESET',
          expires: new Date(Date.now() + 60 * 60 * 1000),
        })
      );

      // Act
      const result = await validateResetToken('valid-token');

      // Assert
      expect(result.valid).toBe(true);
    });

    it('should reject expired token', async () => {
      // Arrange
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(
        createMockVerificationToken({
          token: 'expired-token',
          type: 'PASSWORD_RESET',
          expires: new Date(Date.now() - 60 * 60 * 1000),
        })
      );

      // Act
      const result = await validateResetToken('expired-token');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toContain('expirado');
    });

    it('should reject non-existent token', async () => {
      // Arrange
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(null);

      // Act
      const result = await validateResetToken('non-existent');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toContain('inválido');
    });
  });
});
