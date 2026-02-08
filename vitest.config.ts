import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        '.next/',
        'coverage/',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/test-utils.ts',
        '**/test-fixtures.ts',
        '**/vitest.setup.ts',
        '**/vitest.config.ts',
        'prisma/',
        'scripts/',
        'collections/',
      ],
      // Coverage thresholds
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },

    // Test filtering
    include: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    exclude: ['node_modules/', '.next/'],

    // Test timeout
    testTimeout: 10000,

    // Retry flaky tests
    retry: 1,

    // Parallel test execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },

    // Reporting
    reporters: ['verbose'],

    // Environment variables for tests
    env: {
      NODE_ENV: 'test',
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXTAUTH_SECRET: 'test-secret-key',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/28webconnect_test?schema=public',
      MISTRAL_API_KEY: 'test-mistral-key',
      MAILGUN_API_KEY: 'test-mailgun-key',
      MAILGUN_DOMAIN: 'mg.test.com',
      UPLOAD_DIR: './test-uploads',
      MAX_UPLOAD_SIZE_MB: '10',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
