# Round 4: Polish, E2E Testing, Accessibility & Documentation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close remaining quality gaps — wire up the last untranslated game, expand E2E coverage for critical user paths, add accessibility testing to games and apps, update stale documentation, and configure role-based teacher emails.

**Architecture:** Quick wins first (Tasks 1-4), then E2E expansion (5-11), accessibility hardening (12-17), and documentation cleanup (18-21). Each phase is independent after the quick wins.

**Tech Stack:** Playwright (E2E), jest-axe + axe-core (a11y), React Testing Library, vitest

---

## Phase 1: Quick Wins (Tasks 1-4)

### Task 1: Wire up nafnakerfid i18n

The nafnakerfid game has a complete `i18n.ts` with all translations but `App.tsx` never imports `useGameI18n`. It also has inline `loadProgress`/`saveProgress` that should use the shared `useGameProgress` hook from Round 3.

**Source:** `apps/games/1-ar/nafnakerfid/src/App.tsx`
**Reference:** `apps/games/1-ar/nafnakerfid/src/i18n.ts` (already has `createGameTranslations`)
**Pattern:** See any 2-ar game App.tsx (e.g., `apps/games/2-ar/hess-law/src/App.tsx`) for the hook usage pattern

**Step 1:** Read `App.tsx` and `i18n.ts` fully. Note all hardcoded Icelandic strings in App.tsx.

**Step 2:** Add `useGameI18n` import and call:
```tsx
import { useGameI18n } from '@shared/hooks/useGameI18n';
import { gameTranslations } from './i18n';
// ...
const { t, language, setLanguage } = useGameI18n({ gameTranslations });
```

**Step 3:** Replace the inline `loadProgress`/`saveProgress`/`getDefaultProgress` with `useGameProgress`:
```tsx
import { useGameProgress } from '@shared/hooks/useGameProgress';
// ...
const { progress, updateProgress, resetProgress } = useGameProgress<Progress>('nafnakerfidProgress', defaultProgress);
```

**Step 4:** Add `LanguageSwitcher` to the game header (follow pattern from other games).

**Step 5:** Replace hardcoded Icelandic strings with `t('key')` calls.

**Step 6:** Verify: `pnpm build:games 2>&1 | grep nafnakerfid` builds successfully.

**Step 7:** Commit.

---

### Task 2: Add nafnakerfid component tests

Currently nafnakerfid only has `data.test.ts` (compound data integrity). No component tests.

**Create:** `apps/games/1-ar/nafnakerfid/src/__tests__/App.test.tsx`
**Source:** `apps/games/1-ar/nafnakerfid/src/App.tsx`
**Pattern:** Look at `apps/landing/src/__tests__/App.test.tsx` for component test style

**Tests (~8):**
- Renders main menu with all level buttons
- Shows level 1 as enabled by default
- Shows levels 2-3 as locked until previous completed
- LanguageSwitcher is present and functional
- Progress loads from localStorage
- Reset progress clears localStorage
- Navigates to level on button click
- Achievements button is present

**Verify:** `pnpm test` passes with new tests included.

---

### Task 3: Configure teacher emails

**Modify:** `apps/lab-reports/src/utils/roles.ts`

The `TEACHER_EMAILS` array is empty. This needs real emails to enable the teacher role system. Since we can't hardcode actual emails, convert this to an environment variable approach:

**Step 1:** Read `apps/lab-reports/src/utils/roles.ts` and `apps/lab-reports/vite.config.ts`.

**Step 2:** Modify `roles.ts` to read from a build-time environment variable:
```typescript
const TEACHER_EMAILS: string[] = (import.meta.env.VITE_TEACHER_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim())
  .filter(Boolean);
```

**Step 3:** Add `VITE_TEACHER_EMAILS` to `.env.example`:
```
# Comma-separated list of teacher email addresses
VITE_TEACHER_EMAILS=teacher1@kvenno.is,teacher2@kvenno.is
```

**Step 4:** Update existing tests in `apps/lab-reports/src/__tests__/roles.test.ts` to mock `import.meta.env`.

**Step 5:** Verify: `pnpm test` passes, `pnpm build:lab-reports` builds.

**Step 6:** Commit.

---

### Task 4: Fix MoleculeViewer3D lint error

**Source:** `packages/shared/components/MoleculeViewer3D/MoleculeViewer3D.tsx:15-20`

The `@typescript-eslint/no-empty-object-type` error fires on the `IntrinsicElements extends ThreeElements` declaration. The current `@typescript-eslint/no-namespace` suppression doesn't cover it.

**Step 1:** Read the file. The issue is:
```typescript
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
```

**Step 2:** The interface IS extending ThreeElements (not empty), so the lint rule is a false positive. Add the appropriate suppression:
```typescript
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends ThreeElements {}
  }
}
```

**Step 3:** Verify: `pnpm lint 2>&1 | grep "error "` shows 0 errors.

**Step 4:** Commit.

---

## Phase 2: E2E Test Expansion (Tasks 5-11)

