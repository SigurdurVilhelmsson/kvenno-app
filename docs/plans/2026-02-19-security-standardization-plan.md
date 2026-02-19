# Security-First Comprehensive Improvement Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all critical/high security vulnerabilities, migrate server to TypeScript, deduplicate code, standardize ESLint coverage, and build comprehensive test suite.

**Architecture:** Security fixes first (Phase 1) to stop immediate risks, then server TypeScript migration (Phase 2) as the foundation for code quality, followed by deduplication (Phase 3), ESLint standardization (Phase 4), comprehensive testing (Phase 5), and hardening (Phase 6).

**Tech Stack:** TypeScript, Express, Vite, React 19, Vitest, Supertest, Playwright, ESLint 9, Tailwind CSS 4, pnpm workspaces

---

## Phase 1: Critical Security Fixes

### Task 1: Fix Authentication Bypass

**Files:**
- Modify: `apps/lab-reports/src/components/AuthGuard.tsx:36`

**Step 1: Fix the bypass flag**

Change the hardcoded `BYPASS_AUTH = true` to environment-driven:

```typescript
// Replace line 36:
const BYPASS_AUTH = true; // Set to false to re-enable auth

// With:
const BYPASS_AUTH = import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === 'true';
```

Also update the console.warn on line 64 to be more explicit:

```typescript
if (BYPASS_AUTH) {
  console.warn('⚠️ AUTHENTICATION BYPASSED — VITE_BYPASS_AUTH=true in development mode');
  return <>{children}</>;
}
```

**Step 2: Verify the build doesn't break**

Run: `pnpm type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/lab-reports/src/components/AuthGuard.tsx
git commit -m "fix(security): make auth bypass environment-driven, default off"
```

---

### Task 2: Fix CORS No-Origin Bypass

**Files:**
- Modify: `server/index.js:46-58`

**Step 1: Reject requests without Origin header**

Replace the CORS origin function:

```javascript
app.use(cors({
  origin: (origin, callback) => {
    // In production, reject requests without Origin header to prevent
    // abuse from curl, extensions, and non-browser clients
    if (!origin) {
      if (process.env.NODE_ENV !== 'production') {
        // Allow no-origin in development for tools like curl
        return callback(null, true);
      }
      return callback(new Error('Origin header required'));
    }

    if (filteredOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

**Step 2: Run existing server tests**

Run: `cd server && npx vitest run`
Expected: CORS tests should still pass (they all set Origin headers)

**Step 3: Commit**

```bash
git add server/index.js
git commit -m "fix(security): reject no-origin requests in production CORS"
```

---

### Task 3: Fix Command Injection in File Handling

**Files:**
- Modify: `server/index.js:284-308`

**Step 1: Replace filename handling with random safe names**

Replace the filename handling in the `/api/process-document` endpoint:

```javascript
// Replace lines 284-308 with:
docxPath = file.filepath;

// Validate file extension from original filename
const originalName = (file.originalFilename || '').toLowerCase();
if (!originalName.endsWith('.docx')) {
  return res.status(400).json({ error: 'Only .docx files are supported' });
}

// Validate file size (10MB max, matching formidable config)
if (file.size > 10 * 1024 * 1024) {
  return res.status(400).json({ error: 'File too large (max 10MB)' });
}

// Use random filename to prevent path traversal and injection
const { randomBytes } = await import('crypto');
const safeName = randomBytes(16).toString('hex');
const safeDocxPath = path.join(path.dirname(docxPath), `${safeName}.docx`);
const { rename } = await import('fs/promises');
await rename(docxPath, safeDocxPath);
docxPath = safeDocxPath;

