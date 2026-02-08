import { vi } from 'vitest';

// ============================================================================
// NEXT.JS MOCK
// ============================================================================

// Mock do Next.js auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock do Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock do Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

// ============================================================================
// DATABASE MOCK
// ============================================================================

// Mock do Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    // User
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    // Briefing
    briefing: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    // BriefingDraft
    briefingDraft: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    // Project
    project: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    // ProjectMilestone
    projectMilestone: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    // ProjectFile
    projectFile: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
    },
    // ProjectComment
    projectComment: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    // Notification
    notification: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    // NotificationPreference
    notificationPreference: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    // VerificationToken
    verificationToken: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    // PricingPlan
    pricingPlan: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    // PushSubscription
    pushSubscription: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    // Document (RAG)
    document: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    // DataDeletionLog
    dataDeletionLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    // ChatSession
    chatSession: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    // Account & Session (NextAuth)
    account: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    session: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    // Raw query
    $queryRaw: vi.fn(),
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

// ============================================================================
// EXTERNAL SERVICE MOCKS
// ============================================================================

// Mock do Mailgun / Email
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn(() => Promise.resolve({ success: true })),
}));

// Mock dos templates de email
vi.mock('@/lib/email-templates/verification-email', () => ({
  getVerificationEmailTemplate: vi.fn(() => ({
    html: '<html>Verifique seu email</html>',
    text: 'Verifique seu email',
    subject: 'Verificação de Email',
  })),
}));

vi.mock('@/lib/email-templates/password-reset', () => ({
  getPasswordResetEmailTemplate: vi.fn(() => ({
    html: '<html>Redefina sua senha</html>',
    text: 'Redefina sua senha',
    subject: 'Redefinição de Senha',
  })),
}));

vi.mock('@/lib/email-templates/notification-email', () => ({
  getNotificationEmailTemplate: vi.fn(() => ({
    html: '<html>Nova notificação</html>',
    text: 'Nova notificação',
    subject: 'Notificação',
  })),
}));

vi.mock('@/lib/email-templates/inactivity-warning', () => ({
  getInactivityWarningEmailTemplate: vi.fn(() => ({
    html: '<html>Aviso de inatividade</html>',
    text: 'Aviso de inatividade',
    subject: 'Aviso de Inatividade',
  })),
}));

// Mock do Mistral AI
vi.mock('@mistralai/mistralai', () => ({
  Mistral: vi.fn(() => ({
    embeddings: {
      create: vi.fn(() =>
        Promise.resolve({
          data: [{ embedding: Array(1536).fill(0.1) }],
        })
      ),
    },
    chat: {
      complete: vi.fn(() =>
        Promise.resolve({
          choices: [{ message: { content: 'Resposta do chat' } }],
        })
      ),
    },
  })),
}));

// Mock do web-push
vi.mock('web-push', () => ({
  setVapidDetails: vi.fn(),
  sendNotification: vi.fn(() => Promise.resolve()),
}));

// Mock do bcryptjs
vi.mock('bcryptjs', () => ({
  hash: vi.fn(() => Promise.resolve('$2a$12$hashedpassword')),
  compare: vi.fn(() => Promise.resolve(true)),
}));

// ============================================================================
// INTERNAL LIBRARY MOCKS
// ============================================================================

// Mock das notificações
vi.mock('@/lib/notifications', () => ({
  createNotification: vi.fn(() => Promise.resolve({ success: true })),
  sendNotificationEmail: vi.fn(() => Promise.resolve({ success: true })),
  sendPushNotification: vi.fn(() => Promise.resolve({ success: true })),
  markAsRead: vi.fn(() => Promise.resolve({ success: true })),
  markAllAsRead: vi.fn(() => Promise.resolve({ success: true, count: 5 })),
  getDefaultPreferences: vi.fn((type) => ({
    type,
    emailEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
  })),
}));

// Mock do file-upload
vi.mock('@/lib/file-upload', () => ({
  generateUploadId: vi.fn(() => 'upload-' + Math.random().toString(36).substring(2, 11)),
  generateUniqueFilename: vi.fn((filename) => `unique_${filename}`),
  getProjectUploadDir: vi.fn((projectId) => `/uploads/projects/${projectId}`),
  getTempUploadDir: vi.fn((uploadId) => `/uploads/temp/${uploadId}`),
  ensureUploadDir: vi.fn(() => Promise.resolve()),
  checkStorageLimit: vi.fn(() =>
    Promise.resolve({
      valid: true,
      storageInfo: { used: 1000000, limit: 10000000000, available: 9999000000 },
      percentage: 0.01,
    })
  ),
  validateFile: vi.fn(() =>
    Promise.resolve({
      valid: true,
      mimeType: 'application/pdf',
      storageInfo: { used: 1000000, limit: 10000000000, available: 9999000000 },
    })
  ),
  saveFile: vi.fn(() =>
    Promise.resolve({
      filepath: 'uploads/projects/test/file.pdf',
      filename: 'file.pdf',
      filesize: 1024,
    })
  ),
  saveChunk: vi.fn(() => Promise.resolve('/uploads/temp/chunk-0')),
  concatenateChunks: vi.fn(() => Promise.resolve(Buffer.from('file content'))),
  cleanupChunks: vi.fn(() => Promise.resolve()),
  deleteFile: vi.fn(() => Promise.resolve(true)),
  fileExists: vi.fn(() => Promise.resolve(true)),
  readFile: vi.fn(() => Promise.resolve(Buffer.from('file content'))),
  getProjectFileStats: vi.fn(() => Promise.resolve({ count: 5, totalSize: 1024000 })),
}));

