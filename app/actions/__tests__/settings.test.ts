import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  updateProfile,
  changePassword,
  downloadUserData,
  deleteAccount,
  revokeMarketingConsent,
  sendLGPDRequest,
} from '../settings';
import { prisma } from '@/lib/prisma';
import { hashPassword, comparePassword } from '@/lib/auth-utils';
import { sendEmail } from '@/lib/email';
import { createNotification } from '@/lib/notifications';
import { LEGAL } from '@/lib/constants';

// Mocks
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    verificationToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
    session: {
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-utils', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn(),
}));

vi.mock('@/lib/notifications', () => ({
  createNotification: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  signOut: vi.fn(),
}));

vi.mock('@/lib/constants', () => ({
  LEGAL: {
    companyName: '28Web Connect',
    dpoEmail: 'dpo@28webconnect.com',
    siteUrl: 'https://28webconnect.com',
  },
}));

vi.mock('@/lib/email-templates/verification-email', () => ({
  getVerificationEmailTemplate: vi.fn(() => ({
    subject: 'Verifique seu email',
    html: '<html>Verificação</html>',
    text: 'Verificação',
  })),
}));

vi.mock('@/lib/email-templates/lgpd-request', () => ({
  getLGPDRequestEmailTemplate: vi.fn(() => ({
    subject: '[LGPD] Solicitação',
    html: '<html>LGPD</html>',
    text: 'LGPD',
  })),
}));