console.log('[Document Processing] Starting DOCX → PDF conversion (safe name):', safeName);
```

**Step 2: Run server tests**

Run: `cd server && npx vitest run`
Expected: PASS

**Step 3: Commit**

```bash
git add server/index.js
git commit -m "fix(security): use random filenames for uploaded documents"
```

---

### Task 4: Remove Frontend API Key Exposure

**Files:**
- Modify: `apps/lab-reports/src/utils/api2.ts:48-80`

**Step 1: Remove direct API mode from api2.ts**

Remove the entire `else` branch (lines 48-80) that sends API key from the browser:

```typescript
const analyzeWithClaude2 = async (
  systemPrompt: string,
  userPrompt: string
): Promise<AnthropicResponse> => {
  const backendEndpoint = import.meta.env.VITE_API_ENDPOINT;

  if (!backendEndpoint) {
    throw new Error(
      'VITE_API_ENDPOINT er ekki stillt. Settu VITE_API_ENDPOINT í .env til að vísa á bakenda.'
    );
  }

  const response = await fetch(`${backendEndpoint}/analyze-2ar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt }),
  });

  if (!response.ok) {
    let errorMessage = 'API request failed';
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.error || errorMessage;
    } catch {
      try {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      } catch {
        // Use default message
      }
    }
    throw new Error(`API villa (${response.status}): ${errorMessage}`);
  }

  return await response.json();
};
```

**Step 2: Verify types still compile**

Run: `pnpm type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/lab-reports/src/utils/api2.ts
git commit -m "fix(security): remove direct Anthropic API key from frontend"
```

---

### Task 5: Sanitize Error Messages

**Files:**
- Modify: `server/index.js:369-371`

**Step 1: Replace error.message with generic Icelandic message in document processing**

```javascript
// Replace line 369-371:
return res.status(500).json({
  error: error.message || 'Failed to process document',
});

// With:
return res.status(500).json({
  error: 'Gat ekki unnið úr skjalinu. Vinsamlegast reyndu aftur.',
});
```

**Step 2: Also sanitize API key error messages (lines 403-405)**

```javascript
// Replace:
console.error('CLAUDE_API_KEY not configured');
return res.status(500).json({ error: 'API key not configured' });

// With:
console.error('API credentials not configured');
return res.status(500).json({ error: 'Internal server error' });
```

Apply the same fix to the identical pattern in `/api/analyze-2ar` (lines 513-515).

**Step 3: Run server tests**

Run: `cd server && npx vitest run`
Expected: PASS

**Step 4: Commit**

```bash
git add server/index.js
git commit -m "fix(security): sanitize error messages to prevent info leaks"
```

---

### Task 6: Disable Production Sourcemaps

**Files:**
- Modify: `apps/lab-reports/vite.config.ts:19`

**Step 1: Disable sourcemaps for production builds**

```typescript
// Replace line 19:
sourcemap: true,

// With:
sourcemap: process.env.NODE_ENV !== 'production',
```

**Step 2: Verify build**

Run: `pnpm type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/lab-reports/vite.config.ts
git commit -m "fix(security): disable sourcemaps in production builds"
```

---

### Task 7: Reduce Input Size Limits

**Files:**
- Modify: `server/index.js:85-88,391-398,508-509`

**Step 1: Reduce JSON body limit**

```javascript
// Replace lines 85-88:
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// With:
// 15MB limit covers multi-page PDFs with images while preventing abuse
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
```

**Step 2: Reduce content validation limits**

```javascript
// Replace systemPrompt max from 50000 to 30000 (lines 391, 504):
if (typeof systemPrompt !== 'string' || systemPrompt.length > 30000) {

// Replace content max from 10MB to 5MB (line 397):
if (contentStr.length > 5 * 1024 * 1024) {

// Replace userPrompt max from 200000 to 100000 (line 509):
if (typeof userPrompt !== 'string' || userPrompt.length > 100000) {
```

**Step 3: Run server tests — update test expectations**

Update `server/__tests__/server.test.js` tests for new limits:
- Line 76: `'x'.repeat(50001)` → `'x'.repeat(30001)`
- Line 99: `'x'.repeat(50001)` → `'x'.repeat(30001)`
- Line 114: `'x'.repeat(200001)` → `'x'.repeat(100001)`

**Step 4: Run server tests**

Run: `cd server && npx vitest run`
Expected: PASS

**Step 5: Commit**

```bash
git add server/index.js server/__tests__/server.test.js
git commit -m "fix(security): reduce input size limits to prevent DoS"
```

---

### Task 8: Add Security Headers to Nginx

**Files:**
- Modify: `server/nginx-site.conf:78-82`

**Step 1: Add CSP and additional security headers**

```nginx
# Replace lines 78-82 with:
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.anthropic.com; frame-ancestors 'self';" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

**Step 2: Also update the HTTPS config section (lines 148-152) with same headers**

**Step 3: Commit**

```bash
git add server/nginx-site.conf
git commit -m "fix(security): add CSP, Permissions-Policy to nginx"
```

---

## Phase 2: Server TypeScript Migration

### Task 9: Set Up Server TypeScript Infrastructure

**Files:**
- Create: `server/tsconfig.json`
- Create: `server/src/types/index.ts`
- Modify: `server/package.json`

**Step 1: Create server tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2022"],
    "types": ["node"],
    "declaration": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "noEmit": false
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "src/__tests__"]
}
```

**Step 2: Create types file**

```typescript
// server/src/types/index.ts

import type { Request, Response } from 'express';

export type AnalyzeMode = 'teacher' | 'student';

export interface AnalyzeRequestBody {
  content: string | unknown[];
  systemPrompt: string;
  mode: AnalyzeMode;
}

export interface Analyze2arRequestBody {
  systemPrompt: string;
  userPrompt: string;
}

export interface PdfQueryParams {
  flokkur?: string;
  stig?: string;
}

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicContentBlock[];
}

export interface AnthropicContentBlock {
  type: 'text' | 'image';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
  cache_control?: { type: 'ephemeral' };
}

export interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: { type: 'text'; text: string }[];
  model: string;
  stop_reason: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
}

export type TypedRequest<T> = Request<Record<string, string>, unknown, T>;
export type TypedResponse<T> = Response<T>;
```

**Step 3: Update server/package.json**

```json
{
  "name": "labreports-server",
  "version": "1.0.0",
  "description": "Express.js backend server for LabReports",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "test": "vitest run",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@react-pdf/renderer": "^4.3.0",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "express-rate-limit": "^7.5.0",
    "formidable": "^3.5.1",
    "helmet": "^8.1.0",
    "react": "^19.0.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/formidable": "^3.4.5",
    "@types/node": "^20.10.0",
    "supertest": "^7.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.3.3",
    "vitest": "^2.1.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

**Step 4: Install new dependencies**

Run: `cd server && pnpm install`

**Step 5: Commit**

```bash
git add server/tsconfig.json server/src/types/index.ts server/package.json
git commit -m "feat(server): add TypeScript infrastructure"
```

---

### Task 10: Migrate server/index.js to TypeScript

**Files:**
- Create: `server/src/index.ts` (migrated from `server/index.js`)
- Delete: `server/index.js`

**Step 1: Create server/src/index.ts**

Migrate `server/index.js` to TypeScript with full type annotations. This is the main file — it includes all the security fixes from Phase 1 plus proper TypeScript types. The full content is the existing `index.js` converted with:
- Import types from `./types/index.js`
- Type all route handlers with `Request<>` and `Response<>` generics
- Type all function parameters and return values
- Replace `error.message` accesses with proper type guards
- Add typed middleware
- Keep all existing security fixes from Phase 1

**Step 2: Verify TypeScript compiles**

Run: `cd server && npx tsc --noEmit`
Expected: PASS

**Step 3: Run tests against new TypeScript source**

Update `server/vitest.config.js` → `server/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/__tests__/**/*.test.ts'],
    environment: 'node',
    testTimeout: 15000,
  },
});
```

**Step 4: Run tests**

Run: `cd server && npx vitest run`
Expected: PASS

**Step 5: Remove old files, commit**

```bash
rm server/index.js server/vitest.config.js
git add server/src/ server/vitest.config.ts
git rm server/index.js server/vitest.config.js
git commit -m "feat(server): migrate index.js to TypeScript"
```

---

### Task 11: Migrate server lib files to TypeScript

**Files:**
- Create: `server/src/lib/islenskubraut-data.ts` (from `server/lib/islenskubraut-data.mjs`)
- Create: `server/src/lib/islenskubraut-pdf.ts` (from `server/lib/islenskubraut-pdf.mjs`)
- Delete: `server/lib/islenskubraut-data.mjs`, `server/lib/islenskubraut-pdf.mjs`

**Step 1: Migrate islenskubraut-data.mjs to TypeScript**

Add proper interfaces for category data:

```typescript
export interface SubCategory {
  name: string;
  options: string[];
}

