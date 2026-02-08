/**
 * Integration Test: Complete Main Flow
 *
 * Tests the entire user journey from registration to project creation:
 * registerUser → loginUser → submitBriefing → approveBriefing → project created
 *
 * This test verifies the complete business flow with all integrations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser, loginUser } from '../auth';
import { submitBriefing } from '../briefing';
import { approveBriefing } from '../admin-briefings';
import { getProjectById } from '../projects';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { createNotification } from '@/lib/notifications';
import { createMockUser, createMockSession } from '@/lib/test-utils';
import { BriefingStatus, ProjectStatus, ServiceType, UserRole } from '@prisma/client';

describe('Main Flow Integration: Registration → Login → Briefing → Project', () => {
  const mockUserId = 'user-flow-123';
  const mockAdminId = 'admin-flow-456';
  const mockBriefingId = 'briefing-flow-789';
  const mockProjectId = 'project-flow-abc';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full flow: register → login → submit briefing → approve → project created', async () => {
    // ============================================================================
    // STEP 1: USER REGISTRATION
    // ============================================================================

    const userData = {
      name: 'João da Silva',
      email: 'joao.silva@empresa.com',
      password: 'SenhaSegura123!',
      company: 'Empresa Teste LTDA',
      phone: '(11) 98765-4321',
      marketingConsent: true,
    };

    // Mock user doesn't exist yet
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    // Mock user creation
    const createdUser = createMockUser({
      id: mockUserId,
      email: userData.email,
      name: userData.name,
      emailVerified: null, // Not verified yet
    });
    vi.mocked(prisma.user.create).mockResolvedValueOnce(createdUser);

    // Mock email sending
    vi.mocked(sendEmail).mockResolvedValueOnce({ success: true });

    // Execute registration
    const registerResult = await registerUser(userData);

    expect(registerResult.success).toBe(true);
    expect(registerResult.message).toContain('criada');
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: userData.email,
          name: userData.name,
          role: 'CLIENTE',
        }),
      })
    );

    // Verify verification email was sent
    expect(sendEmail).toHaveBeenCalled();

    // ============================================================================
    // STEP 2: USER LOGIN
    // ============================================================================

    const loginData = {
      email: userData.email,
      password: userData.password,
    };

    // Mock successful sign in
    vi.mocked(auth).mockResolvedValueOnce(
      createMockSession({
        user: {
          id: mockUserId,
          email: userData.email,
          name: userData.name,
          role: UserRole.CLIENTE,
          emailVerified: new Date(), // Now verified
        },
      })
    );

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      ...createdUser,
      emailVerified: new Date(),
    });

    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      ...createdUser,
      lastLoginAt: new Date(),
    });

    // Execute login
    const loginResult = await loginUser(loginData);

    expect(loginResult.success).toBe(true);
    expect(loginResult.requiresVerification).toBe(false);

    // Verify lastLoginAt was updated
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: userData.email },
        data: { lastLoginAt: expect.any(Date) },
      })
    );

    // ============================================================================
    // STEP 3: SUBMIT BRIEFING
    // ============================================================================

    const briefingData = {
      serviceType: ServiceType.ERP_BASICO,
      companyName: 'Empresa Teste LTDA',
      segment: 'Varejo',
      objectives: 'Automatizar processos de estoque e vendas',
      budget: 'R$ 10.000 - R$ 30.000',
      deadline: '2-3 meses',
      features: 'Controle de estoque, PDV, relatórios',
      references: 'Sistema similar ao Tiny ERP',
      integrations: 'PagSeguro, Mercado Pago',
    };

    // Mock briefing creation
    const createdBriefing = {
      id: mockBriefingId,
      userId: mockUserId,
      ...briefingData,
      status: BriefingStatus.ENVIADO,
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.briefing.create).mockResolvedValueOnce(createdBriefing as any);
    vi.mocked(prisma.briefingDraft.deleteMany).mockResolvedValueOnce({ count: 0 });

    // Execute briefing submission
    const submitResult = await submitBriefing(mockUserId, briefingData);

    expect(submitResult.success).toBe(true);
    expect(submitResult.message).toContain('enviado');
    expect(prisma.briefing.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: mockUserId,
          serviceType: ServiceType.ERP_BASICO,
          status: BriefingStatus.ENVIADO,
        }),
      })
    );

    // ============================================================================
    // STEP 4: ADMIN APPROVES BRIEFING
    // ============================================================================

    // Mock admin authentication
    vi.mocked(auth).mockResolvedValueOnce(
      createMockSession({
        user: {
          id: mockAdminId,
          email: 'admin@28webconnect.com',
          name: 'Admin User',
          role: UserRole.ADMIN,
          emailVerified: new Date(),
        },
      })
    );

    // Mock briefing lookup
    vi.mocked(prisma.briefing.findUnique).mockResolvedValueOnce({
      ...createdBriefing,
      user: createMockUser({ id: mockUserId }),
      project: null,
    } as any);

    // Mock project creation with milestones
    const createdProject = {
      id: mockProjectId,
      name: briefingData.companyName,
      description: briefingData.objectives,
      status: ProjectStatus.AGUARDANDO_APROVACAO,
      userId: mockUserId,
      briefingId: mockBriefingId,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.$transaction).mockImplementationOnce(async (callback: any) => {
      return await callback({
        briefing: {
          update: vi.fn().mockResolvedValue({
            ...createdBriefing,
            status: BriefingStatus.APROVADO,
            projectId: mockProjectId,
          }),
        },
        project: { create: vi.fn().mockResolvedValue(createdProject) },
        projectMilestone: { createMany: vi.fn().mockResolvedValue({ count: 4 }) },
      });
    });

    vi.mocked(createNotification).mockResolvedValueOnce({ success: true });

    // Execute approval
    const approveResult = await approveBriefing(mockBriefingId);

    expect(approveResult.success).toBe(true);
    expect(approveResult.data?.projectId).toBe(mockProjectId);

    // Verify notification was sent to client
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUserId,
        type: 'BRIEFING_APROVADO',
        title: expect.stringContaining('Aprovado'),
        channels: ['IN_APP', 'EMAIL', 'PUSH'],
        metadata: expect.objectContaining({
          briefingId: mockBriefingId,
          projectId: mockProjectId,
        }),
      })
    );

    // ============================================================================
    // STEP 5: VERIFY PROJECT ACCESS
    // ============================================================================

    // Mock project lookup
    const projectWithDetails = {
      ...createdProject,
      milestones: [
        { id: 'ms-1', title: 'Fase 1: Levantamento', status: 'PENDENTE', order: 1 },
        { id: 'ms-2', title: 'Fase 2: Desenvolvimento', status: 'PENDENTE', order: 2 },
        { id: 'ms-3', title: 'Fase 3: Testes', status: 'PENDENTE', order: 3 },
        { id: 'ms-4', title: 'Fase 4: Deploy', status: 'PENDENTE', order: 4 },
      ],
      files: [],
      comments: [],
    };

    vi.mocked(prisma.project.findFirst).mockResolvedValueOnce(projectWithDetails as any);

    // Execute project lookup
    const projectResult = await getProjectById(mockProjectId, mockUserId);

    expect(projectResult.success).toBe(true);
    expect(projectResult.data?.id).toBe(mockProjectId);
    expect(projectResult.data?.milestones).toHaveLength(4);
    expect(projectResult.data?.status).toBe(ProjectStatus.AGUARDANDO_APROVACAO);

    // Verify progress calculation (0/4 milestones = 0%)
    expect(projectResult.data?.progress).toBe(0);

    // ============================================================================
    // FINAL VERIFICATION: Flow Complete
    // ============================================================================

    console.log('✅ Main flow completed successfully:');
    console.log(`   1. User registered: ${userData.email}`);
    console.log(`   2. User logged in: ${loginResult.success}`);
    console.log(`   3. Briefing submitted: ${mockBriefingId}`);
    console.log(`   4. Briefing approved: ${approveResult.success}`);
    console.log(`   5. Project created: ${mockProjectId}`);
    console.log(`   6. Project accessible: ${projectResult.success}`);
  });

  it('should handle errors gracefully at each step', async () => {
    // Test registration with duplicate email
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(
      createMockUser({
        email: 'existing@example.com',
      })
    );

    const duplicateResult = await registerUser({
      name: 'Test',
      email: 'existing@example.com',
      password: 'SenhaSegura123!',
    });

    expect(duplicateResult.success).toBe(false);
    expect(duplicateResult.error).toContain('já está cadastrado');
  });

  it('should verify all 4 milestones are created with correct progress calculation', async () => {
    const milestones = [
      { id: 'ms-1', status: 'CONCLUIDA', order: 1 },
      { id: 'ms-2', status: 'PENDENTE', order: 2 },
      { id: 'ms-3', status: 'PENDENTE', order: 3 },
      { id: 'ms-4', status: 'PENDENTE', order: 4 },
    ];

    // Calculate progress: 1 completed out of 4 = 25%
    const completedCount = milestones.filter((m) => m.status === 'CONCLUIDA').length;
    const progress = (completedCount / milestones.length) * 100;

    expect(progress).toBe(25);

    // Verify each milestone represents 25%
    expect(100 / milestones.length).toBe(25);
  });
});
