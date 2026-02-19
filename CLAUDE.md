# CLAUDE.md - kvenno.app Unified Monorepo

## Project Overview

**kvenno.app** is a unified education platform for Kvennaskólinn í Reykjavík (a secondary school in Iceland). This monorepo contains the landing page, chemistry games, lab report grading tool, and shared component library.

**Primary Language:** Icelandic (all UI text must be in Icelandic)

## Architecture

pnpm monorepo with Vite + React + TypeScript + Tailwind CSS.

```
kvenno-app/
├── apps/
│   ├── landing/          # Landing page + year hubs (React SPA)
│   ├── lab-reports/      # AI-powered lab report grading (React SPA)
│   └── games/            # 17 chemistry games (single-file HTML builds)
│       ├── 1-ar/         # 5 games for year 1
│       ├── 2-ar/         # 7 games for year 2
│       └── 3-ar/         # 5 games for year 3
├── packages/
│   └── shared/           # Shared components, hooks, utils, types, i18n
├── server/               # Express backend for lab reports (Claude AI proxy)
├── scripts/              # Build and deploy scripts
├── docs/                 # KVENNO-STRUCTURE.md and other docs
├── media/                # Favicons and brand assets
└── dist/                 # Build output (gitignored)
```

## Key Commands

```bash
pnpm install              # Install all dependencies
pnpm build                # Build everything to dist/
pnpm dev:landing          # Dev server for landing page
pnpm dev:lab-reports      # Dev server for lab reports
pnpm dev:games            # Dev servers for all games
pnpm build:games          # Build only games
pnpm build:landing        # Build only landing
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
- **Header** - "Efnafræðivefur Kvennó" with "Kennarar" and "Upplýsingar" buttons. Accepts `authSlot` prop.
- **Breadcrumbs** - "Heim > [Section] > [Page]" navigation
- **Footer** - Copyright notice

Plus game-specific shared components (AchievementsPanel, HintSystem, etc.)

## Build Output (dist/)

```
dist/
├── index.html              # Landing page SPA
├── assets/                 # Landing JS/CSS
├── media/                  # Favicons
├── 1-ar/
│   ├── index.html          # Year 1 hub (SPA catch-all)
│   └── games/
│       ├── molmassi.html   # Self-contained game (~200KB)
│       └── ...
├── 2-ar/
│   ├── index.html
│   ├── games/...
│   └── lab-reports/        # SPA with assets/
├── 3-ar/
│   ├── index.html
│   ├── games/...
│   └── lab-reports/
├── val/index.html
└── f-bekkir/index.html
```

## Development Guidelines

### Adding a new game
1. Create `apps/games/[year]/[game-name]/` following existing game pattern
2. Add entry to `scripts/build-games.mjs` games array
3. Add tool card to the year hub config in `apps/landing/src/pages/YearHub.tsx`

### Adding a new experiment to lab reports
1. Create config in `apps/lab-reports/src/config/experiments/`
2. Register in `apps/lab-reports/src/config/experiments/index.ts`
3. See `apps/lab-reports/src/config/experiments/README.md`

### Updating shared components
1. Edit in `packages/shared/`
2. All apps pick up changes immediately (workspace dependency)
3. Run `pnpm type-check` to verify no breakage

### Deployment
```bash
pnpm build                 # Build everything
./scripts/deploy.sh        # rsync to server + restart backend
```

## Important Notes

- **Icelandic UI:** All user-facing text must be in Icelandic
- **KVENNO-STRUCTURE.md:** The master design document lives at `docs/KVENNO-STRUCTURE.md`
- **Games build to single HTML files** via `vite-plugin-singlefile` (~200KB each)
- **Lab reports need 2 builds:** One for `/2-ar/lab-reports/` and one for `/3-ar/lab-reports/`
- **Server needs system deps:** `pandoc` and `libreoffice` for .docx processing
- **API key security:** Claude API key lives in `server/.env` (never committed), proxied through Express backend