describe('Settings Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '(11) 98765-4321',
        company: 'Empresa Teste',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

      const result = await updateProfile('user-1', {
        name: 'João Atualizado',
        email: 'joao@example.com',
        phone: '(11) 98765-4321',
        company: 'Empresa Teste',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Perfil atualizado com sucesso!');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          name: 'João Atualizado',
          email: 'joao@example.com',
          phone: '(11) 98765-4321',
          company: 'Empresa Teste',
        },
      });
    });

    it('should return error when email already exists', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'joao@example.com',
      };

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as any) // current user
        .mockResolvedValueOnce({ id: 'user-2', email: 'novo@example.com' } as any); // existing user

      const result = await updateProfile('user-1', {
        name: 'João',
        email: 'novo@example.com',
        phone: '',
        company: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Este email já está em uso');
    });

    it('should send verification email when email is changed', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'João Silva',
        email: 'antigo@example.com',
      };

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as any)
        .mockResolvedValueOnce(null); // no existing user with new email

      vi.mocked(prisma.user.update).mockResolvedValue({} as any);
      vi.mocked(prisma.verificationToken.create).mockResolvedValue({} as any);
      vi.mocked(sendEmail).mockResolvedValue({ success: true });
      vi.mocked(createNotification).mockResolvedValue({ success: true });

      const result = await updateProfile('user-1', {
        name: 'João Silva',
        email: 'novo@example.com',
        phone: '',
        company: '',
      });

      expect(result.success).toBe(true);
      expect(result.requiresVerification).toBe(true);
      expect(sendEmail).toHaveBeenCalled();
      expect(createNotification).toHaveBeenCalled();
    });

    it('should return error when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await updateProfile('user-1', {
        name: 'João',
        email: 'joao@example.com',
        phone: '',
        company: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuário não encontrado');
    });

    it('should return error for invalid name (too short)', async () => {
      const result = await updateProfile('user-1', {
        name: 'J',
        email: 'joao@example.com',
        phone: '',
        company: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('nome deve ter no mínimo');
    });

    it('should return error for invalid email format', async () => {
      const result = await updateProfile('user-1', {
        name: 'João Silva',
        email: 'email-invalido',
        phone: '',
        company: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('email');
    });

    it('should return error for invalid phone format', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'joao@example.com',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await updateProfile('user-1', {
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '12345678',
        company: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('telefone');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'joao@example.com',
        password: 'hashedPassword123',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(comparePassword).mockResolvedValue(true);
      vi.mocked(hashPassword).mockResolvedValue('newHashedPassword');
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);
      vi.mocked(prisma.session.deleteMany).mockResolvedValue({} as any);
      vi.mocked(createNotification).mockResolvedValue({ success: true });

      const result = await changePassword('user-1', {
        currentPassword: 'senhaAtual123',
        newPassword: 'novaSenha123',
        confirmPassword: 'novaSenha123',
      });

      expect(result.success).toBe(true);
      expect(comparePassword).toHaveBeenCalledWith('senhaAtual123', 'hashedPassword123');
      expect(hashPassword).toHaveBeenCalledWith('novaSenha123');
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
      expect(createNotification).toHaveBeenCalled();
    });

    it('should return error when current password is incorrect', async () => {
      const mockUser = {
        id: 'user-1',
        password: 'hashedPassword123',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(comparePassword).mockResolvedValue(false);

      const result = await changePassword('user-1', {
        currentPassword: 'senhaErrada',
        newPassword: 'novaSenha123',
        confirmPassword: 'novaSenha123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Senha atual incorreta');
    });

    it('should return error when passwords do not match', async () => {
      const result = await changePassword('user-1', {
        currentPassword: 'senhaAtual123',
        newPassword: 'novaSenha123',
        confirmPassword: 'senhaDiferente123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('não correspondem');
    });

    it('should return error when new password is same as current', async () => {
      const result = await changePassword('user-1', {
        currentPassword: 'mesmaSenha123',
        newPassword: 'mesmaSenha123',
        confirmPassword: 'mesmaSenha123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('diferente');
    });

    it('should return error for password too short', async () => {
      const result = await changePassword('user-1', {
        currentPassword: 'senhaAtual123',
        newPassword: 'curta',
        confirmPassword: 'curta',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('mínimo 8 caracteres');
    });

    it('should return error when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await changePassword('user-1', {
        currentPassword: 'senhaAtual123',
        newPassword: 'novaSenha123',
        confirmPassword: 'novaSenha123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuário não encontrado');
    });
  });

  describe('downloadUserData', () => {
    it('should return user data in correct structure', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '(11) 98765-4321',
        company: 'Empresa Teste',
        role: 'CLIENTE',
        marketingConsent: true,
        createdAt: new Date('2026-01-15'),
        lastLoginAt: new Date('2026-02-06'),
        briefings: [
          {
            id: 'briefing-1',
            serviceType: 'ERP_BASICO',
            companyName: 'Empresa XYZ',
            segment: 'Tecnologia',
            objectives: 'Crescer',
            budget: '10000',
            deadline: '2026-03-01',
            features: 'Feature 1',
            references: 'Ref 1',
            integrations: 'Int 1',
            status: 'APROVADO',
            createdAt: new Date('2026-01-20'),
            submittedAt: new Date('2026-01-21'),
          },
        ],
        projects: [
          {
            id: 'project-1',
            name: 'ERP Cloud',
            description: 'Projeto ERP',
            status: 'ATIVO',
            progress: 50,
            createdAt: new Date('2026-01-25'),
            milestones: [],
            files: [],
            comments: [],
          },
        ],
        notifications: [],
        notificationPreferences: [],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await downloadUserData('user-1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('geradoEm');
      expect(result.data).toHaveProperty('usuario');
      expect(result.data).toHaveProperty('briefings');
      expect(result.data).toHaveProperty('projetos');
      expect(result.data).toHaveProperty('notificacoes');
      expect(result.data).toHaveProperty('contatoDPO');

      const data = result.data as any;
      expect(data.usuario.id).toBe('user-1');
      expect(data.usuario.nome).toBe('João Silva');
      expect(data.briefings).toHaveLength(1);
      expect(data.projetos).toHaveLength(1);
      expect(data.contatoDPO.email).toBe(LEGAL.dpoEmail);
    });

    it('should return error when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await downloadUserData('user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuário não encontrado');
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'joao@example.com',
        name: 'João Silva',
        password: 'hashedPassword',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(comparePassword).mockResolvedValue(true);
      vi.mocked(sendEmail).mockResolvedValue({ success: true });
      vi.mocked(prisma.user.delete).mockResolvedValue({} as any);

      const result = await deleteAccount('user-1', 'senhaAtual123', 'EXCLUIR CONTA');

      expect(result.success).toBe(true);
      expect(comparePassword).toHaveBeenCalledWith('senhaAtual123', 'hashedPassword');
      expect(sendEmail).toHaveBeenCalled();
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('should return error when confirmation text is incorrect', async () => {
      const result = await deleteAccount('user-1', 'senhaAtual123', 'TEXTO ERRADO');

      expect(result.success).toBe(false);
      expect(result.error).toContain('EXCLUIR CONTA');
    });

    it('should return error when password is incorrect', async () => {
      const mockUser = {
        id: 'user-1',
        password: 'hashedPassword',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(comparePassword).mockResolvedValue(false);

      const result = await deleteAccount('user-1', 'senhaErrada', 'EXCLUIR CONTA');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Senha incorreta');
    });

    it('should return error when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await deleteAccount('user-1', 'senhaAtual123', 'EXCLUIR CONTA');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuário não encontrado');
    });

    it('should return error for password too short', async () => {
      const result = await deleteAccount('user-1', 'curta', 'EXCLUIR CONTA');

      expect(result.success).toBe(false);
      expect(result.error).toContain('mínimo 8 caracteres');
    });
  });

  describe('revokeMarketingConsent', () => {
    it('should revoke consent successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'joao@example.com',
        name: 'João Silva',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);
      vi.mocked(createNotification).mockResolvedValue({ success: true });
      vi.mocked(sendEmail).mockResolvedValue({ success: true });

      const result = await revokeMarketingConsent('user-1');

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { marketingConsent: false },
      });
      expect(createNotification).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
    });

    it('should return error when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await revokeMarketingConsent('user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuário não encontrado');
    });
  });

  describe('sendLGPDRequest', () => {
    it('should send LGPD request to DPO successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'joao@example.com',
        name: 'João Silva',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(sendEmail).mockResolvedValue({ success: true });
      vi.mocked(createNotification).mockResolvedValue({ success: true });

      const result = await sendLGPDRequest('user-1', {
        requestType: 'ACESSO',
        description: 'Gostaria de acessar todos os meus dados pessoais armazenados.',
      });

      expect(result.success).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: LEGAL.dpoEmail,
          subject: expect.stringContaining('[LGPD]'),
        })
      );
      expect(createNotification).toHaveBeenCalled();
    });

    it('should return error for description too short', async () => {
      const result = await sendLGPDRequest('user-1', {
        requestType: 'ACESSO',
        description: 'Curto',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('mínimo 10 caracteres');
    });

    it('should return error for invalid request type', async () => {
      const result = await sendLGPDRequest('user-1', {
        requestType: 'TIPO_INVALIDO' as any,
        description: 'Descrição válida com mais de 10 caracteres.',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('ACESSO'); // Zod retorna lista de valores válidos
    });

    it('should return error when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await sendLGPDRequest('user-1', {
        requestType: 'ACESSO',
        description: 'Gostaria de acessar todos os meus dados pessoais armazenados.',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuário não encontrado');
    });

    it('should return error when email fails to send', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'joao@example.com',
        name: 'João Silva',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(sendEmail).mockResolvedValue({ success: false, error: 'SMTP Error' });

      const result = await sendLGPDRequest('user-1', {
        requestType: 'ACESSO',
        description: 'Gostaria de acessar todos os meus dados pessoais armazenados.',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Erro ao enviar');
    });

    it('should handle all LGPD request types', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'joao@example.com',
        name: 'João Silva',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(sendEmail).mockResolvedValue({ success: true });
      vi.mocked(createNotification).mockResolvedValue({ success: true });

      const requestTypes = ['ACESSO', 'RETIFICACAO', 'PORTABILIDADE', 'OPOSICAO', 'OUTRO'];

      for (const type of requestTypes) {
        vi.clearAllMocks();
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
        vi.mocked(sendEmail).mockResolvedValue({ success: true });
        vi.mocked(createNotification).mockResolvedValue({ success: true });

        const result = await sendLGPDRequest('user-1', {
          requestType: type as any,
          description: 'Descrição da solicitação com mais de 10 caracteres.',
        });

        expect(result.success).toBe(true);
      }
    });
  });
});