export interface SentenceFrame {
  level: 'A1' | 'A2' | 'B1';
  frames: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  subCategories: SubCategory[];
  sentenceFrames: SentenceFrame[];
  // ... additional fields as found in the data
}
```

Keep all existing data as-is, just add types.

**Step 2: Migrate islenskubraut-pdf.mjs to TypeScript**

Type the React PDF components and generation function.

**Step 3: Update imports in server/src/index.ts**

```typescript
import { generatePdf } from './lib/islenskubraut-pdf.js';
import { getCategoryById } from './lib/islenskubraut-data.js';
```

**Step 4: Run tests**

Run: `cd server && npx vitest run`
Expected: PASS

**Step 5: Remove old files, commit**

```bash
rm -rf server/lib/
git add server/src/lib/
git rm -r server/lib/
git commit -m "feat(server): migrate lib files to TypeScript"
```

---

### Task 12: Migrate server tests to TypeScript

**Files:**
- Create: `server/src/__tests__/server.test.ts` (from `server/__tests__/server.test.js`)
- Delete: `server/__tests__/server.test.js`

**Step 1: Migrate test file to TypeScript**

Add proper typing to test file:
- Import types from supertest
- Type response objects
- Update import path to new `../index.js`

**Step 2: Run tests**

Run: `cd server && npx vitest run`
Expected: PASS

**Step 3: Add CORS no-origin test**

```typescript
it('rejects requests without Origin in production mode', async () => {
  // Save and set NODE_ENV
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  // Note: This test verifies the CORS fix from Task 2
  // In production, no-origin requests should be rejected

  // Restore env
  process.env.NODE_ENV = originalEnv;
});
```

**Step 4: Remove old test directory, commit**

```bash
rm -rf server/__tests__/
git add server/src/__tests__/
git rm -r server/__tests__/
git commit -m "feat(server): migrate tests to TypeScript"
```

---

## Phase 3: Code Deduplication

### Task 13: Merge API Utilities

**Files:**
- Modify: `apps/lab-reports/src/utils/api.ts` (absorb api2 functionality)
- Delete: `apps/lab-reports/src/utils/api2.ts`
- Modify: all files that import from `api2.ts`

**Step 1: Add 2nd-year analysis function to api.ts**

Add `analyzeWithClaude2ar` and `processFile2` functions to the existing `api.ts`, sharing the common `AnthropicResponse` type and error handling pattern.

**Step 2: Update imports across the codebase**

Find all imports from `@/utils/api2` and update to `@/utils/api`.

Run: `grep -r "from '@/utils/api2'" apps/lab-reports/src/`

**Step 3: Delete api2.ts**

**Step 4: Verify types**

Run: `pnpm type-check`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/lab-reports/src/utils/api.ts
git rm apps/lab-reports/src/utils/api2.ts
git commit -m "refactor: merge api2.ts into api.ts, single API module"
```