Current E2E: 5 files, 455 lines, mostly smoke tests (page loads, HTTP 200, asset checks). No functional user interaction testing.

### Task 5: E2E — Game level completion flow

**Create:** `e2e/game-flow.spec.ts`
**Source:** Read existing `e2e/game-interactions.spec.ts` for patterns

**Tests:**
- Navigate to a chemistry game from year hub
- Verify game loads with menu visible
- Click level 1 button, verify level starts
- Complete a simple interaction (answer a question correctly)
- Verify progress is saved (localStorage check via `page.evaluate`)
- Navigate back to menu, verify level shows as completed/in-progress
- Test level locking (level 2 locked until level 1 done)

Pick one simple game (e.g., `dimensional-analysis` which has straightforward Q&A).

**~5 tests**

---

### Task 6: E2E — Lab reports file upload flow

**Create:** `e2e/lab-reports-flow.spec.ts`
**Source:** Read existing `e2e/lab-reports.spec.ts` for setup

**Tests:**
- Navigate to lab reports for 2-ar
- Verify experiment selector is visible
- Select an experiment from the list
- Upload a test document (create a small test .txt file)
- Verify upload UI feedback (loading state, progress indicator)
- Verify error handling for invalid file types
- Verify file size limit enforcement

Note: Actual AI analysis won't work without API key, so test up to the upload step.

**~6 tests**

---

### Task 7: E2E — Landing page navigation flow

**Modify:** `e2e/landing.spec.ts`

**Add tests for:**
- Click chemistry track card → navigates to chemistry hub
- Chemistry hub shows all year tiles (1-ar through f-bekkir)
- Click year tile → navigates to year hub with game cards
- Click game card → navigates to game HTML page
- Breadcrumbs show correct hierarchy and are clickable
- Back button navigation works correctly
- Track selector → year hub → game → back → year hub flow

**~7 tests**

---

### Task 8: E2E — Islenskubraut navigation flow

**Modify:** `e2e/islenskubraut.spec.ts`

**Add tests for:**
- Category grid shows all 6 categories
- Click category card → navigates to teaching card page
- Teaching card page shows content for the category
- Navigate between categories
- URL matches expected pattern (`/islenskubraut/spjald/:flokkur`)

**~5 tests**

---

### Task 9: E2E — Error states and resilience

**Create:** `e2e/error-handling.spec.ts`

**Tests:**
- Navigate to non-existent route → shows 404 or redirects
- Game page with JavaScript disabled → graceful degradation
- Lab reports page with blocked API → shows error message
- Invalid URL parameters handled gracefully
- Console has no unexpected errors during normal navigation

**~5 tests**

---

### Task 10: E2E — Mobile viewport testing

**Create:** `e2e/mobile.spec.ts`

**Tests (run with mobile viewport 375x667):**
- Landing page renders and is usable on mobile
- Chemistry hub cards are scrollable
- Game menu is accessible on small screen
- Lab reports form is usable on mobile
- Navigation hamburger menu works (if present)
- No horizontal overflow on any main page

**~6 tests**

---

### Task 11: E2E — Performance smoke tests

**Modify:** `e2e/smoke.spec.ts`

**Add tests for:**
- Landing page loads within 3 seconds
- Game HTML files load within 5 seconds
- No JavaScript errors in console on any main page
- All critical assets (CSS, JS) load successfully (no 404s)
- Service worker or caching headers present (if applicable)

**~4 tests**

---

## Phase 3: Accessibility Hardening (Tasks 12-17)

### Task 12: Add axe-core testing to game menu

**Create:** `apps/games/1-ar/dimensional-analysis/src/__tests__/a11y.test.tsx`
**Pattern:** Follow `packages/shared/components/__tests__/a11y.test.tsx`

**Tests:**
- Game menu has no axe violations
- Level buttons have accessible names
- Achievement indicators are labeled
- Focus order is logical (levels in order)
- Color contrast meets WCAG AA for game text

Pick dimensional-analysis as the template game. If it passes, create a shared test helper.

**~5 tests**

---

### Task 13: Create shared a11y test helper for games

**Create:** `packages/shared/utils/__tests__/a11y-helpers.ts` (test utility, not a test file)

Extract common a11y test patterns:
```typescript
export async function expectNoAxeViolations(container: HTMLElement) { ... }
export function expectFocusOrder(elements: HTMLElement[]) { ... }
export function expectColorContrast(foreground: string, background: string) { ... }
```

**Modify:** Refactor the test from Task 12 to use these helpers.

---

### Task 14: Add a11y tests to lab-reports

**Create:** `apps/lab-reports/src/__tests__/a11y.test.tsx`

**Tests:**
- Main layout has no axe violations
- File upload area has accessible labels
- Experiment selector is keyboard navigable
- Results section uses proper heading hierarchy
- Auth button has accessible name
- Error messages are announced to screen readers (aria-live)

**~8 tests**

---

### Task 15: Add a11y tests to landing page

**Create:** `apps/landing/src/__tests__/a11y.test.tsx`

