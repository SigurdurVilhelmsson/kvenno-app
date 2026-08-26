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
│   └── games/            # 20 chemistry games (single-file HTML, except the 3 Three.js ones)
│       ├── 1-ar/         # 7 games for year 1
│       ├── 2-ar/         # 8 games for year 2
│       └── 3-ar/         # 5 games for year 3
├── packages/
│   └── shared/           # Shared components, hooks, utils, types, i18n
├── server/               # Express backend (Claude AI proxy + PDF generation)
├── scripts/              # Build and deploy scripts
├── content/              # Íslenskubraut content (YAML) — source of truth, hand-edited
├── docs/                 # KVENNO-STRUCTURE.md and other docs
├── media/                # Favicons and brand assets
└── dist/                 # Build output (gitignored)
```

## URL Structure

```
/                                      # Track selector (Efnafræði, Íslenskubraut, ...)
/efnafraedi/                           # Chemistry track hub (year tiles)
/efnafraedi/{1-ar,2-ar,3-ar,val,f-bekkir}/  # Year hubs
/efnafraedi/{1-ar,2-ar,3-ar}/games/    # Games hub (landing SPA — the only link from a year hub to a game)
/efnafraedi/{year}/games/*.html        # Chemistry games
/efnafraedi/{year}/lab-reports/        # Lab reports SPA (2-ar, 3-ar)
/islenskubraut/                        # Íslenskubraut SPA (category grid)
/islenskubraut/spjald/:flokkur         # Teaching card detail page
/auth/callback                         # MSAL redirect target — serves the 2-ar lab-reports build
```

Legacy URLs (`/1-ar`, `/2-ar`, etc.) redirect to `/efnafraedi/...` via nginx.

## Key Commands

```bash
pnpm install              # Install all dependencies
pnpm build                # Build everything: static site → dist/, backend → server/dist/
pnpm dev:landing          # Dev server for landing page
pnpm dev:islenskubraut    # Dev server for íslenskubraut
pnpm dev:lab-reports      # Dev server for lab reports
pnpm dev:games            # Dev servers for all games
pnpm build:games          # Build only games
pnpm build:landing        # Build only landing
pnpm build:islenskubraut  # Build only íslenskubraut
pnpm islenskubraut:build  # Regenerate the Íslenskubraut TS from content/islenskubraut/*.yaml
                          #   — add --check to fail instead of rewrite (CI)
pnpm islenskubraut:export # Write an .xlsx of the content for a reviewer (--out <file>)
pnpm islenskubraut:import # Read a reviewed .xlsx back into the YAML (--dry-run, --force)
pnpm build:lab-reports    # Type-check + build in place (apps/lab-reports/dist, base /lab-reports/)
                          #   — NOT the deployable output; `pnpm build` emits the 2-ar and 3-ar copies
pnpm type-check           # TypeScript check across all packages
pnpm lint                 # ESLint check
pnpm test                 # Run tests
pnpm test:e2e             # Playwright E2E (incl. the Three.js lazy-load guard)
pnpm check-all            # type-check + lint + format:check
                          #   — currently FAILS: format:check reports 166 pre-existing files,
                          #     unrelated to any one change. type-check and lint are clean.
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

- **Header** - Accepts `title` (default: "Námsvefur Kvennó"), `authSlot`, and `onInfoClick` (renders the "Upplýsingar" button only when provided). Also accepts `variant` (`'default' | 'game'`), `activeTrack`, `backHref`, `backLabel`, `gameTitle`. The default variant renders Efnafræði/Íslenskubraut track tabs (`Header.tsx:14-22`); there is **no** "Kennarar" button — it was removed, and `Header.test.tsx:32-36` asserts its absence.
- **Breadcrumbs** - "Heim > [Track] > [Section] > [Page]" navigation
- **Footer** - Copyright notice. Accepts optional `department` prop (e.g., "Efnafræðideild") and an optional `subtitle` prop for a second line below the copyright.

Game-specific shared components (gamification chrome stripped from all Y2/Y3 games, April 2026):

- **HintSystem** - Tiered progressive hints
- **FeedbackPanel** - Detailed answer feedback
- **InteractiveGraph** - Canvas-based graph with cubic spline interpolation, gradient fills
- **ParticleSimulation** - Physics-based particle visualization with sphere shading, motion trails, speed glow, collision flash
- **AnimatedMolecule** - Ball-and-stick molecular structure renderer
- **DragDropBuilder** - Flexible drag-and-drop interface

Design primitives also exported from the barrel, undocumented above: `Card`, `Button`, `Container`,
`Badge`, `PageBackground`, `SkipLink`, `BottomNav`, `ErrorBoundary`, `Presence`/`FadePresence`
(from `./Transition`), `ResponsiveContainer`, `MoleculeViewer` (2D), `LanguageSwitcher`.
`MoleculeViewer3D` is imported from `@shared/components/MoleculeViewer3D`, deliberately not the barrel.

**Removed (Aug 2026):** `ParticleCelebration`/`useParticleCelebration`, `AnimatedBackground`, and
`SoundToggle`/`useGameSounds` were deleted from `packages/shared/`. The April 2026 restructure
stripped them from every game, leaving zero importers. Don't reintroduce celebration, animated
background, or sound chrome into games without a pedagogical reason.

Shared styles (`packages/shared/styles/`):

- **theme.css** - Tailwind v4 `@theme` tokens: colors, typography, shadows, spring easing curves, glassmorphism tokens, 17 animation keyframes (13 exposed as `--animate-*` utility tokens)
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
│   │   └── games/*.html               # Self-contained games (~290-400 KB each)
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

Plus `server/dist/` — the compiled Express backend, emitted outside `dist/` by `pnpm build`
(`scripts/build-all.mjs` step 4b). `scripts/deploy.sh` refuses to deploy without it.

## Server API Endpoints

Express backend at `server/` (port 8000):

- `POST /api/process-document` — DOCX → PDF conversion (LibreOffice)
- `POST /api/analyze` — Lab report analysis via Claude API
- `POST /api/analyze-2ar` — 2nd year simplified checklist analysis
- `GET /api/islenskubraut/pdf?flokkur={id}&stig={level}` — Generate teaching card PDF
- `GET /health` — Health check

## Game Design Philosophy (April 2026 restructure)

Games follow a **teach-before-test** structure:

1. **Explore** — Interactive discovery (no right/wrong)
2. **Understand** — Guided explanation connecting observation to chemistry
3. **Practice** — Scaffolded problem-solving with method support
4. **Apply** — Independent problems with feedback

**No scoring, timers, or streaks during learning phases.** Hint usage is never penalized.

Gold standard games: Jafna Jöfnur (real-time atom counter), IMF Level 3 (real-world scenarios), Redox Level 3 (scaffolded half-reactions), Buffer Level 1 (visual ratio builder).

### Restructure status (April 2026)

**mighty-mixing-puffin plan — all phases completed:**

- Phase 1: Teaching intros added to all games that tested before teaching (Y1-Y3)
- Phase 2: Hint penalties removed from Y1 **code**, DA L2 prediction disabled, DA L3 scoring simplified. **This line used to claim "all", and used to claim Y1 was clean in "code + UI text" — both measured false.** **Finished 2026-08-26 across all four stragglers**, so no game now charges for a hint: `1-ar/dimensional-analysis` (two phantom strings), `3-ar/gas-law-challenge` (a phantom string, never rendered), `2-ar/hess-law` (a **real** penalty, 20 unaided against 10, now a flat 20), and `3-ar/ph-titration` — where the recorded claim that all three levels "apply a multiplier" held for **Level 1 only**: L2 and L3 awarded a flat 100 and 20 while _displaying_ "(50 stig)" and "(10 stig)", so they were phantom. L1's was real, via the shared `HintSystem` tier multiplier (1.0/0.8/0.6/0.4/0.4), and is now a flat 100. Each of the four carries a test that fails if the penalty returns
- Phase 3-4: Real-world "Af hverju?" context cards + curriculum chain positions added to all 20 games
- Phase 5a: Jafna Jöfnur reload fix + L3 hints, Nafnakerfid L3 explanations
- Phase 5b: Lewis Structures L2 interactive SVG drawing canvas, VSEPR L2 constrained prediction + L3 hybridization diagram, pH Titration L2 equivalence point marking, Lausnir L1 static beaker

Full plan: `~/.claude/plans/mighty-mixing-puffin.md`

**logical-wandering-llama iterative review cycle:**

- **Y1 (7 games):** Iterations 1-4 complete (Apr 2026). Tracker: `apps/games/1-ar/REVIEW_TRACKER.md`.
- **Y2 (8 games):** Iterations 1-5 complete (Apr 2026). Zero FAIL ratings at iter 5. Tracker: `apps/games/2-ar/REVIEW_TRACKER.md`.
- **Y3 (5 games):** Iterations 1-4 complete + cross-iter design work (Apr 2026). Gas Law P3 restructured into 3 curriculum-ordered levels. Tracker: `apps/games/3-ar/REVIEW_TRACKER.md`.

**Shared-component accessibility additions (Apr 2026):**

- `@shared/components/MoleculeViewer3D` is keyboard-accessible: arrow keys rotate (±5°), `+`/`−` zoom, `R` resets. The outer `<div>` is focusable with `role="application"` and an Icelandic aria-label. Used by VSEPR, IMF, Lewis.
- `@shared/components/DragDropBuilder` supports touch drag-and-drop: `onTouchMove` previews the zone under the finger via `document.elementFromPoint`, `onTouchEnd` commits through the same pipeline as mouse drops. Used by Organic Nomenclature (Y2 L2) and Dimensional Analysis (Y1 L2).

**Deferred-work pass (Apr 2026, commit `6e26c0c`):** shipped 4 of 8 items.

- ✅ Gas Law `App.tsx` extraction — 1022 → 279 lines; new `MenuScreen`/`GameScreen`/`FeedbackScreen` under `apps/games/3-ar/gas-law-challenge/src/components/`
- ✅ pH Titration `TitrationCurve` responsive — ResizeObserver in `TitrationCurve.tsx`, shrinks to container width
- ✅ Organic L2 branched molecules — 3 new entries (2-metýlprópan, 2-metýlbútan, 3-metýlpentan) with explicit positions via extended `organicConverter.ts`; drag-drop auto-disables when branched
- ✅ Buffer L2/L3 `BufferCapacityVisualization` — wired into completion explanation screens in both levels

**Three.js code-split (Aug 2026):** VSEPR, Lewis, and IMF now load ~380–400 KB up front instead
of ~2.9 MB. See the drei follow-up below for the deferred payload's final size.

Two causes, both needed fixing — the earlier diagnosis blamed only the second:

1. `packages/shared/components/MoleculeViewer3D/index.ts` statically re-exported the eager
   `MoleculeViewer3D` from the same barrel games import `MoleculeViewer3DLazy` from. That static
   edge put Three.js in the entry chunk and silently defeated the lazy boundary (Rollup's only
   signal was an `INEFFECTIVE_DYNAMIC_IMPORT` warning). Removing it is what actually splits the bundle.
2. `vite-plugin-singlefile` re-inlines dynamic chunks, so step 1 buys nothing while it is on.
   `createGameViteConfig` now takes `singleFile` (default `true`); those three games pass `false`.

Consequences: the three games are no longer single portable files — each is `{game}.html` +
`{game}.js` + `{game}.css` + `assets/{game}/*.js`. The entry script sits beside the HTML, not under
`assets/` (`apps/games/shared-vite-config.ts:63-64`); copying only the HTML and CSS ships a game
that cannot boot. nginx needed no location change (its `.js` location already precedes the
games-HTML block) — but note `{game}.js`/`{game}.css` are **unhashed** and fall into that location's
`expires 1y; Cache-Control "public, immutable"` block (`server/nginx-site.conf:49-51`); only the
deferred chunks under `assets/{game}/` are content-hashed. A redeploy of these three games can
therefore serve a returning visitor a year-cached stale entry bundle. (Inferred from the config plus
the emitted filenames; not tested against the production cache.) `scripts/build-games.mjs` clears `assets/<game>/` before each build, since
`emptyOutDir: false` would otherwise accumulate stale hashed chunks.
`e2e/threejs-lazy-loading.spec.ts` guards the boundary — verified to fail when cause 1 is reintroduced.

**drei barrel follow-up (Aug 2026):** deferred payload halved again, 2601 KB → 1004 KB per game.

The cause was not the `import { OrbitControls, Text, Html } from '@react-three/drei'` in
`MoleculeViewer3D.tsx` — that import is fine and tree-shakes correctly. It was
`MoleculeViewer3DLazy`'s dependency probe doing `await import('@react-three/drei')`, which pulled
the whole barrel (1.6 MB, incl. `hls.js` and `@mediapipe/tasks-vision`) into the graph purely to
test that it resolved. Removing that one line is the entire saving.

Deep drei imports were measured as an alternative and are **not needed** — byte-identical result.
Avoid them: drei ships no `exports` map, so paths like `web/Html` vs `core/Html` are unguaranteed
across upgrades.

The probe itself was kept (it costs ~13 KB). Without it a failed chunk leaves the Suspense fallback
spinning silently: `React.lazy` rejections don't reach Suspense, and the games' only `ErrorBoundary`
wraps the whole `App`, so an uncaught throw blanks the entire game instead of one panel. Its
messages are now Icelandic — note `Sæki`, not `Hleð`, since `hleðsla` means electric charge here.

Remaining deferred (all need a decision, not code):

- **`useGameI18n` `t()` — 7 of 20 games are switcher-only.** All 20 import the hook and render `LanguageSwitcher`; seven have zero `t()` calls of any form and serve hardcoded Icelandic — three Y3 (`gas-law-challenge`, `buffer-recipe-creator`, `thermodynamics-predictor`) and four Y2 (`kinetics`, `lewis-structures`, `organic-nomenclature`, `intermolecular-forces`). Two more are zero in all but name: `ph-titration` and `rafeindabygging` have exactly one call each (`ph-titration`'s is a template literal with a hardcoded Icelandic fallback, `src/components/Level3.tsx:104`, which a `t('` grep misses). `equilibrium-shifter` is partial at 7, so this is not "all of Y3". Per-game counts: `docs/i18n-coverage.md` — the authority; every old-repo game carries the same dead wiring. Conflicts with this file's "Icelandic UI only." Decide: strip it, finish wiring, or keep as-is.
- **Hess Polish i18n block** — teacher sign-off. Same decision as above.
- **Kinetics/Redox problem order shuffle** — deliberately skipped (exam-style stability). **Do not generalise this to other games:** several ship an unshuffled array where the answer is positionally predictable, which is a different problem. See `docs/README.md`.
- **Level 4, and whether levels are gated** — the old repo's design capped games at 3 levels; the April restructure replaced that with Explore → Understand → Practice → Apply, which has no level count. Most salvageable content from the old repo is Level-4 material. Decide once whether a Level 4 exists or that content becomes the Apply phase. Gating strings for 15 games already exist in three languages with no consumers — 14 under `menu.levels.*.locked`, plus `1-ar/nafnakerfid` under `completeLevel1First`/`completeLevel2First` (`src/i18n.ts:23-24`). Grep both key names before wiring or stripping.

Full plan: `~/.claude/plans/logical-wandering-llama.md`

### Game inventory

**Year 1:** dimensional-analysis, lotukerfid, nafnakerfid, molmassi, jafna-jofnur, takmarkandi, lausnir
**Year 2:** hess-law, kinetics, lewis-structures, vsepr-geometry, intermolecular-forces, organic-nomenclature, redox-reactions, rafeindabygging
**Year 3:** ph-titration, gas-law-challenge, equilibrium-shifter, thermodynamics-predictor, buffer-recipe-creator

### Curriculum chains

```
Y1: Einingagreining → Lotukerfið → Nafnakerfið → Mólmassi → Jafna Jöfnur → Takmarkandi → Lausnir
Y2: Rafeindabygging → Lewis → VSEPR → IMF → Hess → Kinetics → Redox → Organic
Y3: Gaslögmál → Jafnvægi → Varmafræði → pH Títrun → Púfferar
```

## Development Guidelines

### Adding a new game

1. Create `apps/games/[year]/[game-name]/` following existing game pattern
2. Add entry to `scripts/build-games.mjs` games array
3. Add a game card to `yearGamesConfigs` in `apps/landing/src/pages/GamesHub.tsx` (title, description, and `slug` matching the build-games.mjs output name). **Not `YearHub.tsx`** — that file holds only the three aggregate "Leikir og æfingar" links, so editing it leaves the new game unreachable.
4. Update the `Námsleiðin` chain string in every sibling game's `App.tsx` for that year (`src/components/MenuScreen.tsx` for gas-law-challenge)

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

### Íslenskubraut content

**Edit `content/islenskubraut/*.yaml` only.** Those six files are the source of truth. Both
TypeScript copies are generated from them and must never be hand-edited. The editing workflow —
directly, or by spreadsheet — is written up for a human in
[`content/islenskubraut/README.md`](content/islenskubraut/README.md); what follows is the
architecture behind it.

```bash
pnpm islenskubraut:build           # regenerate both consumers from the YAML
pnpm islenskubraut:build --check   # exit 1 if either is stale (CI-friendly)
```

- `content/islenskubraut/{dyr,matur,farartaeki,manneskja,stadir,klaednadur}.yaml` — source of truth,
  hand-edited, plain YAML a teacher can read without knowing TypeScript
- `apps/islenskubraut/src/data/categories/*.ts` — **generated; never edit by hand**
- `server/src/lib/islenskubraut-data.ts` — **generated; never edit by hand**. The Express server
  renders the teaching-card PDFs and must not import the Vite/React app, which is why a second copy
  exists at all
- `server/src/index.ts` validates the `flokkur` query param against the generated `categoryIds`
  export, so the PDF route cannot 400 on a category that exists

Both generated files open with an `AUTO-GENERATED FILE — DO NOT EDIT BY HAND` header naming the
source directory and the regenerate command.

**Adding a category is a three-file edit**, not one. There is no way around this today:

1. `content/islenskubraut/<id>.yaml` — the content
2. `CATEGORY_ORDER` in `scripts/islenskubraut/load.mjs` — the taught order, deliberately not
   alphabetical
3. `apps/islenskubraut/src/data/index.ts` — still hand-maintained, one import plus one array entry

Omitting step 2 or 3 is caught by the test suite, but as a whole-tree deep-equality failure that
does not say "you forgot to register the new category." `index.ts` was left hand-maintained on
purpose (it is the file every component imports); generating it is a clean follow-up, not a
prerequisite for anything.

**What guards the content:**

- `scripts/islenskubraut/load.mjs` validates every string on load and refuses to generate from bad
  input: empty strings, invisible characters (soft hyphen, zero-width space, BOM and friends), and
  ASCII-flattened Icelandic
- `scripts/islenskubraut/__tests__/generated-matches-yaml.test.ts` — the generated modules agree
  with each other and still ship all six categories in taught order
- `apps/islenskubraut/src/data/__tests__/server-copy-in-sync.test.ts` — the two generated copies
  stay byte-identical in content and expose the same category ids

**Why this exists.** Until Aug 2026 the two copies were hand-mirrored and had drifted for months.
The server copy — the one students actually read on the printed card — had lost every Icelandic
character in places (`Orðaforði` → `Orda­fordi`, with a U+00AD soft hyphen wedged mid-word,
invisible in an editor), rendered `Þessi` as `Þssi`, and taught `rannsóka` and `Undirbuníngur`,
neither of which is a word. The client copy had its own defect the server did not: `stuttt` at 14
sites. A `// Auto-generated` header claimed a generator that did not exist, which is precisely why
nobody re-derived the file. The deeper cause was that the content lived in nested TypeScript object
literals no Icelandic teacher could read, let alone proofread — which is what moving to YAML fixes.

**Excel round-trip (Aug 2026), so a reviewer who does not use git can proofread the content in a
spreadsheet:**

```bash
pnpm islenskubraut:export                  # islenskubraut-yfirlestur-<date>.xlsx (--out overrides)
pnpm islenskubraut:import <file> --dry-run # preview: per-category diff, writes nothing
pnpm islenskubraut:import <file>           # rewrite the YAML, then run islenskubraut:build
```

The workbook is a Leiðbeiningar tab, one sheet per category, and a hidden `_meta` sheet carrying a
sha256 per YAML file — import refuses a workbook exported before a later repo edit unless you pass
`--force`, and refuses the whole run rather than writing the categories that were still current. The
default export path is gitignored. Reviewer comments in the `athugasemd` column are collected into
`content/islenskubraut/_athugasemdir-YYYY-MM.md` for the PR; they never enter the content.

Import refuses, rather than repairs, anything it cannot read as text: a cell Excel coerced to a date
or formula, and a row carrying text with no `lykill`. It strips invisible characters and NFC-
normalises silently but reports every one. `scripts/islenskubraut/rows.mjs` (row mapping) and
`review.mjs` (sheet → rows, category → YAML) are the pure halves both commands share.

**UNFINISHED, blocking the first real review cycle:** every reviewer-facing Icelandic string in
the workbook — the instruction block, the six column headers, the six column cell notes and the
Leiðbeiningar tab — is placeholder wording drafted by Claude and never reviewed. It is marked
`PLACEHOLDER ICELANDIC` in `scripts/islenskubraut/export-xlsx.mjs`. **Do not send an export to a
colleague until Siggi has rewritten it.** The instructions tell a reviewer how to add, delete and
reorder rows, so misleading wording produces a workbook the importer then refuses. Tracked in the
plan's "Unfinished — required before the first real review cycle" section, along with the fact that
nobody has yet opened an exported workbook in real Excel.

### Deployment

```bash
pnpm build                 # Build everything
./scripts/deploy.sh        # rsync to server + restart backend
```

## Before changing a game, read `docs/README.md`

Three August-2026 review documents supersede the older per-game reviews and the year `REVIEW_TRACKER.md` files. They carry `file:line` citations and were adversarially verified:
`apps/games/1-ar/CURRICULUM_REVIEW.md` · `apps/games/ORPHANED_GAMES_ASSESSMENT.md` · `docs/FEBRUARY-DECISIONS-RECOVERED.md`

**Fixed by Phase 1 (2026-08-18)** — ph-titration's `/1000`, lotukerfið's neutron rule, the
dimensional-analysis speed-of-light key, and rafeindabygging's constant answer index.
**Fixed by Phase 1b (2026-08-18)** — B3 (Lausnir gas solubility), B8 (Takmarkandi generator), B6
(impossible molarities). Each has a test. Do not re-report any of these as live; details are in
`docs/README.md`.
**Fixed 2026-08-26** — the dimensional-analysis phantom hint penalty, in **both** places it was
advertised. The recorded fix ("deleting `:593-595` is the whole fix") was one short: the hint
_button_ said `(kostar 15% af einkunn)` as well, a second phantom penalty that disagreed with the
first. Guarded by `1-ar/dimensional-analysis/src/__tests__/hint-cost.test.ts`.

**Fixed 2026-08-26** — Lausnir's weighing premise. Each chemical now declares a `form`, and the two problem types that say "Þú leysir …" draw only solids that can be weighed out. The liquids and the one gas keep their dilution, mixing and massFromMolarity problems, which is where diluting concentrated acid from stock belongs. **The recorded note was right about the seven substances and wrong about the masses:** only `Ca(OH)₂` reached milligrams (16 mg floor, against a 0.81 g ceiling set by its 0.022 M saturation); `K₂Cr₂O₇` bottomed out at 1.44 g, comfortably weighable. Guarded by `1-ar/lausnir/src/__tests__/weighable-substances.test.ts`.

**`K₂Cr₂O₇` removed from lausnir 2026-08-26**, on Siggi's call — the pool is now 20 chemicals. Not a numbers defect: Cr(VI) is a category-1 carcinogen many Icelandic schools no longer stock, and lausnir is the one place a student is told to weigh it out and dissolve it. It is deliberately **kept** in `1-ar/nafnakerfid` (naming `Kalíumdíkrómat`) and `2-ar/redox-reactions` (the oxidation number of Cr in `Cr₂O₇²⁻`), which are paper exercises needing no bottle on the shelf. The test asserts it does not return.

**Live defects students meet today** — fix before adding features:

- Unshuffled option arrays in `2-ar/kinetics` Level 3 (6/6 first) and `2-ar/organic-nomenclature` Level 3 (6/10 first). Four other games look constant in the data but shuffle at render — see `docs/README.md` before "fixing" them
- Four Tier-0 correctness items still open: B4 (Mólmassi breakdowns that do not sum), B5 (wrong compound names), B12 (non-reduced coefficients accepted), B13 (absolute 0.01 tolerance). Listed in `docs/plans/2026-08-16-phase-1-correctness.md`
- **`lausnir` calls anhydrous Na₂CO₃ (106 g/mol) `þvottasódi`** while `molmassi` gives that name's referent, Na₂CO₃·10H₂O, a molar mass of 286.141 — one platform, one word, two substances. Related to B5, which already rules on this compound's name

The former "`challenges.ts:354` is unsatisfiable" claim was retired Aug 2026 by executing `Level3`'s grading path — see `docs/README.md`. Do not reinstate it.

The current work order for these lives in `docs/plans/2026-08-16-games-roadmap.md`.

## Icelandic terminology is governed, not chosen per-game

`packages/shared/i18n/ordabok.md` is the authority — it was moved into the shared library deliberately. When a term is disputed, resolve in this order:

1. `packages/shared/i18n/ordabok.md`
2. `~/dev/repos/namsbokasafn-efni`, the school's textbook corpus (`grep -roi "<stem>[a-uáéíóúýþæö]*" --include=*.md . | wc -l`)
3. Ask Siggi — only where both are silent or they disagree

Already ruled, and still wrong in this repo (each parenthetical names what is actually shipping, measured 2026-08-17):

- **`sætistala`** for atomic number — shipping as `atómnúmer` (4 files) and `raðtala` (2 files); `sætistala` has zero hits
- **`vermi`** for enthalpy — shipping as `skammtavarmi`, 6 lines in 5 files (`2-ar/hess-law`: `App.tsx:190`, `i18n.ts:15`, `components/Level1.tsx:23,289`, `data/challenges.ts:27`; `3-ar/thermodynamics-predictor/src/i18n.ts:38`). `Enþalpía` has zero hits here — it is an old-repo `calorimetry` coinage; do not import it if that game is ported
- **`sjálfgengur`/`sjálfgengt`** for spontaneous — shipping as `Sjálfspyrjandi` and `sjálfviljug*`, both in `3-ar/thermodynamics-predictor` (one game, two wrong words). `sjálfvirkur` has zero hits; do not grep for it
- **`katóða`** for cathode — shipping as `kaþóða` (4 occurrences, `2-ar/redox-reactions/src/components/ElectrochemicalCell.tsx`); `katóða` has zero hits. **`anóða`** is already correct in that file, so only the cathode half needs fixing
- **`stuðpúði`** (not `púffer`) — `púffer*` still ships in 7 files

Decided in advance, with nothing yet to correct: the Ksp family (`leysnimargfeldi`, `samjónahrif`, `mólarleysni`, `hlutfelling`). Solubility equilibria are absent platform-wide — all four return zero real hits (roadmap Phase 5). Use these terms when the content lands; do not coin new ones.

Full table with citations in `docs/FEBRUARY-DECISIONS-RECOVERED.md`.

Do not invent Icelandic chemistry terms. A game written in April 2026 re-committed an error that had been fixed in February, because nothing enforces the glossary.

## Important Notes

- **Icelandic UI:** All user-facing text must be in Icelandic
- **KVENNO-STRUCTURE.md:** The master design document lives at `docs/KVENNO-STRUCTURE.md`
- **Most games build to single HTML files** via `vite-plugin-singlefile` (~290-400 KB each). The three
  Three.js games (VSEPR, Lewis, IMF) opt out via `singleFile: false` and emit `{game}.html` +
  `{game}.js` + `{game}.css` + `assets/{game}/*.js`, which must be deployed together — the entry
  `{game}.js` sits beside the HTML, not under `assets/`. See `docs/bundle-sizes.md`.
- **Lab reports need 2 builds:** One for `/efnafraedi/2-ar/lab-reports/` and one for `/efnafraedi/3-ar/lab-reports/`
- **Server needs system deps:** `pandoc` and `libreoffice` for .docx processing
- **API key security:** Claude API key lives in `server/.env` (never committed), proxied through Express backend
- **Legacy redirects:** Old root-level chemistry URLs (`/1-ar`, `/2-ar`, etc.) redirect to `/efnafraedi/...` via nginx
