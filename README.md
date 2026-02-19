# kvenno.app

Unified monorepo for [kvenno.app](https://kvenno.app) — a portal of interactive chemistry education tools built for [Kvennaskólinn í Reykjavík](https://kvenno.is), a secondary school in Reykjavik, Iceland.

## What's Inside

| App | Description |
|-----|-------------|
| **Landing** (`apps/landing`) | Landing page and year-based navigation hubs |
| **Lab Reports** (`apps/lab-reports`) | AI-powered lab report grading using Claude |
| **Games** (`apps/games`) | 17 interactive chemistry games across 3 school years |
| **Shared** (`packages/shared`) | Shared component library, hooks, i18n, and design system |
| **Server** (`server`) | Express backend proxying Claude API for lab report analysis |

### Games by Year

**Year 1** (5 games): Dimensional Analysis, Molar Mass, Naming System, Solutions, Limiting Reagent

**Year 2** (7 games): Hess's Law, Kinetics, Lewis Structures, VSEPR Geometry, Intermolecular Forces, Organic Nomenclature, Redox Reactions

**Year 3** (5 games): pH & Titration, Gas Law Challenge, Equilibrium Shifter, Thermodynamics Predictor, Buffer Recipe Creator

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite (games build to self-contained single-file HTML)
- **Styling:** Tailwind CSS with shared design preset
- **Monorepo:** pnpm workspaces
- **AI:** Claude API (Anthropic) for lab report grading
- **Auth:** Azure AD / MSAL (lab reports only)
- **i18n:** Icelandic, English, Polish

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev:landing          # Landing page at http://localhost:5173
pnpm dev:lab-reports      # Lab reports at http://localhost:5174
pnpm dev:games            # All games

# Build everything
pnpm build

# Serve the built site locally
npx serve dist/
```

## Build Output

`pnpm build` produces a `dist/` directory matching the production server structure:

```
dist/
├── index.html              # Landing page
├── 1-ar/
│   ├── index.html          # Year 1 hub
│   └── games/              # 5 single-file HTML games
├── 2-ar/
│   ├── index.html          # Year 2 hub
│   ├── games/              # 7 single-file HTML games
│   └── lab-reports/        # Lab reports SPA
├── 3-ar/
│   ├── index.html          # Year 3 hub
│   ├── games/              # 5 single-file HTML games
│   └── lab-reports/        # Lab reports SPA
├── val/index.html          # Elective courses hub
└── f-bekkir/index.html     # Social sciences hub
```

## Deployment

```bash
./scripts/deploy.sh
```

Deploys the built `dist/` to the production server via rsync and restarts the Express backend.

## License

[MIT](LICENSE)