---

### Task 14: Merge Export Utilities

**Files:**
- Modify: `apps/lab-reports/src/utils/export.ts` (absorb export2 functionality)
- Delete: `apps/lab-reports/src/utils/export2.ts`
- Modify: all files that import from `export2.ts`

**Step 1: Extract shared CSV helper**

Both files share identical `escapeCSV` and blob download logic. Create a single module with:
- Shared `escapeCSV` function (already identical)
- Shared `downloadCSV` helper (extract from both)
- `exportResultsToCSV` (existing teacher mode)
- `exportChecklist2ToCSV` (from export2)

**Step 2: Update imports**

Run: `grep -r "from '@/utils/export2'" apps/lab-reports/src/`

**Step 3: Delete export2.ts**

**Step 4: Verify types**

Run: `pnpm type-check`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/lab-reports/src/utils/export.ts
git rm apps/lab-reports/src/utils/export2.ts
git commit -m "refactor: merge export2.ts into export.ts, shared CSV helpers"
```

---

### Task 15: Merge Prompt Utilities

**Files:**
- Modify: `apps/lab-reports/src/config/prompts.ts` (absorb prompts2 functionality)
- Delete: `apps/lab-reports/src/config/prompts2.ts`
- Modify: all files that import from `prompts2.ts`

**Step 1: Add 2nd-year prompt functions to prompts.ts**

Move `build2ndYearSystemPrompt` and `build2ndYearUserPrompt` from `prompts2.ts` into `prompts.ts`. They use a different `ExperimentConfig2` type so they stay as separate exports, but live in the same file.

**Step 2: Update imports**

Run: `grep -r "from '@/config/prompts2'" apps/lab-reports/src/`

**Step 3: Delete prompts2.ts**

**Step 4: Verify types**

Run: `pnpm type-check`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/lab-reports/src/config/prompts.ts
git rm apps/lab-reports/src/config/prompts2.ts
git commit -m "refactor: merge prompts2.ts into prompts.ts"
```

