# Security-First Comprehensive Improvement Design

**Date:** 2026-02-19
**Status:** Approved
**Scope:** Security fixes, server TypeScript migration, code deduplication, ESLint standardization, comprehensive testing, additional hardening

---

## Problem Statement

A comprehensive code review of the kvenno-app monorepo revealed:

- **3 critical security vulnerabilities** (auth bypass, CORS bypass, command injection)
- **5 high-severity security issues** (API key exposure, missing role validation, no HTTPS, error leaks, oversized limits)
- **Server backend entirely in JavaScript** while all frontend code uses strict TypeScript
- **Duplicate utility files** (api/api2, export/export2, prompts/prompts2)
- **~7-10% test coverage** with 0 tests for games (122 components) and shared components (25+)
- **ESLint excludes all .js files** and the entire server directory

## Design

### Phase 1: Critical Security Fixes

**1.1 Fix Authentication Bypass**
- File: `apps/lab-reports/src/components/AuthGuard.tsx`
- Change: `BYPASS_AUTH = true` to environment-driven (`import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === 'true'`)
- Default: `false` in production

**1.2 Fix CORS No-Origin Bypass**
- File: `server/index.js` (later `server/src/index.ts`)
- Change: Reject requests without Origin header
- Keep: localhost origins for development

**1.3 Fix Command Injection in File Handling**
- File: `server/index.js`
- Change: Replace filename concatenation with `crypto.randomBytes(16).toString('hex') + '.docx'`
- Add: File extension allowlist validation
- Add: Temp directory isolation

**1.4 Remove Frontend API Key Exposure**
- File: `apps/lab-reports/src/utils/api2.ts`
- Change: Remove all direct Anthropic API calls; route everything through Express backend
- Remove: `VITE_ANTHROPIC_API_KEY` from all `.env` files

**1.5 Add Server-Side Role Validation**
- File: `server/index.js`
- Change: Validate `mode` parameter against user role
- Teacher mode requires teacher authentication

**1.6 Sanitize Error Messages**
- File: `server/index.js`
- Change: Generic Icelandic error messages to clients, detailed logs server-side

**1.7 Disable Production Sourcemaps**
- File: `apps/lab-reports/vite.config.ts`
- Change: `sourcemap: false` for production

### Phase 2: Server TypeScript Migration

Full rewrite of `server/` from JavaScript to TypeScript:

- `server/index.js` -> `server/src/index.ts`
- `server/lib/islenskubraut-data.mjs` -> `server/src/lib/islenskubraut-data.ts`
- `server/lib/islenskubraut-pdf.mjs` -> `server/src/lib/islenskubraut-pdf.ts`
- `server/__tests__/server.test.js` -> `server/src/__tests__/server.test.ts`
- Add `server/tsconfig.json` extending base
- Add `server/src/types/` for request/response types
- Type all Express routes, middleware, error handlers
- Type Claude API request/response
- Build with `tsx` for dev, compile for production
- Add server to ESLint coverage

### Phase 3: Code Deduplication

**3.1 Merge API utilities** - `api.ts` + `api2.ts` -> single `api.ts` with configuration
**3.2 Merge export utilities** - `export.ts` + `export2.ts` -> single `export.ts` with type param
**3.3 Merge prompt utilities** - `prompts.ts` + `prompts2.ts` -> single `prompts.ts` with mode selection
**3.4 Centralize Vite config** - Create shared factory: `createViteConfig({ base, outDir, singleFile? })`
**3.5 Fix dependency issues** - Remove lucide-react from lab-reports, move React to devDeps in server

### Phase 4: ESLint & Config Standardization

**4.1 Extend ESLint** - Remove blanket .js/.mjs ignores, add server rules
**4.2 Add security headers** - CSP, HSTS, Permissions-Policy in nginx
**4.3 Harden deploy script** - `set -euo pipefail`, quote vars, `npm ci`

### Phase 5: Comprehensive Testing

**5.1 Security-critical tests** - Auth, CORS, input validation, file processing
**5.2 Shared component tests** - All 25+ components with props, rendering, a11y
**5.3 Game logic tests** - 1 game per year minimum (scoring, achievements, hints)
**5.4 App integration tests** - Lab-reports flow, landing navigation, islenskubraut cards
**5.5 Expand E2E** - Gameplay, form submission, mobile viewport, error states
**5.6 CI improvements** - Coverage thresholds, reporting, badges

### Phase 6: Additional Improvements

**6.1 Reduce input size limits** - Content 10MB->2MB, prompt 50KB->20KB, upload 50MB->10MB
**6.2 HTTPS enforcement** - Uncomment nginx HTTPS config, add redirect
**6.3 Large component refactoring** - Break 1000+ line components into sub-components

## Security Issues Reference

| ID | Severity | Issue | File |
|---|---|---|---|
| 1.1 | CRITICAL | BYPASS_AUTH hardcoded true | AuthGuard.tsx |
| 1.2 | CRITICAL | CORS allows no-origin requests | server/index.js |
| 1.3 | CRITICAL | Command injection in filename handling | server/index.js |
| 1.4 | HIGH | Oversized input limits (10MB) | server/index.js |
| 1.5 | HIGH | Error messages leak internals | server/index.js |
| 1.6 | HIGH | API key in env vars without rotation | server/index.js |
| 1.7 | HIGH | HTTPS not enforced | nginx-site.conf |
| 2.1 | HIGH | API key in frontend code | api2.ts |
| 2.2 | MEDIUM | Sourcemaps in production | vite.config.ts |
| 2.3 | MEDIUM | Missing CSP headers | nginx-site.conf |
| 2.4 | MEDIUM | 50MB upload limit | fileProcessing.ts |
| 3.1 | MEDIUM | Unsafe deploy script | deploy.sh |
| 5.1 | LOW | Missing proxy headers | nginx-site.conf |
| 6.1 | HIGH | No server-side role validation | server/index.js |

## Scores Before

| Dimension | Score |
|---|---|
| Dependencies | A (85/100) |
| Code Quality (Frontend) | A+ |
| Code Quality (Backend) | C |
| Security | D |
| Testing | 5.5/10 |
| Architecture | B+ |

## Expected Scores After

| Dimension | Score |
|---|---|
| Dependencies | A+ |
| Code Quality (Frontend) | A+ |
| Code Quality (Backend) | A |
| Security | A- |
| Testing | 8/10 |
| Architecture | A |