**Tests:**
- Track selector grid has no axe violations
- Track cards are keyboard focusable
- Chemistry hub year tiles have accessible names
- Year hub game cards are properly labeled
- All interactive elements have visible focus indicators

**~6 tests**

---

### Task 16: Add a11y tests to islenskubraut

**Create:** `apps/islenskubraut/src/__tests__/a11y.test.tsx`

**Tests:**
- Category grid has no axe violations
- Category cards have accessible names
- Teaching card page content is properly structured (headings, landmarks)
- Navigation between categories is keyboard accessible

**~5 tests**

---

### Task 17: Add keyboard navigation E2E tests

**Create:** `e2e/keyboard-navigation.spec.ts`

**Tests:**
- Tab through landing page track cards
- Enter/Space activates track card
- Tab through game level buttons
- Escape closes modals/popups
- Focus trapped in modals when open
- Skip-to-content link works (if present)

**~6 tests**

---

## Phase 4: Documentation Cleanup (Tasks 18-21)

### Task 18: Update KVENNO-STRUCTURE.md URL paths

**Modify:** `docs/KVENNO-STRUCTURE.md`

The document (1099 lines) has stale content:
1. **Section 1 references old repo structure** ("ChemistryTools-Landing", "LabReports", "ChemistryGames") — update to monorepo paths (`apps/landing`, `apps/lab-reports`, `apps/games/`)
2. **Section 1.2 deployment paths** reference old `/1-ar/`, `/2-ar/` — update to `/efnafraedi/1-ar/`, `/efnafraedi/2-ar/` etc.
3. **Section 2 references non-existent files** (`AZURE-AD-README.md`, `AZURE-AD-IMPLEMENTATION-GUIDE.md`) — remove or update references

Read the full file, make targeted updates, preserve accurate sections.

---

### Task 19: Add Azure AD authentication documentation

**Create:** `docs/azure-ad-setup.md`

KVENNO-STRUCTURE.md references Azure AD auth docs that don't exist. Create them:

**Content:**
- MSAL configuration overview (reference `apps/lab-reports/src/utils/msalInstance.ts`)
- Required Azure AD app registration settings
- Environment variables needed (`VITE_MSAL_CLIENT_ID`, `VITE_MSAL_AUTHORITY`, etc.)
- Auth flow diagram (redirect flow)
- Teacher role system (how `TEACHER_EMAILS` / `VITE_TEACHER_EMAILS` works)
- Troubleshooting common auth errors

Read `msalInstance.ts`, `authHelpers.ts`, `AuthCallback.tsx`, `AuthGuard.tsx`, `AuthButton.tsx` for source material.

---

### Task 20: Update KVENNO-STRUCTURE.md with Round 2-3 changes

**Modify:** `docs/KVENNO-STRUCTURE.md`

Add/update sections for:
- Shared hooks (`useGameProgress`, `useGameI18n`, `useI18n`)
- Extracted game data/utils structure (data/ and utils/ dirs in games)
- CI/CD pipeline (parallel jobs, coverage, deploy workflow)
- Bundle size reference (link to `docs/bundle-sizes.md`)
- i18n system overview (link to `docs/i18n-coverage.md`)
- Testing strategy (vitest unit + Playwright E2E)

---

### Task 21: Add server rate limiting tests

**Create:** `server/src/__tests__/rate-limiting.test.ts`
**Source:** Read `server/src/index.ts` for rate limiter middleware configuration

**Tests:**
- Rate limiter allows requests within limit
- Rate limiter blocks requests exceeding limit
- Rate limiter resets after window expires
- Different endpoints have appropriate limits
- Rate limit headers present in responses (X-RateLimit-*)

**~6 tests**

---

## Verification (after all tasks)

1. `pnpm type-check` — no TypeScript errors
2. `pnpm lint` — 0 errors (including the MoleculeViewer3D fix)
3. `pnpm test` — all tests pass (expected ~1,080+ tests)
4. `cd server && pnpm test` — server tests pass (expected ~46+ tests)
5. `pnpm build` — full build succeeds
6. `npx playwright test` — E2E tests pass (expected ~80+ E2E tests)

---

## Summary

| Phase | Tasks | New Tests | Focus |
|-------|-------|-----------|-------|
| 1: Quick Wins | 1-4 | ~8 unit | nafnakerfid i18n, teacher config, lint fix |
| 2: E2E Expansion | 5-11 | ~38 E2E | Game flows, lab-reports, navigation, mobile, errors |
| 3: Accessibility | 12-17 | ~30 unit + 6 E2E | axe-core for games/apps, keyboard nav |
| 4: Documentation | 18-21 | ~6 server | KVENNO-STRUCTURE update, Azure AD docs, rate limiting |

**Total new tests: ~88 (~44 unit, ~44 E2E)**
**Expected totals: ~1,082 unit tests, ~80+ E2E tests**

**Key outcomes:**
- 17/17 games use i18n (from 16/17)
- Teacher role system configurable via environment variable
- E2E covers critical user flows (games, lab reports, navigation, mobile)
- Accessibility tested across all apps
- Documentation current with architecture
- 0 lint errors