// Mock do embeddings
vi.mock('@/lib/embeddings', () => ({
  generateEmbedding: vi.fn(() => Promise.resolve(Array(1536).fill(0.1))),
  storeDocument: vi.fn(() =>
    Promise.resolve({
      id: 'doc-123',
      content: 'Test content',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  ),
  searchSimilarDocuments: vi.fn(() => Promise.resolve([])),
  searchSimilarDocumentsWithScores: vi.fn(() => Promise.resolve([])),
  deleteDocument: vi.fn(() => Promise.resolve()),
  getAllDocuments: vi.fn(() => Promise.resolve([])),
  countDocuments: vi.fn(() => Promise.resolve(0)),
  updateDocument: vi.fn(() =>
    Promise.resolve({
      id: 'doc-123',
      content: 'Updated content',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  ),
  EMBEDDING_MODEL: 'mistral-embed',
  EMBEDDING_DIMENSIONS: 1536,
}));

// Mock do data-retention
vi.mock('@/lib/data-retention', () => ({
  checkInactiveUsers: vi.fn(() =>
    Promise.resolve({
      success: true,
      warningsSent: 0,
      errors: [],
    })
  ),
  sendInactivityWarning: vi.fn(() => Promise.resolve()),
  deleteInactiveData: vi.fn(() =>
    Promise.resolve({
      success: true,
      usersDeleted: 0,
      contractualPreserved: 0,
      errors: [],
    })
  ),
  anonymizeBriefings: vi.fn(() =>
    Promise.resolve({
      success: true,
      briefingsAnonymized: 0,
      errors: [],
    })
  ),
  runDataRetention: vi.fn(() =>
    Promise.resolve({
      success: true,
      summary: {
        warningsSent: 0,
        usersDeleted: 0,
        contractualPreserved: 0,
        briefingsAnonymized: 0,
      },
      errors: [],
    })
  ),
}));

// Mock do SEO
vi.mock('@/lib/seo', () => ({
  generateBlogPostMetadata: vi.fn(() => ({
    title: 'Blog Post',
    description: 'Description',
  })),
  generatePortfolioMetadata: vi.fn(() => ({
    title: 'Portfolio',
    description: 'Description',
  })),
  generateBlogListingMetadata: vi.fn(() => ({
    title: 'Blog',
    description: 'Blog listing',
  })),
  generatePortfolioListingMetadata: vi.fn(() => ({
    title: 'Portfolio',
    description: 'Portfolio listing',
  })),
  generateBlogPostJsonLd: vi.fn(() => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
  })),
  generatePortfolioJsonLd: vi.fn(() => ({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
  })),
  generateBreadcrumbJsonLd: vi.fn(() => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
  })),
}));

// ============================================================================
// FILE SYSTEM MOCK
// ============================================================================

vi.mock('fs', () => ({
  promises: {
    access: vi.fn(() => Promise.resolve()),
    mkdir: vi.fn(() => Promise.resolve()),
    writeFile: vi.fn(() => Promise.resolve()),
    readFile: vi.fn(() => Promise.resolve(Buffer.from('file content'))),
    unlink: vi.fn(() => Promise.resolve()),
    rm: vi.fn(() => Promise.resolve()),
    readdir: vi.fn(() => Promise.resolve([])),
    stat: vi.fn(() => Promise.resolve({ size: 1024, isFile: () => true })),
  },
  existsSync: vi.fn(() => true),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(() => Buffer.from('file content')),
}));

// ============================================================================
// CRYPTO MOCK
// ============================================================================

vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'),
  randomBytes: vi.fn((size) => Buffer.alloc(size)),
  createHash: vi.fn(() => ({
    update: vi.fn(() => ({
      digest: vi.fn(() => 'hash'),
    })),
  })),
}));

// ============================================================================
// CONSOLE MOCK (optional - uncomment to suppress console output in tests)
// ============================================================================

// vi.spyOn(console, 'log').mockImplementation(() => {});
// vi.spyOn(console, 'error').mockImplementation(() => {});
// vi.spyOn(console, 'warn').mockImplementation(() => {});

// ============================================================================
// TESTING LIBRARY CONFIGURATION
// ============================================================================

import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Automatically cleanup Testing Library after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ============================================================================
// GLOBAL TEST UTILITIES
// ============================================================================

// Extend expect matchers if needed
// expect.extend({ ... });

// Global test timeout
// vi.setConfig({ testTimeout: 10000 });