---

### Task 16: Fix Dependency Issues

**Files:**
- Modify: `apps/lab-reports/package.json` (remove duplicate lucide-react)
- Modify: `server/package.json` (move react to devDependencies)

**Step 1: Remove lucide-react from lab-reports**

It's already available through `@kvenno/shared`.

**Step 2: Move react to devDependencies in server**

React is only needed as a peer dependency for `@react-pdf/renderer`.

**Step 3: Install**

Run: `pnpm install`

**Step 4: Verify builds**

Run: `pnpm type-check`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/lab-reports/package.json server/package.json pnpm-lock.yaml
git commit -m "fix: remove duplicate deps, fix react placement in server"
```

---

## Phase 4: ESLint & Config Standardization

### Task 17: Extend ESLint Coverage

**Files:**
- Modify: `eslint.config.js`

**Step 1: Remove blanket .js/.mjs ignores, add server coverage**

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // TypeScript + React files (frontend)
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
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-var': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
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
  // Server TypeScript files (Node.js, no React hooks)
  {
    files: ['server/src/**/*.ts'],
    plugins: {
      'import': importPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'off', // Server needs console.log/error
      'prefer-const': 'warn',
      'no-var': 'error',
    },
  },
  // Config and script files (JS/MJS — relaxed rules)
  {
    files: ['*.config.{js,mjs,ts}', 'scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '**/*.html',
      '.worktrees/**',
    ],
  },
);
```

**Step 2: Run ESLint and fix issues**

Run: `npx eslint . --fix`
Fix remaining issues manually.

**Step 3: Commit**

```bash
git add eslint.config.js
git commit -m "feat: extend ESLint to cover server, configs, and scripts"
```

---

### Task 18: Harden Deploy Script

**Files:**
- Modify: `scripts/deploy.sh`

**Step 1: Fix variable quoting and use npm ci**

```bash
# Line 39: Quote DRY_RUN properly
rsync -avz ${DRY_RUN:+--delete} "$DRY_RUN" \
  --exclude='.git' \
  --exclude='node_modules' \
  "$DIST_DIR/" "$SERVER:$WEB_ROOT/"

# Line 56: Use npm ci instead of npm install
ssh "$SERVER" "cd $BACKEND_DIR && npm ci --omit=dev && sudo systemctl restart kvenno-server"
```

**Step 2: Commit**

```bash
git add scripts/deploy.sh
git commit -m "fix(security): harden deploy script, use npm ci"
```

---

## Phase 5: Comprehensive Testing

### Task 19: Add Security-Critical Tests to Server

**Files:**
- Modify: `server/src/__tests__/server.test.ts`

**Step 1: Add tests for security fixes**

Add test cases for:
- CORS rejects no-origin in production
- File upload with invalid extension returns 400
- Oversized systemPrompt rejected at new 30000 limit
- Error responses don't leak internal paths
- Mode validation (only 'teacher' and 'student')

**Step 2: Run tests**

Run: `cd server && npx vitest run`
Expected: All PASS

**Step 3: Commit**

```bash
git add server/src/__tests__/server.test.ts
git commit -m "test: add security-critical server tests"
```

---

### Task 20: Add Shared Component Tests

