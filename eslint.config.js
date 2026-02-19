import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'import': importPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-var': 'error',

      // React
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import ordering
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          pathGroups: [
            { pattern: 'react', group: 'builtin', position: 'before' },
            { pattern: 'react-dom/**', group: 'builtin', position: 'before' },
            { pattern: '@kvenno/**', group: 'internal', position: 'before' },
            { pattern: '@shared/**', group: 'internal', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '**/*.html',
      '**/vite.config.ts',
      'vitest.config.ts',
      'server/**',
      'scripts/**',
      '**/*.mjs',
      '**/*.js',
    ],
  },
);
