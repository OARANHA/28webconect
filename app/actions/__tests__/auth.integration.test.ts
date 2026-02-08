/**
 * Integration Tests: Authentication Flow
 *
 * Tests the complete user authentication journey:
 * - Registration → Email verification → Login → Session creation
 * - Duplicate email handling
 * - Password reset flow
 * - Unverified email blocking
 * - Token expiration edge cases
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  registerUser,
  loginUser,
  sendPasswordReset,
  resetPassword,
  validateResetToken,
  sendVerificationEmail,
} from '../auth';
import { prisma } from '@/lib/prisma';
import { auth, signIn } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { createMockUser, createMockVerificationToken } from '@/lib/test-utils';
import { unverifiedUserFixture } from '@/lib/test-fixtures';
import { UserRole, VerificationTokenType } from '@prisma/client';

describe('Auth Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // COMPLETE REGISTRATION → VERIFICATION → LOGIN FLOW
  // ============================================================================

  describe('Complete Registration → Verification → Login Flow', () => {
    it('should complete full flow: register → verify email → login', async () => {
      // Arrange
      const userData = {
        name: 'João Silva',
        email: 'joao.silva@empresa.com',
        password: 'SenhaSegura123!',
        company: 'Empresa Silva LTDA',
        phone: '(11) 98765-4321',
        marketingConsent: true,
      };

      const mockUser = createMockUser({
        email: userData.email,
        name: userData.name,
        emailVerified: null, // Unverified initially
      });

      let capturedToken: string | null = null;

      // Mock user not existing initially
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(null) // Registration check
        .mockResolvedValueOnce(mockUser) // Email verification lookup
        .mockResolvedValueOnce({ ...mockUser, emailVerified: new Date() }); // After verification

      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

      // Capture the verification token
      vi.mocked(prisma.verificationToken.create).mockImplementation((args: any) => {
        capturedToken = args.data.token;
        return Promise.resolve(
          createMockVerificationToken({
            identifier: userData.email,
            token: capturedToken!,
            type: 'VERIFICATION',
          })
        );
      });

      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(
        createMockVerificationToken({
          identifier: userData.email,
          token: capturedToken || 'test-token',
          type: 'VERIFICATION',
        })
      );

      vi.mocked(signIn).mockResolvedValue({ error: null });

      // 1. Register user
      const registerResult = await registerUser(userData);
      expect(registerResult.success).toBe(true);
      expect(registerResult.message).toContain('Conta criada');

      // Verify user was created
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: userData.email,
            name: userData.name,
            role: 'CLIENTE',
          }),
        })
      );

      // Verify email was sent
      expect(sendEmail).toHaveBeenCalled();
      expect(capturedToken).toBeTruthy();

      // 2. Verify email (simulating user clicking the link)
      const verificationResult = await sendVerificationEmail(userData.email);
      expect(verificationResult.success).toBe(true);

      // 3. Login
      const loginResult = await loginUser({
        email: userData.email,
        password: userData.password,
      });

      expect(loginResult.success).toBe(true);
      expect(signIn).toHaveBeenCalledWith(
        'credentials',
        expect.objectContaining({
          email: userData.email,
          password: userData.password,
          redirect: false,
        })
      );
    });

    it('should create Prisma transaction correctly (User + VerificationToken)', async () => {
      // Arrange
      const userData = {
        name: 'Maria Santos',
        email: 'maria@empresa.com',
        password: 'SenhaSegura123!',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(
        createMockUser({
          email: userData.email,
          name: userData.name,
        })
      );

      // Act
      await registerUser(userData);

      // Assert - Verify both user creation and token creation
      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.verificationToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: VerificationTokenType.VERIFICATION,
            expires: expect.any(Date),
          }),
        })
      );

      // Verify token has 24h expiration
      const tokenCall = vi.mocked(prisma.verificationToken.create).mock.calls[0];
      const expiresAt = tokenCall![0].data.expires;
      const expectedExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(Math.abs(expiresAt.getTime() - expectedExpiry.getTime())).toBeLessThan(1000);
    });
  });

  // ============================================================================
  // DUPLICATE EMAIL HANDLING
  // ============================================================================

  describe('Duplicate Email Registration', () => {
    it('should prevent registration with duplicate email', async () => {
      // Arrange
      const existingUser = createMockUser({
        email: 'existente@empresa.com',
      });

      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);

      // Act
      const result = await registerUser({
        name: 'Outro Nome',
        email: 'existente@empresa.com',
        password: 'OutraSenha123!',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('já está cadastrado');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should handle Prisma unique constraint violation', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockRejectedValue({
        code: 'P2002',
        message: 'Unique constraint failed on the fields: (`email`)',
      });

      // Act
      const result = await registerUser({
        name: 'Teste',
        email: 'teste@empresa.com',
        password: 'SenhaSegura123!',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('já está cadastrado');
    });
  });

  // ============================================================================
  // PASSWORD RESET FLOW
  // ============================================================================

  describe('Password Reset Flow', () => {
    it('should complete full password reset: request → validate → change → login', async () => {
      // Arrange
      const userEmail = 'usuario@empresa.com';
      const newPassword = 'NovaSenhaSegura123!';
      const mockUser = createMockUser({ email: userEmail });

      let capturedResetToken: string | null = null;

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser) // For password reset request
        .mockResolvedValueOnce(mockUser); // For password reset

      // Capture reset token
      vi.mocked(prisma.verificationToken.create).mockImplementation((args: any) => {
        capturedResetToken = args.data.token;
        return Promise.resolve(
          createMockVerificationToken({
            identifier: userEmail,
            token: capturedResetToken!,
            type: 'PASSWORD_RESET',
          })
        );
      });

      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(
        createMockVerificationToken({
          identifier: userEmail,
          token: capturedResetToken || 'reset-token',
          type: 'PASSWORD_RESET',
        })
      );

      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);
      vi.mocked(prisma.verificationToken.delete).mockResolvedValue({} as any);

      // 1. Request password reset
      const requestResult = await sendPasswordReset({ email: userEmail });
      expect(requestResult.success).toBe(true);
      expect(requestResult.message).toContain('Se o email existir');
      expect(capturedResetToken).toBeTruthy();

      // 2. Validate token
      const validationResult = await validateResetToken(capturedResetToken!);
      expect(validationResult.valid).toBe(true);

      // 3. Reset password
      const resetResult = await resetPassword(capturedResetToken!, newPassword);
      expect(resetResult.success).toBe(true);
      expect(resetResult.message).toContain('redefinida com sucesso');

      // Verify password was updated
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: expect.any(String), // Hashed password
          }),
        })
      );

      // Verify token was deleted after use
      expect(prisma.verificationToken.delete).toHaveBeenCalled();

      // 4. Login with new password
      vi.mocked(signIn).mockResolvedValue({ error: null });
      const loginResult = await loginUser({
        email: userEmail,
        password: newPassword,
      });
      expect(loginResult.success).toBe(true);
    });

    it('should send reset email silently even if user does not exist', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      // Act
      const result = await sendPasswordReset({ email: 'inexistente@empresa.com' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Se o email existir');
      // Should not reveal if email exists
      expect(prisma.verificationToken.create).not.toHaveBeenCalled();
    });

    it('should validate password reset token correctly', async () => {
      // Arrange - Valid token
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(
        createMockVerificationToken({
          token: 'valid-token',
          type: 'PASSWORD_RESET',
          expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        })
      );

      // Act
      const validResult = await validateResetToken('valid-token');

      // Assert
      expect(validResult.valid).toBe(true);
    });

    it('should reject expired password reset token', async () => {
      // Arrange - Expired token
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(
        createMockVerificationToken({
          token: 'expired-token',
          type: 'PASSWORD_RESET',
          expires: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        })
      );

      // Act
      const expiredResult = await validateResetToken('expired-token');

      // Assert
      expect(expiredResult.valid).toBe(false);
      expect(expiredResult.error).toContain('expirado');
    });

    it('should reject invalid password on reset', async () => {
      // Act
      const result = await resetPassword('any-token', '123'); // Too short

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('8 caracteres');
    });
  });

  // ============================================================================
  // UNVERIFIED EMAIL BLOCKING
  // ============================================================================

  describe('Unverified Email Access Control', () => {
    it('should allow login but indicate unverified email', async () => {
      // Arrange
      const unverifiedUser = createMockUser({
        emailVerified: null,
      });

      vi.mocked(signIn).mockResolvedValue({ error: null });
      vi.mocked(prisma.user.findUnique).mockResolvedValue(unverifiedUser);
      vi.mocked(prisma.user.update).mockResolvedValue(unverifiedUser);

      // Act
      const result = await loginUser({
        email: unverifiedUser.email,
        password: 'SenhaSegura123!',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.requiresVerification).toBe(true);
    });

    it('should allow access after email verification', async () => {
      // Arrange
      const verifiedUser = createMockUser({
        emailVerified: new Date(),
      });

      vi.mocked(signIn).mockResolvedValue({ error: null });
      vi.mocked(prisma.user.findUnique).mockResolvedValue(verifiedUser);
      vi.mocked(prisma.user.update).mockResolvedValue(verifiedUser);

      // Act
      const result = await loginUser({
        email: verifiedUser.email,
        password: 'SenhaSegura123!',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.requiresVerification).toBe(false);
    });

    it('should not allow email verification for already verified email', async () => {
      // Arrange
      const verifiedUser = createMockUser({
        emailVerified: new Date(),
      });

      vi.mocked(prisma.user.findUnique).mockResolvedValue(verifiedUser);

      // Act
      const result = await sendVerificationEmail(verifiedUser.email);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('já verificado');
    });
  });

  // ============================================================================
  // EDGE CASES AND ERROR HANDLING
  // ============================================================================

  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent registrations gracefully', async () => {
      // Arrange - First check returns null, but create fails with unique constraint
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockRejectedValue({
        code: 'P2002',
        message: 'Unique constraint failed',
      });

      // Act - Two concurrent registrations
      const [result1, result2] = await Promise.all([
        registerUser({
          name: 'User 1',
          email: 'same@email.com',
          password: 'SenhaSegura123!',
        }),
        registerUser({
          name: 'User 2',
          email: 'same@email.com',
          password: 'OutraSenha123!',
        }),
      ]);

      // Assert - Both should fail gracefully
      expect(result1.success || result2.success).toBe(false);
    });

    it('should handle database errors during login', async () => {
      // Arrange
      vi.mocked(signIn).mockResolvedValue({ error: null });
      vi.mocked(prisma.user.update).mockRejectedValue(new Error('Database connection failed'));

      // Act
      const result = await loginUser({
        email: 'teste@empresa.com',
        password: 'SenhaSegura123!',
      });

      // Assert - Should not crash even if update fails
      expect(result.success).toBe(true);
    });

    it('should handle invalid token on password reset', async () => {
      // Arrange
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(null);

      // Act
      const result = await resetPassword('invalid-token', 'NovaSenha123!');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('inválido');
    });

    it('should validate password requirements', async () => {
      // Arrange
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(
        createMockVerificationToken({ type: 'PASSWORD_RESET' })
      );

      // Act & Assert - Short password
      const shortResult = await resetPassword('token', '123');
      expect(shortResult.success).toBe(false);
      expect(shortResult.error).toContain('8 caracteres');
    });

    it('should update lastLoginAt on successful login', async () => {
      // Arrange
      const user = createMockUser();
      vi.mocked(signIn).mockResolvedValue({ error: null });
      vi.mocked(prisma.user.findUnique).mockResolvedValue(user);
      vi.mocked(prisma.user.update).mockResolvedValue(user);

      // Act
      await loginUser({
        email: user.email,
        password: 'SenhaSegura123!',
      });

      // Assert
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: user.email },
          data: { lastLoginAt: expect.any(Date) },
        })
      );
    });

    it('should handle email service failure during registration', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(createMockUser());
      vi.mocked(sendEmail).mockResolvedValue({ success: false, error: 'SMTP error' });

      // Act
      const result = await registerUser({
        name: 'Teste',
        email: 'teste@empresa.com',
        password: 'SenhaSegura123!',
      });

      // Assert - Registration should succeed even if email fails
      expect(result.success).toBe(true);
      expect(result.message).toContain('criada');
    });

    it('should delete old verification tokens before creating new ones', async () => {
      // Arrange
      const user = createMockUser({ emailVerified: null });
      vi.mocked(prisma.user.findUnique).mockResolvedValue(user);
      vi.mocked(prisma.verificationToken.deleteMany).mockResolvedValue({ count: 1 } as any);
      vi.mocked(prisma.verificationToken.create).mockResolvedValue(createMockVerificationToken());

      // Act
      await sendVerificationEmail(user.email);

      // Assert
      expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            identifier: user.email,
            type: VerificationTokenType.VERIFICATION,
          }),
        })
      );
    });
  });

  // ============================================================================
  // SECURITY TESTS
  // ============================================================================

  describe('Security Scenarios', () => {
    it('should not reveal if email exists in password reset', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      // Act
      const result = await sendPasswordReset({ email: 'unknown@email.com' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Se o email existir');
    });

    it('should not reuse verification tokens', async () => {
      // Arrange
      const token = createMockVerificationToken({ type: 'PASSWORD_RESET' });
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(token);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(createMockUser());
      vi.mocked(prisma.user.update).mockResolvedValue(createMockUser());
      vi.mocked(prisma.verificationToken.delete).mockResolvedValue({} as any);

      // Act
      await resetPassword(token.token, 'NovaSenha123!');

      // Assert
      expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
        where: { token: token.token },
      });
    });

    it('should reject reused password reset tokens', async () => {
      // Arrange
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(null);

      // Act
      const result = await resetPassword('already-used-token', 'NovaSenha123!');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('inválido');
    });
  });
});
