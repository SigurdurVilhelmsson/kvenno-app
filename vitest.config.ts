import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['packages/shared/**/*.{ts,tsx}'],
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
    },
  },
});