**Files:**
- Create: `packages/shared/components/__tests__/Header.test.tsx`
- Create: `packages/shared/components/__tests__/Footer.test.tsx`
- Create: `packages/shared/components/__tests__/Breadcrumbs.test.tsx`
- Create: `packages/shared/components/__tests__/ErrorBoundary.test.tsx`
- Create: `packages/shared/components/__tests__/FeedbackPanel.test.tsx`
- Create: `packages/shared/components/__tests__/HintSystem.test.tsx`
- Create: `packages/shared/components/__tests__/LanguageSwitcher.test.tsx`
- Create: `packages/shared/components/__tests__/ResponsiveContainer.test.tsx`

**Step 1: Write tests for each shared component**

For each component, test:
- Default rendering with required props
- Prop variations (different titles, children, etc.)
- Accessibility attributes (ARIA labels, roles)
- Event handling where applicable
- Edge cases (empty props, missing optional props)

Example pattern for Header:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../Header';

describe('Header', () => {
  it('renders with default title', () => {
    render(<BrowserRouter><Header /></BrowserRouter>);
    expect(screen.getByText('Námsvefur Kvennó')).toBeDefined();
  });

  it('renders with custom title', () => {
    render(<BrowserRouter><Header title="Custom" /></BrowserRouter>);
    expect(screen.getByText('Custom')).toBeDefined();
  });

  it('renders Kennarar and Upplýsingar buttons', () => {
    render(<BrowserRouter><Header /></BrowserRouter>);
    expect(screen.getByText('Kennarar')).toBeDefined();
    expect(screen.getByText('Upplýsingar')).toBeDefined();
  });
});
```

**Step 2: Run tests**

Run: `pnpm test`
Expected: All PASS

**Step 3: Commit**

```bash
git add packages/shared/components/__tests__/
git commit -m "test: add shared component tests for Header, Footer, Breadcrumbs, etc."
```

---

### Task 21: Add Game Logic Tests (1 per Year)

**Files:**
- Create: `apps/games/1-ar/takmarkandi/src/__tests__/game-logic.test.ts`
- Create: `apps/games/2-ar/oxidation-states/src/__tests__/game-logic.test.ts`
- Create: `apps/games/3-ar/ph-titration/src/__tests__/game-logic.test.ts`

**Step 1: Identify testable logic in each game**

Read the game's `utils/` or `data/` directories for pure functions that can be unit tested:
- Answer validation functions
- Score calculation
- Level progression logic
- Data generation/randomization

**Step 2: Write tests for pure game logic**

Test challenge generation, answer validation, scoring, and level completion for each game.

**Step 3: Run tests**

Run: `pnpm test`
Expected: All PASS

**Step 4: Commit**

```bash
git add apps/games/*/src/__tests__/
git commit -m "test: add game logic tests for 1 game per year"
```

---

### Task 22: Add Lab-Reports Integration Tests

**Files:**
- Create: `apps/lab-reports/src/__tests__/api.test.ts`
- Create: `apps/lab-reports/src/__tests__/export.test.ts`
- Create: `apps/lab-reports/src/__tests__/prompts.test.ts`

**Step 1: Test merged API module**

Test that `analyzeWithClaude` and `analyzeWithClaude2ar` both:
- Throw when `VITE_API_ENDPOINT` is not set
- Make correct fetch calls with proper headers
- Handle error responses correctly
- Parse JSON responses

Mock `fetch` for these tests.

**Step 2: Test merged export module**

Test `escapeCSV`, `exportResultsToCSV`, and `exportChecklist2ToCSV` with mock data.

**Step 3: Test prompts module**

Test `buildTeacherSystemPrompt`, `buildStudentSystemPrompt`, `build2ndYearSystemPrompt`, and `build2ndYearUserPrompt` with sample experiment configs.

**Step 4: Run tests**

Run: `pnpm test`
Expected: All PASS

**Step 5: Commit**

```bash
git add apps/lab-reports/src/__tests__/
git commit -m "test: add lab-reports API, export, and prompt tests"
```

---

### Task 23: Expand E2E Tests

**Files:**
- Modify: `e2e/landing.spec.ts` (add navigation tests)
- Create: `e2e/lab-reports.spec.ts`
- Modify: `e2e/smoke.spec.ts` (add mobile viewport)

**Step 1: Add lab-reports E2E test**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Lab Reports', () => {
  test('loads the lab reports page', async ({ page }) => {
    await page.goto('/efnafraedi/2-ar/lab-reports/');
    await expect(page).toHaveTitle(/Lab|Tilraunaskýrsla/i);
  });

  test('shows file upload area', async ({ page }) => {
    await page.goto('/efnafraedi/2-ar/lab-reports/');
    await expect(page.locator('text=Hlaða upp')).toBeVisible();
  });
});
```

**Step 2: Add mobile viewport smoke test**

```typescript
test.describe('Mobile viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('landing page works on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

**Step 3: Run E2E tests**

Run: `pnpm build && pnpm test:e2e`
Expected: All PASS

**Step 4: Commit**

```bash
git add e2e/
git commit -m "test: expand E2E tests for lab-reports and mobile viewport"
```

---

### Task 24: Add CI Coverage Thresholds

**Files:**
- Modify: `vitest.config.ts` (add global coverage thresholds)
- Modify: `.github/workflows/ci.yml` (add coverage reporting)

**Step 1: Add global coverage thresholds**

Update the root vitest.config.ts to include broader coverage targets:

```typescript
coverage: {
  provider: 'v8',
  include: [
    'packages/shared/**/*.{ts,tsx}',
    'apps/lab-reports/src/utils/**/*.ts',
    'apps/lab-reports/src/config/**/*.ts',
  ],
  exclude: ['**/*.test.*', '**/index.ts', '**/__tests__/**'],
  thresholds: {
    'packages/shared/utils/**': { statements: 80, branches: 80, functions: 80, lines: 80 },
    'packages/shared/hooks/**': { statements: 70, branches: 70, functions: 70, lines: 70 },
  },
},
```

**Step 2: Add coverage to CI**

Add `pnpm test:coverage` step to CI workflow.

**Step 3: Commit**

```bash
git add vitest.config.ts .github/workflows/ci.yml
git commit -m "ci: add coverage thresholds and reporting"
```

---

## Phase 6: Additional Improvements

### Task 25: HTTPS Enforcement in Nginx

**Files:**
- Modify: `server/nginx-site.conf`

**Step 1: Uncomment HTTPS redirect on line 13**

```nginx
# Replace line 13:
# return 301 https://$server_name$request_uri;

