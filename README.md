# kvenno.app

An interactive chemistry education platform for secondary school students. Built as a teaching tool at [Kvennaskólinn í Reykjavík](https://kvenno.is) (Iceland), it includes 20 browser-based chemistry games, an AI-powered lab report grading system, and an Icelandic language teaching card generator. The UI is in Icelandic, but the codebase and documentation are in English.

## About

kvenno.app started as a way to make chemistry more engaging for students at Kvennaskólinn, an Icelandic secondary school. Rather than relying on textbook problem sets, students practice concepts like molar mass, Lewis structures, and acid-base equilibria through interactive games that give immediate feedback.

The platform also includes an AI lab report grading tool that helps teachers provide consistent, detailed feedback on student submissions. Students upload their lab reports (PDF or DOCX), and the system uses Claude (Anthropic's AI) to generate structured feedback against experiment-specific rubrics. Teachers can review and adjust the AI's assessment before sharing it.

A separate track, Islenskubraut, provides teaching cards for Icelandic as a second language — categorized vocabulary and phrases at A1/A2/B1 levels, with downloadable PDFs.

This is a real tool in active classroom use, not a demo. If you teach chemistry or another science subject and want to adapt the games or grading system for your own curriculum, everything here is MIT-licensed and designed to be forked.

## Demo / Live Version

**[https://kvenno.app](https://kvenno.app)**

## Tech Stack

- **Runtime:** Node.js >= 22
- **Frontend:** React 19, TypeScript 5, Vite 8
- **Styling:** Tailwind CSS 4 with shared design preset (`#f36b22` kvenno-orange)
- **Monorepo:** pnpm 9 workspaces
- **Backend:** Express (TypeScript) — Claude API proxy, DOCX-to-PDF conversion, PDF generation
- **AI:** Claude API (Anthropic) for lab report analysis
- **Games:** Most games build to a self-contained single-file HTML via `vite-plugin-singlefile`; the 3 Three.js ones (VSEPR, Lewis, Intermolecular Forces) opt out and emit HTML + CSS + JS
- **Testing:** Vitest + Playwright
- **Linting:** ESLint + Prettier + commitlint (husky pre-commit hooks)

## What's Inside

| App               | Path                 | Description                                                   |
| ----------------- | -------------------- | ------------------------------------------------------------- |
| **Landing**       | `apps/landing`       | Track selector and year-based navigation hubs                 |
| **Games**         | `apps/games`         | 20 interactive chemistry games across 3 school years          |
| **Lab Reports**   | `apps/lab-reports`   | AI-powered lab report grading with Claude                     |
| **Íslenskubraut** | `apps/islenskubraut` | Icelandic language teaching cards (A1/A2/B1)                  |
| **Shared**        | `packages/shared`    | Component library, hooks, animations, i18n, and design system |
| **Server**        | `server`             | Express backend (Claude API proxy, PDF generation)            |

### Games by Year

Listed in curriculum order.

**Year 1** (7 games): Dimensional Analysis, Periodic Table (Lotukerfið), Naming System, Molar Mass, Balancing Equations (Jafna Jöfnur), Limiting Reagent, Solutions

**Year 2** (8 games): Electronic Structure (Rafeindabygging), Lewis Structures, VSEPR Geometry, Intermolecular Forces, Hess's Law, Kinetics, Redox Reactions, Organic Nomenclature

**Year 3** (5 games): Gas Law Challenge, Equilibrium Shifter, Thermodynamics Predictor, pH & Titration, Buffer Recipe Creator

## Prerequisites

- [Node.js](https://nodejs.org/) >= 22.0.0
- [pnpm](https://pnpm.io/) >= 9.0.0

For the backend server (production only):

- [pandoc](https://pandoc.org/) — equation extraction from DOCX files
- [LibreOffice](https://www.libreoffice.org/) — DOCX-to-PDF conversion (headless mode)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/SigurdurVilhelmsson/kvenno-app.git
cd kvenno-app
pnpm install
```

### 2. Environment variables

The frontend apps work without any environment variables for local development. The backend needs a Claude API key to handle lab report analysis.

**Backend** (`server/.env`):

```bash
cp server/.env.example server/.env
```

Then edit `server/.env`:

| Variable         | Required | Description                                                                    |
| ---------------- | -------- | ------------------------------------------------------------------------------ |
| `CLAUDE_API_KEY` | Yes      | Anthropic API key from [console.anthropic.com](https://console.anthropic.com/) |
| `PORT`           | No       | Server port (default: `8000`)                                                  |
| `NODE_ENV`       | No       | `production` or `development` (default: `development`)                         |
| `FRONTEND_URL`   | No       | Allowed CORS origin (default: `https://kvenno.app`)                            |

**Lab reports** (`apps/lab-reports/.env`):

```bash
cp apps/lab-reports/.env.example apps/lab-reports/.env
```

| Variable              | Required | Description                                      |
| --------------------- | -------- | ------------------------------------------------ |
| `VITE_TEACHER_EMAILS` | No       | Comma-separated teacher emails for role-based UI |

### 3. Run (development)

```bash
pnpm dev:landing          # Landing page
pnpm dev:lab-reports      # Lab reports (served under base /lab-reports/)
pnpm dev:islenskubraut    # Islenskubraut
pnpm dev:games            # All games (multiple dev servers)
```

No app pins a dev-server port, so Vite starts at `http://localhost:5173` and increments for each
additional server already running. Use the URL Vite prints rather than assuming a fixed port.

### 4. Build

```bash
pnpm build                # Build everything to dist/
```

To build individual apps:

```bash
pnpm build:landing
pnpm build:lab-reports
pnpm build:islenskubraut
pnpm build:games
pnpm build:games --game=molmassi   # Single game
pnpm build:games --year=2-ar       # All games for one year
```

The `=` form is required. `package.json` also defines `build:game` / `build:year` aliases that pass
a bare `--game` / `--year` flag; `scripts/build-games.mjs` parses only `--game=` / `--year=`, so
those aliases silently build all 20 games instead of filtering.

### 5. Preview the built site

```bash
npx serve dist/
```

## Server Deployment

The production server is a Linode instance running Ubuntu 24.04.

- **Frontend:** `/var/www/kvenno.app` (served by nginx)
- **Backend:** `/opt/kvenno-server/` (Express on port 8000)
- **Service:** `kvenno-backend.service` (systemd)
- **Domain:** `kvenno.app` + `www.kvenno.app`
- **SSL:** Let's Encrypt via certbot (auto-renewal)
- **Nginx:** `/etc/nginx/sites-available/kvenno` — serves static files, proxies `/api/*` to port 8000

### Deploy

```bash
pnpm build
./scripts/deploy.sh           # Deploy to production
./scripts/deploy.sh --dry-run # Preview changes without deploying
```

The deploy script:

1. Rsyncs `dist/` to `/var/www/kvenno.app/` on the server
2. Builds a standalone backend bundle in a temp dir (`pnpm --filter kvenno-server deploy --prod`), so
   the host installs nothing
3. Refuses to continue if the bundle is missing `dist/index.js` (the rsync uses `--delete`, and the
   systemd unit runs `node dist/index.js`)
4. Rsyncs that bundle to `/opt/kvenno-server/` (excludes `.env`)
5. Restarts the `kvenno-backend` systemd service
6. Sets file permissions on the web root (`www-data:www-data`, `755`)
7. Health-checks the backend on the host loopback, dumping recent journal logs and failing if it
   does not come back up

See `docs/DEPLOYMENT.md` for the exact sequence — it is the source of truth for deployment.

### Systemd service

The unit is checked in at `server/kvenno-backend.service` — install that file, do not hand-write one.
It runs as `www-data` from `/opt/kvenno-server` via `/usr/bin/node dist/index.js`, with
`Restart=always`, `RestartSec=10` and systemd sandboxing (`NoNewPrivileges`, `ProtectSystem=strict`,
`ProtectHome`, `PrivateTmp`, `PrivateDevices`, `ProtectKernel*`, `RestrictSUIDSGID`,
`ReadWritePaths=/tmp`). See `docs/DEPLOYMENT.md`.

### API endpoints

| Method | Path                     | Description                                               |
| ------ | ------------------------ | --------------------------------------------------------- |
| `GET`  | `/health`                | Health check                                              |
| `POST` | `/api/process-document`  | DOCX upload, converts to PDF via LibreOffice              |
| `POST` | `/api/analyze`           | Lab report analysis via Claude (teacher + student modes)  |
| `POST` | `/api/analyze-2ar`       | 2nd year simplified checklist analysis                    |
| `GET`  | `/api/islenskubraut/pdf` | Generate teaching card PDF (`?flokkur={id}&stig={level}`) |

## Project Structure

```
kvenno-app/
├── apps/
│   ├── landing/          # Track selector + chemistry year hubs (React SPA)
│   ├── islenskubraut/    # Icelandic teaching cards (React SPA)
│   ├── lab-reports/      # AI lab report grading (React SPA)
│   └── games/            # 20 chemistry games (single-file HTML, except the 3 Three.js ones)
│       ├── 1-ar/         # 7 games for year 1
│       ├── 2-ar/         # 8 games for year 2
│       └── 3-ar/         # 5 games for year 3
├── packages/
│   └── shared/           # Shared components, hooks, utils, types, i18n
├── server/               # Express backend (TypeScript)
│   ├── src/index.ts      # Entry point (API routes)
│   ├── src/lib/          # PDF generation, Islenskubraut data
│   └── .env.example      # Environment variable template
├── scripts/
│   ├── build-all.mjs     # Orchestrates full build
│   ├── build-games.mjs   # Builds individual/all games
│   └── deploy.sh         # Production deployment via rsync
├── docs/                 # KVENNO-STRUCTURE.md and other docs
└── media/                # Favicons and brand assets
```

### Build output

`pnpm build` produces a `dist/` directory matching the production URL structure:

```
dist/
├── index.html                  # Track selector landing page
├── efnafraedi/
│   ├── index.html              # Chemistry hub
│   ├── 1-ar/
│   │   ├── index.html          # Year 1 hub
│   │   └── games/              # 7 single-file HTML games
│   ├── 2-ar/
│   │   ├── index.html          # Year 2 hub
│   │   ├── games/              # 8 games (3 multi-file: the Three.js ones)
│   │   └── lab-reports/        # Lab reports SPA
│   ├── 3-ar/
│   │   ├── index.html          # Year 3 hub
│   │   ├── games/              # 5 single-file HTML games
│   │   └── lab-reports/        # Lab reports SPA
│   ├── val/index.html          # Elective courses hub
│   └── f-bekkir/index.html     # Social sciences hub
└── islenskubraut/              # Íslenskubraut SPA
    ├── index.html
    └── assets/
```

## Common Tasks

### Check logs on the server

```bash
ssh siggi@kvenno.app
sudo journalctl -u kvenno-backend -f          # Follow live logs
sudo journalctl -u kvenno-backend --since "1 hour ago"
```

### Restart the backend

```bash
ssh siggi@kvenno.app
sudo systemctl restart kvenno-backend
sudo systemctl status kvenno-backend
```

### Run tests

```bash
pnpm test                  # Vitest unit tests + server tests
pnpm test:watch            # Watch mode
pnpm test:e2e              # Playwright end-to-end tests
```

### Lint and type-check

```bash
pnpm check-all             # type-check + lint + format check
pnpm lint:fix              # Auto-fix lint issues
pnpm format                # Format all files with Prettier
```

### Analyze bundle sizes

```bash
pnpm analyze               # Rebuilds lab-reports with ANALYZE=true, prints size tables for dist/
```

## Contributing

Contributions, suggestions, and forks are welcome. This project is designed to be adapted for other schools, curricula, and languages.

- **Bug reports and feature requests:** [Open an issue](https://github.com/SigurdurVilhelmsson/kvenno-app/issues)
- **Code contributions:** Fork the repo, make your changes, and open a pull request
- **Language:** The UI is in Icelandic, but code, comments, and documentation are in English. If you're adapting this for another language, the i18n system in `packages/shared` supports multiple locales

## License

[MIT](LICENSE)

## Status

Actively maintained and in classroom use at Kvennaskólinn í Reykjavík. New games and features are added as the curriculum evolves.

## Related Projects

- [namsbokasafn-vefur](https://github.com/SigurdurVilhelmsson/namsbokasafn-vefur) — Icelandic textbook reader (SvelteKit)
- [namsbokasafn-efni](https://github.com/SigurdurVilhelmsson/namsbokasafn-efni) — Content and translation pipeline for the textbook reader
