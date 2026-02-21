# Modernization Plan — kvenno.app Design System Unification

> **Status:** Approved — decisions confirmed, Phase 1 in progress
> **Date:** 2026-02-20
> **Scope:** Full design audit, unified design system, shared infrastructure, reskin of all apps

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Audit Findings](#2-current-state-audit-findings)
3. [Phased Plan](#3-phased-plan)
4. [Decision Points](#4-decision-points-requiring-your-input)
5. [Risk Mitigation](#5-risk-mitigation)
6. [File Impact Map](#6-file-impact-map)

---

## 1. Executive Summary

This plan modernizes the kvenno.app monorepo — 3 SPAs (landing, lab-reports, islenskubraut), 17 chemistry games, a shared component library, and an Express backend — into a cohesive, visually unified platform for 15–18 year old students at Kvennaskólinn í Reykjavík.

**What changes:** Visual design, typography, color palette, component styling, navigation consistency, mobile experience.
**What does NOT change:** Application logic, game mechanics, API endpoints, data structures, build system, routing architecture.

The work is split into **6 phases** with explicit checkpoints where you review and approve before the next phase begins.

---

## 2. Current State Audit Findings

### 2.1 Architecture Overview

| App               | Routes                                         | Components                                                             | Build Output                                |
| ----------------- | ---------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| **Landing**       | `/`, `/efnafraedi`, `/efnafraedi/{year}`       | Header, Footer, Container, Card, Breadcrumbs, Badge                    | SPA → `dist/index.html`                     |
| **Lab Reports**   | Mounted at `/efnafraedi/{2,3}-ar/lab-reports/` | FileUpload, TeacherResults, StudentFeedback, Modal, Toast              | SPA → `dist/efnafraedi/{year}/lab-reports/` |
| **Islenskubraut** | `/`, `/spjald/:flokkur`                        | CategoryCard, LevelSelector, SpurningaSpjald, DownloadButton           | SPA → `dist/islenskubraut/`                 |
| **17 Games**      | `/efnafraedi/{year}/games/*.html`              | AchievementsPanel, HintSystem, FeedbackPanel, ParticleSimulation, etc. | Single-file HTML (1.2–2.9 MB each)          |

### 2.2 Inconsistencies Found

#### Typography (HIGH priority)

- **theme.css** declares `"Inter"` as primary font with system fallbacks
- **tailwind-preset.ts** (legacy) declares system font stack only (no Inter)
- **game-base.css** imports Inter from Google Fonts (inlined at build)
- **kvenno.is** (school website) uses **Hind** (Google Font, weights 300–700)
- **Result:** Font rendering varies across apps. No intentional typographic hierarchy. Inter is a generic choice that doesn't stand out.

#### Color Palette (MEDIUM priority)

- **Brand orange** `#f36b22` is used consistently as primary across all apps — good
- **Year themes** are defined in `theme.ts` (1-ar: orange/amber, 2-ar: teal/cyan, 3-ar: purple/indigo) but games predominantly use orange regardless of year
- **Islenskubraut** has its own per-category color palette (6 unique hex values: `#2D6A4F`, `#8B4513`, `#1e3a8a`, `#7c2d12`, `#4c1d95`, `#0369a1`) disconnected from the shared system
- **Semantic colors** (success `#10b981`, warning `#f59e0b`, error `#ef4444`, info `#3b82f6`) are defined but ad-hoc Tailwind color classes (e.g., `bg-green-600`, `bg-blue-500`) are used inconsistently alongside them

#### Component Patterns (MEDIUM priority)

- **Shared primitives exist** (Card, Button, Badge) with well-defined variants — but not all apps use them consistently
- **Islenskubraut** uses its own Header/Footer variants (`variant="islenskubraut"`) with different styling
- **Lab Reports** has custom Modal, Toast, and dialog components not in the shared library
- **Games** use shared game components (AchievementsPanel, HintSystem) consistently, but layout/container patterns vary per game
- **Card border-radius** varies: `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px) used interchangeably

#### Navigation (HIGH priority)

- **No global navigation** between tracks — users must go back to the landing page to switch between Chemistry and Islenskubraut
- **Breadcrumbs** work within each track but don't show cross-track awareness
- **Islenskubraut** is fully isolated (`isExternal: true`) — full page reload to enter/exit
- **Games** have no back-to-hub navigation — users rely on browser back button
- **Header** shows "Námsvefur Kvennó" title but no track indicator or switcher

#### Layout & Spacing (LOW priority)

- **Container** max-width is consistent (1152px / max-w-6xl)
- **Card padding** varies: `p-4`, `p-6`, `p-8` used based on context (mostly appropriate)
- **Grid gaps** are mostly `gap-6` or `gap-8` — fairly consistent
- **Page margins** vary: some pages use `py-6`, others `py-10 sm:py-16`

#### Mobile Responsiveness (MEDIUM priority)

- **Grid layouts** are responsive (1 col → 2–3 cols) — generally good
- **Touch targets** are undersized: buttons at `py-2` (32px total) vs recommended 44px minimum
- **Game simulations** use ResizeObserver-based responsive sizing — good
- **Text scaling** is responsive (`text-3xl sm:text-4xl lg:text-5xl`) — good
- **No mobile navigation** pattern (hamburger menu, bottom nav, etc.)

#### Accessibility (LOW priority — already decent)

- **Skip link** present across all apps
- **Focus-visible** outlines use brand orange — good
- **Semantic HTML** (`<main>`, `<nav>`, `<header>`) — good
- **High-contrast mode** and **reduced-motion** support — good
- **ARIA labels** present but inconsistent (some buttons missing descriptive labels)
- **Color contrast:** Orange `#f36b22` on white backgrounds may not meet WCAG AA for small text (contrast ratio ~3.5:1, needs 4.5:1)

### 2.3 Current Design Token Inventory

```
COLORS
  Brand:      #f36b22 (primary), #c55113 (dark), #ff8c4d (light)
  Semantic:   #10b981 (success), #f59e0b (warning), #ef4444 (error), #3b82f6 (info)
  Neutrals:   Tailwind slate-50 through slate-900
  Year 1:     orange-50 → amber-100 gradient
  Year 2:     teal-50 → cyan-100 gradient
  Year 3:     purple-50 → indigo-100 gradient

TYPOGRAPHY
  Font:       Inter (games), system stack (apps) — inconsistent
  Weights:    400, 500, 600, 700
  Scale:      xs(12) sm(14) base(16) lg(18) xl(20) 2xl(24) 3xl(30)

SPACING
  Border-radius:  8px (buttons), 12px (cards), 16px (large cards), full (badges)
  Shadows:        card (2px 4px), card-hover (4px 12px orange-tinted), elevated (10px 15px)
  Transitions:    150ms (fast), 300ms (normal), 500ms (slow)

COMPONENTS (shared library)
  Layout:     Header, Footer, Container, PageBackground, SkipLink, Breadcrumbs
  Primitives: Button (5 variants), Card (4 variants), Badge (8 variants)
  Game:       AchievementsPanel, HintSystem, FeedbackPanel, ParticleSimulation,
              InteractiveGraph, MoleculeViewer3D, DragDropBuilder, LanguageSwitcher
```

---

## 3. Phased Plan

### Phase 0: Audit Documentation

**Effort:** Already complete (this document)
**Checkpoint:** You review this plan and approve before Phase 1 begins.

---

### Phase 1: Design System Specification

**Effort:** ~1 session
**Output:** `DESIGN_SYSTEM.md` at repo root

#### What happens:

1. **Define the full color palette** derived from school brand:
   - Primary: `#f36b22` (from kvenno.is)
   - Secondary accent: derived from `#c55113`
   - Build out neutral scale, semantic colors, surface colors
   - Year-specific accent colors (refined from current teal/purple themes)
   - Islenskubraut category colors (keep but harmonize with system)

2. **Choose typography:**
   - Select a distinctive, readable font pair that handles Icelandic characters well (á, é, í, ó, ú, ý, þ, ð, æ, ö)
   - Define type scale, weights, line heights
   - Heading vs body font treatment

3. **Define spacing & layout scale:**
   - Standardize border-radius (pick 3–4 sizes and use them consistently)
   - Standardize shadow scale
   - Define responsive breakpoint behavior
   - Set minimum touch target size (44px)

4. **Component specifications:**
   - Card, Button, Badge, Input, Modal, Toast, Navigation
   - Hover/focus/active/disabled states for each
   - Mobile behavior for each

5. **Navigation pattern:**
   - Design a global nav that lets users switch between Chemistry/Islenskubraut
   - Game-to-hub back navigation
   - Mobile nav pattern

6. **Page layout templates:**
   - Landing/hub pages
   - Tool pages (lab reports)
   - Game container
   - Category browser (Islenskubraut)

#### Checkpoint: You review DESIGN_SYSTEM.md. Approve the palette, typography, component specs, and navigation pattern before any code is written.

---

### Phase 2: Shared Infrastructure

**Effort:** ~2 sessions
**Dependencies:** Phase 1 approved

#### What happens:

1. **Update `packages/shared/styles/theme.css`:**
   - New color tokens (CSS custom properties)
   - New typography tokens (font imports, scale)
   - New spacing/radius/shadow tokens
   - Remove legacy `tailwind-preset.ts` references where possible

2. **Update shared components:**
   - `Header` — add track switcher / global navigation
   - `Footer` — unify (remove islenskubraut variant if possible, or refine both)
   - `Card` — standardize border-radius, shadows, hover behavior
   - `Button` — enforce minimum touch targets, refine variants
   - `Badge` — standardize
   - New: `Toast` (promote from lab-reports to shared)
   - New: `Modal` (promote from lab-reports to shared)
   - New: `GameContainer` layout wrapper (standardize game page structure)
   - New: `MobileNav` (if mobile nav pattern is adopted)

3. **Update `packages/shared/styles/game-base.css`:**
   - New font imports
   - Updated brand utilities
   - Standardized game layout classes

4. **Verify shared package exports** — all new/updated components exported correctly

#### Checkpoint: You review the updated shared components. I'll provide before/after screenshots of the landing page (first consumer of the new system). Approve before reskinning begins.

---

### Phase 3: Reskin — Landing + Lab Reports

**Effort:** ~2 sessions
**Dependencies:** Phase 2 approved

#### What happens:

1. **Landing app (`apps/landing/`):**
   - Apply new color palette to Home, ChemistryHub, YearHub pages
   - Apply new typography
   - Update card styling, hover effects, transitions
   - Add global navigation (track switcher)
   - Ensure mobile responsiveness with new touch targets
   - Verify all routes render correctly

2. **Lab Reports app (`apps/lab-reports/`):**
   - Apply new palette and typography
   - Restyle FileUpload, TeacherResults, StudentFeedback
   - Replace local Modal/Toast with shared versions (if adopted)
   - Ensure Azure AD auth flow is unaffected
   - Test student mode and teacher mode
   - Verify file upload, AI analysis, session history all work
   - Ensure both 2-ar and 3-ar builds work

3. **Regression testing:**
   - Run `pnpm type-check` and `pnpm lint`
   - Run `pnpm test`
   - Manual verification of each route

#### Checkpoint: You review landing + lab reports. I'll provide screenshots of all major views. Approve before games reskin begins.

---

### Phase 4: Reskin — Islenskubraut

**Effort:** ~1 session
**Dependencies:** Phase 3 approved (shared components proven stable)

#### What happens:

1. **Islenskubraut app (`apps/islenskubraut/`):**
   - Apply new palette and typography
   - Harmonize category colors with the design system (keep distinct but adjust saturation/tone to fit)
   - Update CategoryCard, LevelSelector, SpurningaSpjald styling
   - Integrate global navigation (track switcher in header)
   - Unify header/footer with shared variants (or keep variant but align styling)
   - Ensure PDF generation still works (server-side data unchanged)
   - Test all 6 categories and all 3 levels (A1, A2, B1)

2. **Regression testing:**
   - All routes render
   - PDF download works
   - Mobile layout verified

#### Checkpoint: You review Islenskubraut. Screenshots of category grid and detail page. Approve before games.

---

### Phase 5: Reskin — Games (17 games)

**Effort:** ~3–4 sessions (this is the largest phase)
**Dependencies:** Phase 4 approved

#### What happens:

1. **Update `game-base.css`** — this propagates base styling to all 17 games at once:
   - New font
   - New brand color utilities
   - New game container layout
   - Updated animation tokens

2. **Update shared game components:**
   - AchievementsPanel, HintSystem, FeedbackPanel — new styling
   - LanguageSwitcher — align with design system
   - Game menu pattern — standardized level selection screen

3. **Per-game reskin (17 games):**
   - Update each game's `styles.css` and component classes
   - Apply year-specific theme colors consistently (1-ar: orange/amber, 2-ar: teal/cyan, 3-ar: purple/indigo)
   - Add back-to-hub navigation link
   - Verify each game loads and plays correctly
   - Order of reskinning:
     - **Year 1 (5 games):** takmarkandi, molmassi, nafnakerfid, lausnir, dimensional-analysis
     - **Year 2 (7 games):** hess-law, kinetics, lewis-structures, vsepr-geometry, intermolecular-forces, organic-nomenclature, redox-reactions
     - **Year 3 (5 games):** ph-titration, gas-law-challenge, equilibrium-shifter, thermodynamics-predictor, buffer-recipe-creator

4. **Batch verification after each year:**
   - Build all games for that year: check single-file HTML output
   - Verify game loads in browser
   - Verify achievements, hints, progress persistence still work
   - Check bundle sizes haven't changed dramatically

#### Checkpoint: Games delivered in 3 sub-batches (Year 1, Year 2, Year 3). You can review after each year or after all 3.

---

### Phase 6: Final Verification & Cleanup

**Effort:** ~1 session
**Dependencies:** All previous phases approved

#### What happens:

1. **Full build verification:**
   - `pnpm build` succeeds with no errors
   - `pnpm type-check` passes
   - `pnpm lint` passes
   - `pnpm test` passes

2. **Cross-app navigation testing:**
   - Landing → Chemistry Hub → Year Hub → Game → back to Hub
   - Landing → Islenskubraut → Category → Detail → back to Landing
   - Landing → Lab Reports → full workflow → back to Landing
   - All breadcrumbs work correctly

3. **Mobile verification:**
   - All pages tested at 375px (iPhone SE), 390px (iPhone 14), 768px (iPad)
   - Touch targets meet 44px minimum
   - Navigation works on mobile
   - Games playable on mobile

4. **Accessibility verification:**
   - Skip link works on all pages
   - Focus-visible outlines consistent
   - Color contrast passes WCAG AA for text
   - Screen reader landmark navigation works

5. **Bundle size check:**
   - Compare game bundle sizes before/after
   - Flag any game that grew by more than 20%

6. **Cleanup:**
   - Remove legacy `tailwind-preset.ts` if fully replaced
   - Remove any dead CSS/unused imports
   - Update `docs/KVENNO-STRUCTURE.md` if architecture changed

#### Checkpoint: Final review. Full before/after comparison. You approve, then we commit.

---

## 4. Decision Points Requiring Your Input

Before Phase 1 can produce a complete design system, I need your preferences on:

### D1: Typography — CONFIRMED: **B — Plus Jakarta Sans + DM Sans**

Friendly, geometric, distinctive. Excellent Icelandic character support. Approachable for teens without being childish.

### D2: Visual Tone — CONFIRMED: **A — Warm & Energetic**

Orange-forward, warm neutrals (cream/sand instead of slate), playful shadows, rounded elements. Restrained warmth — inviting, not loud.

### D3: Navigation — CONFIRMED: **C — Top bar + mobile bottom nav**

Top bar with track tabs on desktop, bottom tab bar on mobile. Thumb-reachable, familiar to students, always visible.

### D4: Islenskubraut Integration — CONFIRMED: **A — Full integration**

Same Header/Footer as all apps. Shared navigation. One unified platform. Category colors kept but harmonized.

### D5: Game Year Themes — CONFIRMED: **A — Keep year-specific colors**

Year 1 = orange/amber, Year 2 = teal/cyan, Year 3 = purple/indigo. Used as accents within the warm base palette.

---

## 5. Risk Mitigation

| Risk                                                  | Impact | Mitigation                                                                      |
| ----------------------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| Game functionality breaks during reskin               | HIGH   | Reskin CSS/classes only. Never modify game logic. Test each game after changes. |
| Font change affects layout (Icelandic words are long) | MEDIUM | Test with longest Icelandic words during Phase 1 font selection.                |
| Single-file HTML bundle sizes increase                | MEDIUM | Monitor sizes. New font adds ~50–100KB per game (inlined).                      |
| Lab Reports auth flow breaks                          | HIGH   | Don't touch auth components. Only style surrounding UI.                         |
| PDF generation breaks (Islenskubraut)                 | MEDIUM | Server-side code/data unchanged. Only client styling changes.                   |
| Regression in existing tests                          | LOW    | Run full test suite at each phase checkpoint.                                   |

---

## 6. File Impact Map

### Files Modified (estimated)

**Phase 2 — Shared Infrastructure:**

```
packages/shared/styles/theme.css          — Major rewrite (new tokens)
packages/shared/styles/game-base.css      — Updated (new font, colors)
packages/shared/styles/theme.ts           — Updated (new token exports)
packages/shared/components/Header.tsx     — Modified (navigation)
packages/shared/components/Footer.tsx     — Modified (styling)
packages/shared/components/Card.tsx       — Modified (styling)
packages/shared/components/Button.tsx     — Modified (touch targets, styling)
packages/shared/components/Badge.tsx      — Modified (styling)
packages/shared/components/index.ts       — Updated (new exports)
+ New files: Toast.tsx, Modal.tsx, GameContainer.tsx (possibly)
```

**Phase 3 — Landing + Lab Reports:**

```
apps/landing/src/index.css                — Updated imports
apps/landing/src/pages/Home.tsx           — Tailwind class updates
apps/landing/src/pages/ChemistryHub.tsx   — Tailwind class updates
apps/landing/src/pages/YearHub.tsx        — Tailwind class updates
apps/lab-reports/src/index.css            — Updated imports
apps/lab-reports/src/App.tsx              — Styling updates
apps/lab-reports/src/pages/*.tsx          — Tailwind class updates
apps/lab-reports/src/components/*.tsx      — Tailwind class updates
```

**Phase 4 — Islenskubraut:**

```
apps/islenskubraut/src/index.css          — Updated imports
apps/islenskubraut/src/App.tsx            — Header/footer changes
apps/islenskubraut/src/pages/Home.tsx     — Tailwind class updates
apps/islenskubraut/src/pages/SpjaldPage.tsx — Tailwind class updates
apps/islenskubraut/src/components/*.tsx    — Styling updates
```

**Phase 5 — Games (×17):**

```
apps/games/{year}/{game}/src/styles.css   — Updated (×17)
apps/games/{year}/{game}/src/App.tsx      — Menu styling (×17)
apps/games/{year}/{game}/src/*.tsx        — Tailwind class updates (×17)
packages/shared/components/Achievements*.tsx — Styling updates
packages/shared/components/HintSystem.tsx    — Styling updates
packages/shared/components/FeedbackPanel.tsx — Styling updates
```

**Total estimated files touched:** ~80–100 files across all phases.

---

## Next Steps

1. **You review this plan** and provide feedback
2. **Answer the 5 decision points** (D1–D5) so I can tailor Phase 1
3. Once approved, I begin **Phase 1: Design System Specification**
