import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx', '**/*.test.js'],
    exclude: ['**/node_modules/**', '**/dist/**', '.worktrees/**', 'server/**'],
    environmentMatchGlobs: [
      // Use jsdom for all .tsx test files (React component tests)
      ['**/*.test.tsx', 'jsdom'],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: [
        'packages/shared/**/*.{ts,tsx}',
        'apps/lab-reports/src/utils/**/*.ts',
        'apps/lab-reports/src/config/**/*.ts',
        'apps/lab-reports/src/hooks/**/*.ts',
        'apps/games/**/utils/**/*.ts',
        'apps/games/**/data/**/*.ts',
        'apps/lab-reports/src/components/Auth*.tsx',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',
        '**/index.ts',
      ],
      thresholds: {
        'packages/shared/utils/**/*.ts': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        'packages/shared/hooks/**/*.ts': {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@kvenno/shared': path.resolve(__dirname, './packages/shared'),
      '@shared': path.resolve(__dirname, './packages/shared'),
      '@': path.resolve(__dirname, './apps/lab-reports/src'),
    },
  },
});
