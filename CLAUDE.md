# CLAUDE.md - kvenno.app Unified Monorepo

## Project Overview

**kvenno.app** ("Námsvefur Kvennó") is a multi-track education platform for Kvennaskólinn í Reykjavík (a secondary school in Iceland). This monorepo contains the track-selector landing page, chemistry games, lab report grading tool, Íslenskubraut teaching card generator, and shared component library.

**Primary Language:** Icelandic (all UI text must be in Icelandic)

## Architecture

pnpm monorepo with Vite + React + TypeScript + Tailwind CSS.

```
kvenno-app/
├── apps/
│   ├── landing/          # Landing page (track selector) + chemistry year hubs (React SPA)
│   ├── islenskubraut/    # Icelandic language teaching cards (React SPA, /islenskubraut/)
│   ├── lab-reports/      # AI-powered lab report grading (React SPA)
│   └── games/            # 17 chemistry games (single-file HTML builds)
│       ├── 1-ar/         # 5 games for year 1
│       ├── 2-ar/         # 7 games for year 2
│       └── 3-ar/         # 5 games for year 3
├── packages/
│   └── shared/           # Shared components, hooks, utils, types, i18n
├── server/               # Express backend (Claude AI proxy + PDF generation)
├── scripts/              # Build and deploy scripts
├── docs/                 # KVENNO-STRUCTURE.md and other docs
├── media/                # Favicons and brand assets
└── dist/                 # Build output (gitignored)
```

## URL Structure

```
/                                      # Track selector (Efnafræði, Íslenskubraut, ...)
/efnafraedi/                           # Chemistry track hub (year tiles)
/efnafraedi/{1-ar,2-ar,3-ar,val,f-bekkir}/  # Year hubs
/efnafraedi/{year}/games/*.html        # Chemistry games
/efnafraedi/{year}/lab-reports/        # Lab reports SPA (2-ar, 3-ar)
/islenskubraut/                        # Íslenskubraut SPA (category grid)
/islenskubraut/spjald/:flokkur         # Teaching card detail page
```

Legacy URLs (`/1-ar`, `/2-ar`, etc.) redirect to `/efnafraedi/...` via nginx.

## Key Commands

```bash
pnpm install              # Install all dependencies
pnpm build                # Build everything to dist/
pnpm dev:landing          # Dev server for landing page
pnpm dev:islenskubraut    # Dev server for íslenskubraut
pnpm dev:lab-reports      # Dev server for lab reports
pnpm dev:games            # Dev servers for all games
pnpm build:games          # Build only games
pnpm build:landing        # Build only landing
pnpm build:islenskubraut  # Build only íslenskubraut
pnpm build:lab-reports    # Build only lab reports
pnpm type-check           # TypeScript check across all packages
pnpm lint                 # ESLint check
pnpm test                 # Run tests
./scripts/deploy.sh       # Deploy to production server
```

## Design System

**Brand color:** `#f36b22` (kvenno-orange)

All apps use the shared Tailwind preset from `packages/shared/styles/tailwind-preset.ts`:
- `kvenno-orange`: `#f36b22` (primary), `#d95a1a` (dark), `#ff8c4d` (light)
- System font stack
- Card border-radius: 12px, button border-radius: 8px

## Shared Components

`packages/shared/` provides site-wide components:
- **Header** - Accepts `title` prop (default: "Námsvefur Kvennó"), plus "Kennarar" and "Upplýsingar" buttons. Accepts `authSlot` prop.
- **Breadcrumbs** - "Heim > [Track] > [Section] > [Page]" navigation
- **Footer** - Copyright notice. Accepts optional `department` prop (e.g., "Efnafræðideild").

Game-specific shared components:
- **AchievementsPanel** / **AchievementsButton** - Achievement system UI
- **HintSystem** - Tiered progressive hints
- **FeedbackPanel** - Detailed answer feedback
- **InteractiveGraph** - Canvas-based graph with cubic spline interpolation, gradient fills
- **ParticleSimulation** - Physics-based particle visualization with sphere shading, motion trails, speed glow, collision flash
- **AnimatedMolecule** - Ball-and-stick molecular structure renderer
- **DragDropBuilder** - Flexible drag-and-drop interface

Graphics & animation components (integrated into all 17 games):
- **ParticleCelebration** + `useParticleCelebration` - Canvas confetti/burst effects with 6 presets (burst, confetti, streak-3/5/10, level-complete) and year-theme color palettes
- **AnimatedBackground** - Layered gradient blobs + floating chemistry SVG symbols, year-themed (1-ar=orange, 2-ar=teal, 3-ar=purple)
- **AnimatedCounter** - Rolling number counter with easeOutExpo easing
- **ScorePopup** - Floating "+N" indicators
- **StreakCounter** - Escalating fire emoji streak badge
- **SoundToggle** + `useGameSounds` - Web Audio API synthesized sounds (click, correct, wrong, level-complete, achievement, streak). Sounds default to OFF, persisted in localStorage.