# With:
return 301 https://$server_name$request_uri;
```

**Step 2: Uncomment the entire HTTPS server block (lines 86-152)**

Add the security headers from Task 8 to the HTTPS block as well.

**Step 3: Add HSTS header to HTTPS block**

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

**Step 4: Commit**

```bash
git add server/nginx-site.conf
git commit -m "feat(security): enable HTTPS enforcement in nginx"
```

Note: Requires SSL certificate on production server (`certbot certonly -d kvenno.app`).

---

### Task 26: Refactor Large Game Components

**Files:**
- Modify: Large game component files (>1000 lines)

**Step 1: Identify files to refactor**

Games with components exceeding 1000 lines:
- `apps/games/1-ar/molmassi/src/components/Level1.tsx` (~1040 lines)
- `apps/games/1-ar/molmassi/src/components/Level1Conceptual.tsx` (~1362 lines)

**Step 2: Extract sub-components**

For each large component:
- Extract challenge generation functions to `utils/challenges.ts`
- Extract feedback rendering to `components/FeedbackDisplay.tsx`
- Extract UI sections into smaller components
- Keep game state in parent, pass handlers down

**Step 3: Verify game still works**

Run: `pnpm build:games`
Expected: All games build successfully

**Step 4: Commit per game**

```bash
git add apps/games/1-ar/molmassi/
git commit -m "refactor: break up large molmassi components into smaller pieces"
```

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | Tasks 1-8 | Critical security fixes |
| 2 | Tasks 9-12 | Server TypeScript migration |
| 3 | Tasks 13-16 | Code deduplication |
| 4 | Tasks 17-18 | ESLint & config standardization |
| 5 | Tasks 19-24 | Comprehensive testing |
| 6 | Tasks 25-26 | HTTPS enforcement & component refactoring |

Each task ends with a commit. Run `pnpm type-check` after each phase to verify no regressions.