Shared styles (`packages/shared/styles/`):
- **theme.css** - Tailwind v4 `@theme` tokens: colors, typography, shadows, spring easing curves, glassmorphism tokens, 12 animation keyframes
- **game-base.css** - Microinteraction utility classes: `game-btn`, `game-card`, `game-glass`, `game-correct`, `game-wrong`, `game-score-popup`, `game-streak-fire`, `game-stagger`

**Note:** Íslenskubraut uses its own header/footer (different design from the shared components).

## Track System

Tracks are defined data-driven in `apps/landing/src/config/tracks.ts`. Each track has:
- `id`, `path`, `title`, `description`, `icon`
- `isExternal: true` for separate SPAs (e.g., íslenskubraut)

To add a new track: add entry to `tracks.ts`, create the app, update `build-all.mjs` and nginx config.

## Build Output (dist/)

```
dist/
├── index.html                         # Track selector SPA
├── assets/                            # Landing JS/CSS
├── media/                             # Favicons
├── efnafraedi/
│   ├── index.html                     # Chemistry hub (SPA fallback)
│   ├── 1-ar/
│   │   ├── index.html                 # Year 1 hub (SPA fallback)
│   │   └── games/*.html               # Self-contained games (~200KB each)
│   ├── 2-ar/
│   │   ├── index.html
│   │   ├── games/...
│   │   └── lab-reports/               # SPA with assets/
│   ├── 3-ar/
│   │   ├── index.html
│   │   ├── games/...
│   │   └── lab-reports/
│   ├── val/index.html
│   └── f-bekkir/index.html
└── islenskubraut/
    ├── index.html                     # Íslenskubraut SPA
    └── assets/
```

## Server API Endpoints

Express backend at `server/` (port 8000):

- `POST /api/process-document` — DOCX → PDF conversion (LibreOffice)
- `POST /api/analyze` — Lab report analysis via Claude API
- `POST /api/analyze-2ar` — 2nd year simplified checklist analysis
- `GET /api/islenskubraut/pdf?flokkur={id}&stig={level}` — Generate teaching card PDF
- `GET /health` — Health check

## Development Guidelines

### Adding a new game
1. Create `apps/games/[year]/[game-name]/` following existing game pattern
2. Add entry to `scripts/build-games.mjs` games array
3. Add tool card to the year hub config in `apps/landing/src/pages/YearHub.tsx`

### Adding a new experiment to lab reports
1. Create config in `apps/lab-reports/src/config/experiments/`
2. Register in `apps/lab-reports/src/config/experiments/index.ts`
3. See `apps/lab-reports/src/config/experiments/README.md`

### Adding a new track
1. Add entry to `apps/landing/src/config/tracks.ts`
2. Create app in `apps/[track-name]/`
3. Add to `pnpm-workspace.yaml` and root `package.json` scripts
4. Add build step to `scripts/build-all.mjs`
5. Add SPA location to `server/nginx-site.conf`

### Updating shared components
1. Edit in `packages/shared/`
2. All apps pick up changes immediately (workspace dependency)
3. Run `pnpm type-check` to verify no breakage

### Íslenskubraut data sync
Category data exists in two places:
- `apps/islenskubraut/src/data/` (TypeScript, client-side)
- `server/lib/islenskubraut-data.mjs` (plain JS, server-side PDF generation)

Keep both in sync when modifying categories.

### Deployment
```bash
pnpm build                 # Build everything
./scripts/deploy.sh        # rsync to server + restart backend
```

## Important Notes

- **Icelandic UI:** All user-facing text must be in Icelandic
- **KVENNO-STRUCTURE.md:** The master design document lives at `docs/KVENNO-STRUCTURE.md`
- **Games build to single HTML files** via `vite-plugin-singlefile` (1.2-2.9 MB each; see `docs/bundle-sizes.md`)
- **Lab reports need 2 builds:** One for `/efnafraedi/2-ar/lab-reports/` and one for `/efnafraedi/3-ar/lab-reports/`
- **Server needs system deps:** `pandoc` and `libreoffice` for .docx processing
- **API key security:** Claude API key lives in `server/.env` (never committed), proxied through Express backend
- **Legacy redirects:** Old root-level chemistry URLs (`/1-ar`, `/2-ar`, etc.) redirect to `/efnafraedi/...` via nginx
