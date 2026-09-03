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
│   └── games/            # 21 chemistry games (single-file HTML, except the 3 Three.js ones)
│       ├── 1-ar/         # 8 games for year 1
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
- **FeedbackPanel** - Detailed answer feedback. The "Af hverju?" explanation **opens expanded**
  (Aug 2026); pass `config={{ defaultExpanded: false }}` only where the same text is already visible
  elsewhere on screen. The `misconception` slot renders _outside_ the collapse, so it is the one
  thing a student who reads nothing else still sees — populate it where you can diagnose the
  student's actual answer, and leave it undefined where you cannot
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

Gold standard games: Stilla efnajöfnur (real-time atom counter), IMF Level 3 (real-world scenarios), Redox Level 3 (scaffolded half-reactions), Buffer Level 1 (visual ratio builder).

### Restructure status (April 2026)

**mighty-mixing-puffin plan — all phases completed:**

- Phase 1: Teaching intros added to all games that tested before teaching (Y1-Y3)
- Phase 2: Hint penalties removed from Y1 **code**, DA L2 prediction disabled, DA L3 scoring simplified. **This line used to claim "all", and used to claim Y1 was clean in "code + UI text" — both measured false.** **Finished 2026-08-26 across all four stragglers**, so no game now charges for a hint: `1-ar/dimensional-analysis` (two phantom strings), `3-ar/gas-law-challenge` (a phantom string, never rendered), `2-ar/hess-law` (a **real** penalty, 20 unaided against 10, now a flat 20), and `3-ar/ph-titration` — where the recorded claim that all three levels "apply a multiplier" held for **Level 1 only**: L2 and L3 awarded a flat 100 and 20 while _displaying_ "(50 stig)" and "(10 stig)", so they were phantom. L1's was real, via the shared `HintSystem` tier multiplier (1.0/0.8/0.6/0.4/0.4), and is now a flat 100. Each of the four carries a test that fails if the penalty returns
- Phase 3-4: Real-world "Af hverju?" context cards + curriculum chain positions added to all 20 games
- Phase 5a: Stilla efnajöfnur reload fix + L3 hints, Nafnakerfid L3 explanations
- Phase 5b: Lewis Structures L2 interactive SVG drawing canvas, VSEPR L2 constrained prediction + L3 hybridization diagram, pH Titration L2 equivalence point marking, Lausnir L1 static beaker

Plan file: `mighty-mixing-puffin.md` — the April 2026 restructure, phases 1 through 5b. **Lost; see below.**

> **This file is lost. The summary above is the entire surviving record of this work.** Searched
> exhaustively 2026-08-27, after 2026-08-26 had already found it missing from this checkout. It is
> absent from `git log --all` and from every remote branch; from the file trees of all seven active
> GitHub repos; from this machine, from the Windows profile beside it, and from the production
> server; and `~/.claude/plans/`, the directory this file used to cite, does not exist on any of
> them. All 48 hits across the Claude session transcripts and file-history are _references to the
> path_ — never the content. No session on any machine here ever read or wrote it.
>
> Both plan names are cloud-session names, so the one place left to look is Siggi's own session
> history on claude.ai; nobody else can reach it. **The earlier instruction to "commit it into
> `docs/plans/` from the machine that has it" is retired — no such machine exists.** Do not cite
> this file as a source. When you learn something about this work, extend the summary above; that
> is now the primary record, not a stand-in for one.

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

- **`useGameI18n` `t()` — 7 of 20 games are switcher-only.** Those 20 all import the hook and render `LanguageSwitcher`; `1-ar/einingakedjan` (Aug 2026) is the one game that does neither, deliberately — it ships hardcoded Icelandic so it does not add a 21st case to this undecided question. The rest of this entry is unchanged and counts only the original 20: seven have zero `t()` calls of any form and serve hardcoded Icelandic — three Y3 (`gas-law-challenge`, `buffer-recipe-creator`, `thermodynamics-predictor`) and four Y2 (`kinetics`, `lewis-structures`, `organic-nomenclature`, `intermolecular-forces`). Two more are zero in all but name: `ph-titration` and `rafeindabygging` have exactly one call each (`ph-titration`'s is a template literal with a hardcoded Icelandic fallback, `src/components/Level3.tsx:104`, which a `t('` grep misses). `equilibrium-shifter` is partial at 7, so this is not "all of Y3". Per-game counts: `docs/i18n-coverage.md` — the authority; every old-repo game carries the same dead wiring. Conflicts with this file's "Icelandic UI only." Decide: strip it, finish wiring, or keep as-is.
- **Hess Polish i18n block** — teacher sign-off. Same decision as above.
- **Kinetics/Redox problem order shuffle** — deliberately skipped (exam-style stability). **Do not generalise this to other games:** several ship an unshuffled array where the answer is positionally predictable, which is a different problem. See `docs/README.md`.
- **Level 4, and whether levels are gated — SETTLED 2026-08-29, Siggi's ruling: levels are not gated, and there is no Level 4.** The dead gating vocabulary was stripped the same day: 93 strings across 16 files — 84 `locked:` in 14 game `i18n.ts` files (2 levels × 3 languages each), 6 `completeLevel1First`/`completeLevel2First` in `1-ar/nafnakerfid`, and 3 `common.locked` in `packages/shared/hooks/useGameI18n.ts`, which no prior note mentioned. Zero consumers before removal, verified. **The earlier note said the keys sat under `menu.levels.*.locked`; they were at top-level `levels.*.locked`** — grep `locked:` rather than a path if this ever recurs. Level-4 material from the old repo becomes **Apply-phase** content, not a fourth level. **Not covered by this ruling and deliberately left:** `3-ar/equilibrium-shifter/src/App.tsx:419-421` gates _Keppnishamur_, a timed and scored challenge mode, behind 5 completed problems. That is a mode gate, not a level gate, and it is live rather than dead — it needs its own ruling.

Plan file: `logical-wandering-llama.md` — the Y1/Y2/Y3 iterative review cycle. **Lost; see below.**

> **This file is lost, exactly as `mighty-mixing-puffin.md` is** — see the search record under the
> April 2026 restructure above (2026-08-27: absent from git, from GitHub, from every machine here,
> and from `~/.claude/plans/`, which does not exist). The summary above is the entire surviving
> record of the review cycle. Do not cite this file as a source; extend the summary instead.

### Game inventory

**Year 1:** dimensional-analysis, lotukerfid, nafnakerfid, molmassi, jafna-jofnur, takmarkandi, lausnir, einingakedjan
**Year 2:** hess-law, kinetics, lewis-structures, vsepr-geometry, intermolecular-forces, organic-nomenclature, redox-reactions, rafeindabygging
**Year 3:** ph-titration, gas-law-challenge, equilibrium-shifter, syrufastinn, thermodynamics-predictor, buffer-recipe-creator

### Curriculum chains

```
Y1: Einingagreining → Lotukerfið → Nafnakerfið → Mólmassi → Stilla efnajöfnur → Takmarkandi → Lausnir → Einingakeðjan
Y2: Rafeindabygging → Lewis → VSEPR → IMF → Hess → Kinetics → Redox → Organic
Y3: Gaslögmál → Jafnvægi → Sýrufastinn → Varmafræði → pH Títrun → Stuðpúðar
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

**Fixed 2026-08-26 — the last two Tier-0 items, B5 and B12; the correctness list is now empty.**

- **B5, wrong compound names.** `nafnakerfid`: P₄O₁₀ `Fosfordekoxíð` → `Tetrafosfórdekoxíð`, Co(NO₃)₂ `Kóbolt` → `Kóbalt`, Fe₃O₄ `Járnoxíð (blandað)` → `Járn(II,III)oxíð`, PCl₅ `Fosfor-` → `Fosfór-`, and `naming.ts:25`'s non-word sulfur root `brennisteinið` → `súlfíð`. `molmassi`: `Natrímhýdroxíð` → `Natríumhýdroxíð`, `Vatnaglas hýdrat` → `Þvottasódi` (vatnsgler is sodium _silicate_), and the three remaining hydrates now carry their water count. Fe₃O₄'s old name **doubled as Level 3's filter flag** (`Level3.tsx:102` matched `(blandað)`), so compounds now declare `excludeFromNameBuilder` instead. The `þvottasódi` collision is resolved with it: `lausnir`'s anhydrous Na₂CO₃ (106 g/mol) is `Na₂CO₃ (natríumkarbónat)`, leaving the word for the decahydrate alone. Guarded by `compound-names.test.ts` in both games — the molmassi one reads lausnir's source, so the collision cannot come back.
- **B12, non-reduced coefficients.** `checkBalance` returns `isReduced` next to `isBalanced` and the level requires both, so `4H₂ + 2O₂ → 4H₂O` is no longer correct. The review's finding was that the convention is never checked **or mentioned**, so the instructions now state it and balanced-but-unreduced gets its own feedback instead of a bare "Rangt". Guarded by `1-ar/jafna-jofnur/src/__tests__/balance-checker.test.ts` — this game's **first** tests, which is how B12 survived four review iterations; it also verifies all 20 answer keys are balanced and reduced.
- **B4 and B13 were fixed earlier the same day** (PR #30), each with a test: `molmassi` derives every molar mass from `elements.ts` so a breakdown cannot disagree with its own total, and `dimensional-analysis` grades on a 1% relative tolerance through `src/utils/grading.ts`, which also reads the Icelandic decimal comma.

**Fixed 2026-08-26 — Nafnakerfið's Level 3 name builder.** 33 of the 51 compounds in its pool could not be assembled from the parts it offered, so they could never be marked correct — roughly six unanswerable questions per ten-question run. The parts were improvised from element symbols and could not express a Roman numeral, a polyatomic ion, six of the metals, or an elided prefix. `src/data/naming.ts` now declares the naming vocabulary and `segmentName` decomposes a name back into it, so the parts come from the name itself; `src/utils/nameParts.ts` holds the tray and pool logic. Fe₃O₄ returned to the pool (52 of 59; the seven excluded are the trivial names and bare elements). Three tests guard it, all verified to fail against the old builder — `name-builder`, `name-parts`, and `level3-answerable.test.tsx`, which renders the component and plays five full runs to a perfect score. **When adding a compound**, if its name needs a morpheme that is not declared, `name-builder.test.ts` fails and names it.

**Fixed 2026-08-26 — the two unshuffled option arrays.** `2-ar/kinetics` L3 put the correct option first in all 6 challenges, `2-ar/organic-nomenclature` L3 in 6 of 10; both now shuffle in a `useMemo` keyed on the challenge index, the idiom four other levels already used including kinetics' own L1. Kinetics' option `id`s double as the visible letters, so the shuffle reassigns them a/b/c/d by position — and `checkAnswer` therefore had to move to `shuffledOptions`, since the clicked id no longer identifies the same entry in the original array. An `option-order.test.tsx` in each game plays every challenge twice over; both fail against no shuffle, and the kinetics one also against that half-done fix. **Four other games still look constant in the data but shuffle at render — see `docs/README.md` before "fixing" a fifth.**

**mol↔L landed 2026-08-27, in `1-ar/molmassi`** — the gap Phase 3 found and then mis-filed as
Year-3 material. Level 2 asks it in both directions and the intro teaches it as a **fourth** key
relationship beside mass↔mól and mól↔eindir.

- The constant is **22,4 L/mól at STP, and STP is 273,15 K and 1 atm.** The school's textbook states
  it, notes that IUPAC moved standard pressure to 1 bar in 1982, and then says plainly it keeps the
  older definition. At 1 bar it is 22,7, so the conditions are printed with every question and a
  test asserts they never separate from the number. Term: `staðalmólrúmmál`.
- **`compounds.ts` now declares a `state` at STP on every compound** (`'gas' | 'vökvi' | 'fast'`),
  and the molar-volume question draws only gases. Without it the question would ask what volume a
  mole of table salt occupies — the same class of defect as `lausnir` asking a student to weigh out
  a gas. `state` describes the substance **as this game names it**, which is why `H₂O` is `vökvi`.
- **Open, and Siggi's call:** `molmassi` names `HCl` **`Saltsýra`**, which is HCl(aq) — a solution,
  with no molar volume — while quoting 36,46 g/mol, the molar mass of the compound. HCl is excluded
  from molar-volume questions rather than renamed, because the compound is `vetnisklóríð` and that
  is a naming ruling, not a molar-volume one. See `apps/games/1-ar/molmassi/HARVEST.md`.

**Phase 3 of the games roadmap landed 2026-08-27** — the harvest out of the frozen
`namsbokasafn-leikir`. All four rows, each with a `HARVEST.md` beside the game it touched:
25 real-world scenarios into `1-ar/dimensional-analysis`, periodic trends into `1-ar/lotukerfid`
(a fourth question type in Level 2), the subscript conversion and the superscript parser into
`1-ar/molmassi`, and the cooling direction into `1-ar/lausnir`.

**Two of the four roadmap rows had false premises**, and this is where the correction lives:
`saturation.ts`'s curves were **already shipped, digit for digit**, plus two gases the old file
never had — there was nothing to swap; and `avogadro.ts`'s g↔mol and mol↔particles already
shipped too, while **mol↔L is in neither harvested file**. That gap is real, and it is a **Year-1**
gap — Siggi's correction, 2026-08-27, replacing this file's earlier claim that it belonged with the
Year-3 gas laws, which was inferred from where the platform mentioned molar volume rather than from
the course. It is now taught in `1-ar/molmassi`. `conversionChains.ts` was deliberately not ported: `1-ar/einingakedjan` is
that file as a game, with species-tagged ratios.

**Checking harvested data against the shipped graders found four defects in shipped code**, listed
in `docs/README.md`. The largest: `molmassi` printed `× 10²³` at students and neither level's parser
could read a superscript back, so a correct answer graded as its mantissa.

**Three terminology questions the harvest raised were ruled on 2026-08-27 and are now in the table
above, enforced by `governed-terms.test.ts` like the rest:** `atómradíus`, `leysni` and `hvolf`.
The first two were applied with the harvest; `hvolf` was swept afterwards and is the one that moves
grammatical gender, so read its row before touching any string containing it.

**Phase 4 of the games roadmap landed 2026-08-27** — the four answer leaks (B14–B17), the
`FeedbackPanel` collapse, the repo-wide decimal-comma pass (B9/B10) and the empty misconception
slots. **Level gating is the one item still open, and it is a decision, not code.**

Two things from it worth knowing before touching a game:

- **Any field whose answer can be non-integer must be `type="text"` + `inputMode="decimal"`, never
  `type="number"`** — the browser eats the Icelandic decimal comma before your code runs, and no
  normalising downstream recovers it. Parse with `parseStudentNumber` from `@shared/utils`. Count
  fields (protons, electrons, molecules, coefficients) keep `type="number"`;
  `packages/shared/utils/__tests__/decimal-input.test.ts` allow-lists them by what they count and
  fails on anything new.
- **Removing an answer leak often removes the student's only route to the answer.** Masking the
  atomic masses on Lotukerfið L2 left its order-by-mass items answerable only by the rule the level
  teaches — and Ar/K and Co/Ni inside its own draw pool contradict that rule. Check for this every
  time; the route has to be put back deliberately.

**Three live defects were found doing Phase 4, none of them on the reviews' lists** — the details are
in `docs/README.md`. The largest: **B5's `Fosfór` correction was only half-applied**, reaching
`nafnakerfid/src/data/compounds.ts` but not Levels 1 and 2, which hardcode their own worked examples
and both still taught and **graded** `Fosforpentaklóríð`. A student writing the corrected name in
Level 2 was marked wrong. If you fix a name in a game's data file, grep the components too.

**Phase 5 opened 2026-09-03 with `3-ar/syrufastinn` — Sýrufastinn, the Ka/Kb node.** It is the
21st game, and the first new Y3 game since the April restructure. Four phases (Kanna, Skilja, Æfa,
Beita) on the `1-ar/einingakedjan` model, 61 tests. Read
`apps/games/3-ar/syrufastinn/README.md` before touching it; what matters platform-wide:

- **The gap it filled was real and specific.** `equilibrium-shifter` teaches equilibrium with **no
  number anywhere** — `QKComparison.tsx` compares Q and K as bar widths chosen from the shift
  direction — while `ph-titration` and `buffer-recipe-creator` both _compute_ with Ka and hand the
  student `pKa` as given data. Nothing said what Ka is, and `sýrufasti` had zero platform hits.
- **Grading is on the approximation, by the 5 % rule — Siggi's ruling, 2026-09-03**, and it is what
  keeps the chain consistent: `ph-titration` stores `initialPH: 2.87` and `11.13`
  (`data/titrations.ts:76,138`) and **both are `√(Ka·C)` values.** Grading the exact quadratic would
  have had two adjacent nodes disagree about the same beaker. A test asserts the new game reproduces
  both stored values.
- **The exact root is accepted too, with no second comparison, and the arithmetic is why.**
  `h_exact = h_approx·√(1−α)`, so the pH gap is `−½·log₁₀(1−α)` ≤ **0,0111** under the 5 % rule —
  inside the ±0,02 tolerance. **An earlier draft of that file wrote the gap as `−log₁₀(1−α)` =
  0,0223, missing the factor of ½, and built an unreachable branch on it.** If you touch
  `PH_TOLERANCE`, note it may not go below ~0,012 without marking correct quadratic solutions wrong.
- **Two defects were found in problems written the same day, both familiar shapes.** A question
  disagreed with its own grader (it asked for Ka from pH = 2,87 but stored the tidy table value
  1,8 × 10⁻⁵ instead of the 1,84 × 10⁻⁵ that pH implies — outside a 1 % tolerance), and a percentage
  question carried an absolute ±0,1 pp tolerance on an answer of 0,0011 %, which accepts a bare `0`
  — B13 exactly. **New general rule now encoded as a test:** every graded problem must reject `0`,
  double, half and `NaN`. Assert the property; do not trust the choice of comparison mode.
- **A tolerance note worth reusing:** Ka back-calculated from a two-decimal pH cannot be graded at
  1 %. Ka ∝ [H⁺]², so ±0,005 in pH is 2·ln10·0,005 = **2,3 %** in Ka before the student rounds
  anything.
- **`chain-string.test.ts` now enforces the `Námsleiðin` chain across all six Y3 games**, and that
  every game `build-games.mjs` emits has an entry. Step 4 of "Adding a new game" was written down
  and never checked; a Y1 equivalent does not exist yet and would be a cheap follow-up.
- **CLAUDE.md's own Y3 chain line said `Púfferar`** — a banned form, fixed here. It survived the
  August sweep because `governed-terms.test.ts` scans `.tsx?` only, so no Markdown is covered.
  `docs/FEBRUARY-DECISIONS-RECOVERED.md:118` had explicitly named this line as part of that fix.

**Open after it, and wanting a ruling:** the platform names three acids inconsistently, which is why
they are absent from the new game's pool — **HF** is `Flússýra` in `ph-titration/data/titrations.ts:87`
but `flúorsýru` in that same game's `level2-puzzles.ts:82` and `level3-challenges.ts:303`, and
`Flúorsýra` in `2-ar/intermolecular-forces`; **HNO₃/HNO₂** appears as `saltpéturssýra`,
`saltpétursýru` (one `s`) and `salpeturssýru` (missing `t` and accent,
`equilibrium-shifter/data/equilibria.ts:415`); and **H₃PO₄** as both `Fosfórsýra` and the accentless
`fosforsýru` (`equilibria.ts:856`) — that last one is not a new question but a **missed site of the
existing B5 `Fosfór` ruling**. Also `brennisteinsýru` with one `s` (`2-ar/hess-law`) and
`Benzoesýrustuðpúði` with a `z` (`buffer-recipe-creator/data/problems.ts:146`).

**Still open in Phase 5, deliberately untouched:** `equilibrium-shifter` is still entirely
qualitative. The scope ruling was the weak-acid case only, so general Kc/Kp and ICE for arbitrary
equilibria remain unbuilt. Also unverified: **every Ka value in the new game is Brown et al.
Appendix D and has not been checked against the school's own copy**, since the corpus is not
reachable from a cloud session.

**No known live defects.** Every correctness and gradeability item the August 2026 reviews found is
now fixed, as are the three above, and each carries a test that fails against the pre-fix code. What
is left is enrichment and unfinished decisions, not defects — the work order is
`docs/plans/2026-08-16-games-roadmap.md`, and `docs/README.md` carries the four look-alike option
arrays that are **not** defects, so nobody "fixes" a fifth.

The former "`challenges.ts:354` is unsatisfiable" claim was retired Aug 2026 by executing `Level3`'s grading path — see `docs/README.md`. Do not reinstate it.

The current work order for these lives in `docs/plans/2026-08-16-games-roadmap.md`.

## Icelandic terminology is governed, not chosen per-game

`packages/shared/i18n/ordabok.md` is the authority — it was moved into the shared library deliberately. When a term is disputed, resolve in this order:

1. `packages/shared/i18n/ordabok.md`
2. `~/dev/repos/namsbokasafn-efni`, the school's textbook corpus (`grep -roi "<stem>[a-uáéíóúýþæö]*" --include=*.md . | wc -l`) — a local checkout, so it is not reachable from a cloud session; say so rather than guessing when it is absent
3. Ask Siggi — only where both are silent or they disagree

**Applied 2026-08-26 (roadmap Phase 2) and now enforced by a test.** All eight terms below are
corrected in the shipped source, and `packages/shared/i18n/__tests__/governed-terms.test.ts` fails
if a banned form reappears anywhere under `apps/games`, `apps/landing/src`, `apps/islenskubraut/src`
or `packages/shared/components` — including inside a dead `i18n.ts` block no game currently renders,
since a wrong term parked there ships the moment someone wires it up.

| Concept               | Use           | Never                             | Grammar note                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------- | ------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| atomic number         | `sætistala`   | `atómnúmer`, `raðtala`            | Feminine, where `atómnúmer` was neuter — nom `sætistala`, def. `sætistalan`, acc. def. `sætistöluna`, dat. `sætistölu`. Determiners change with it (`þeim atómnúmeri` → `þeirri sætistölu`)                                                                                                                                                                                                                                                               |
| enthalpy              | `vermi`       | `skammtavarmi`, `enþalpía`        | Masculine, same as `skammtavarmi`, so agreement is unaffected. `enþalpía` is an old-repo `calorimetry` coinage — do not import it if that game is ported                                                                                                                                                                                                                                                                                                  |
| spontaneous           | `sjálfgengur` | `sjálfspyrjandi`, `sjálfviljugur` | `sjálfgengur` (m) / `sjálfgeng` (f, and n.pl) / `sjálfgengt` (n)                                                                                                                                                                                                                                                                                                                                                                                          |
| spontaneity           | `sjálfgengi`  | `sjálfviljugheit`, `sjálfvilji`   | Neuter, where `sjálfviljugheit` was being treated as feminine — its adjectives change too (`er röng` → `er rangt`)                                                                                                                                                                                                                                                                                                                                        |
| cathode               | `katóða`      | `kaþóða`                          | Same declension; the correction is only þ → t. `anóða` was already correct                                                                                                                                                                                                                                                                                                                                                                                |
| buffer                | `stuðpúði`    | `púffer`                          | Masculine, where `púffer` was neuter in some strings — adjectives change (`Súrt púffer` → `Súr stuðpúði`). Compounds take the genitive stem `stuðpúða-`: `stuðpúðalausn`, `stuðpúðageta`, `stuðpúðasvæði`. Plural `stuðpúðar`                                                                                                                                                                                                                             |
| balance (an equation) | `stilla`      | `jafna` (as a verb)               | **Siggi's ruling, 2026-08-26** — `ordabok.md` was silent and the platform shipped both words. `að stilla efnajöfnu`, `Stilltu jöfnuna`, `stillt efnajafna`, `óstillt efnajafna`. The Y1 game is now **Stilla efnajöfnur**. Unrelated and correct: the **noun** `jafna` (an equation), `jafnvægi` (equilibrium), `jafnast út` (to cancel out), `þrýstijafnaður` (pressurised)                                                                              |
| carbon dioxide        | `koldíoxíð`   | `koltvísýringur`                  | **Siggi's ruling, 2026-08-26** — `ordabok.md` was silent and the platform shipped both words: `nafnakerfid` taught `koldíoxíð`, nine other games said `koltvísýringur`. Neuter, where `koltvísýringur` was masculine, so the cases change with it: acc. `koldíoxíð`, dat. `koldíoxíði`, gen. `koldíoxíðs` / def. `koldíoxíðsins`. **Unrelated and left alone:** `kolsýringur` is CO, not CO₂, and is used consistently by the three games that mention it |

| atomic radius | `atómradíus` | `atómgeisli` | **Siggi's ruling, 2026-08-27**, agreeing with `ordabok.md` (`atomic radius;atómradíus`) and the corpus (23 vs **0**). Both masculine, so agreement is unaffected. `atómgeisli` was an old-repo coinage that arrived with the periodic-trends harvest |
| solubility | `leysni` | `leysigeta`, `leysanleiki` | **Siggi's ruling, 2026-08-27**, agreeing with `ordabok.md` (`solubility;leysni`) and the corpus (260 vs **0**). Both feminine, and `leysni` does not decline in the singular oblique cases, so nothing around it moves — the easiest swap in this table. **Unrelated and left alone:** the adjective `leysanlegur` (soluble) |
| electron shell | `hvolf` | `skel`, `rafeindaskel`, `undirskel` | **Siggi's ruling, 2026-08-27**, agreeing with `ordabok.md` (`shell;hvolf`) and the corpus (133 `hvolfi` + 33 `gildishvolf` vs 7 `skelja`). **Neuter, where `skel` was feminine — the largest agreement change in this table.** `fulla ystu skel` → `fullt ysta hvolf`; `í ystu skel` → `í ysta hvolfi`; `fullrar ystu skeljar` → `fulls ysta hvolfs`; `allar skeljar fylltar` → `öll hvolf fyllt`. Declension: `hvolf` / `hvolf` / `hvolfi` / `hvolfs`, plural `hvolf` / `hvolf` / `hvolfum` / `hvolfa`. **Unrelated and left alone:** `skeljabrot` (seashell fragments) in `nafnakerfid` |
| stoichiometry | `hlutfallaefnafræði` | `stökjómetría`, `Stökefnafræði`, `stækifræði` | **Siggi's ruling, 2026-08-27** — `ordabok.md` was silent and the platform shipped **three** words for one concept, the widest split yet found: `stökjómetría` on the hub card every student passes through (`GamesHub.tsx:57`) and in `1-ar/takmarkandi`, `Stökefnafræði` in `2-ar/hess-law`'s chain chip, `stækifræði` in `1-ar/jafna-jofnur`'s subtitle. Feminine, and like `efnafræði` it does **not** decline in the singular — nom/acc/dat/gen all `hlutfallaefnafræði` — so this is the one ruling in this table that is a pure string swap in every case. Now `stoichiometry;hlutfallaefnafræði` in `ordabok.md` |
| anode / cathode | `anóða` / `katóða` | `kaþóða`, **`anoða`**, **`katoða`** | **Extended 2026-08-27.** The original `kaþóða` → `katóða` ruling banned only the þ-for-t spelling and recorded that "`anóða` is already correct". It was not: the **accentless** `anoða` and `katoða` survived in `2-ar/redox-reactions`'s `ElectrochemicalCell.tsx:377` aria-label precisely because no banned form matched them. Both vowels carry an acute, and compounds keep it (`fórnaranóða`). Declension is unaffected — this is spelling only |
| galvanic cell | `galvaníhlað` | `galvanískur klefi`, `galvaníklefi` | **Siggi's ruling, 2026-08-27** — `ordabok.md` was silent on this one, though it already carried three sibling cells (`electrolytic cell;rafker`, `half-cell;hálfker`, `fuel cell;efnarafall`). **The compound absorbs the adjective**, so any `galvanísk-` form is now wrong: not `Galvanískur klefi` but `Galvaníhlað`. Neuter, where `klefi` was masculine — nom/acc `galvaníhlað`, dat `galvaníhlaði`, gen `galvaníhlaðs`. All four shipped strings read `Galvanísk klefi`, which was ungrammatical even on the old noun. **See the electrochemical cell row below:** `Rafefnaklefi` at `ElectrochemicalCell.tsx:380` was ruled on two days later, and bare `klefi` is now banned outright |
| electrochemical cell | `rafefnahlað` | `rafefnaklefi`, and bare `klefi` | **Siggi's ruling, 2026-08-29**, completing the pair with `galvaníhlað`. The one shipped use was `Rafefnaklefi` in the SVG `<title>` of `ElectrochemicalCell.tsx:380` — **the same diagram whose `aria-label` four lines above says `Galvaníhlað`**, so the component named one picture two ways. Neuter, like `galvaníhlað`: nom/acc `rafefnahlað`, dat `rafefnahlaði`, gen `rafefnahlaðs`. Bare `klefi` is now banned outright, since no chemistry term on the platform uses it. **Settled, do not re-raise:** `ordabok.md` keeps `electrolytic cell;rafker` and `half-cell;hálfker` on the `-ker` pattern — Siggi's ruling, 2026-08-29. So the genus is `-hlað` while one of its two species is `-ker`, and that is deliberate, not drift. Neither `-ker` term ships today; when electrochemistry content grows, use them as the official glossary gives them |
| combustion reaction | `brunaefnahvarf` | — | **Siggi's ruling, 2026-08-27.** Distinct from the existing `combustion;bruni`, which names the process; `brunaefnahvarf` names the reaction type. Nothing shipped is wrong, so there is no banned form and no test row yet — the glossary entry is there for the Phase 5 content that will need it |
| decomposition | `niðurbrot` | — | **Siggi's ruling, 2026-08-27**, beside the existing `decomposition reaction;niðurbrotsefnahvarf`. Neuter. The one shipped use (`hess-law/src/i18n.ts:97`, `fyrir niðurbrot kalsíumkarbónats`) already agrees with it. No banned form, so no test row |
| synthesis / synthesis reaction | `samruni` / `samrunaefnahvarf` | — | **Siggi's ruling, 2026-08-29**, completing the five reaction-type names. Nothing shipped uses either, so no banned form and no test row. **Note the neighbour:** `ordabok.md` already carries `nuclear fusion;kjarnasamruni`, which is the same root qualified — `samruni` alone is synthesis, `kjarnasamruni` stays nuclear fusion |
| single / double displacement | `einfalt skiptihvarf` / `tvöfalt skiptihvarf` | — | **Siggi's ruling, 2026-08-29.** Nothing shipped uses either. **The qualifier is load-bearing:** `ordabok.md` already carries `substitution;skiptihvarf`, so bare `skiptihvarf` means substitution and only the qualified forms name the displacement reactions. Do not shorten either in prose |
| acid dissociation constant | `sýrufasti` | `sýrustuðull` | **Siggi's ruling implicit in the 2026-09-03 Ka/Kb rulings**, and `ordabok.md` already carried `acid dissociation constant;sýrufasti`. Masculine — nom `sýrufasti`, acc/dat/gen `sýrufasta`, def. `sýrufastinn`. Had **zero** occurrences platform-wide until `3-ar/syrufastinn` shipped: the platform used Ka in three games without ever naming it. The `-fasti` pattern is the platform-wide one (`jafnvægisfasti`, `hraðafasti`, `myndunarfasti`, `klofningsfasti vatns`); a `-stuðull` names a coefficient, not a constant. **The ban stops at `stuð`, not `stuðl`** — `stuðull` is `stuð`+`ull` in the nominative and `stuðl-` only in the oblique cases, so the shorter stem would have missed the commonest form (found by probing, and the same class of miss as the accentless `anoða`). A lookahead exempts `maurasýrustuðpúði` / `sítrónusýrustuðpúði` in `buffer-recipe-creator`, where the match is only the seam between an acid name's genitive and `stuðpúði` |
| base dissociation constant | `basafasti` | `basastuðull`, `basaklofningsfasti` | **Siggi's ruling, 2026-09-03**, completing the pair. Masculine, same declension as `sýrufasti`. Now `base dissociation constant;basafasti` in `ordabok.md`, where there had been no entry at all. **Do not build it from `klofningsfasti`:** that name is taken by `klofningsfasti vatns` (Kw), and reusing it for Kb would name two different constants the same thing |
| percent dissociation | `klofnunarhlutfall` | `klofnunarprósenta`, `sundrunarhlutfall`, `sundrunarprósenta`, **`jónunarprósenta`** | **Siggi's ruling, 2026-09-03.** Neuter — nom/acc `klofnunarhlutfall`, dat `klofnunarhlutfalli`, gen `klofnunarhlutfalls`, def. `klofnunarhlutfallið`. **Read this row before 'correcting' it:** `ordabok.md`'s near neighbours `mass percentage;massaprósenta`, `volume percentage;rúmmálsprósenta` and `percent yield;prósentuheimtur` all use `-prósenta`, so `klofnunarprósenta` looks like the consistent form. It is not the ruling — this one is built on the existing `dissociation;klofnun`. `jónunarprósenta` is banned for a different reason: it is what the February old-repo game `ka-kb-jafnvaegi` called its Level 3 (`docs/FEBRUARY-DECISIONS-RECOVERED.md:280`), so it arrives with that game if it is ever ported — the same trap as `enþalpía` from `calorimetry` |
`sjálfvirkur` has zero hits and is not the word for spontaneous; do not grep for it.

The `stilla` rename swept `1-ar/jafna-jofnur` (6 files), the `Námsleiðin` chain string in every
Y1 sibling, `apps/landing/src/pages/GamesHub.tsx`, and — beyond the Y1 game Siggi named —
`2-ar/redox-reactions`, where the same verb balanced half-reactions, atoms, oxygen, hydrogen and
charge. Fixing one game and not the other would have reproduced the one-platform-two-words defect
the glossary exists to prevent; say so if that was not wanted. **Two names were deliberately left
alone:** the URL slug `/efnafraedi/1-ar/games/jafna-jofnur.html` (renaming it breaks every link a
student has already been given) and the `jafnaJofnurProgress` localStorage key (renaming it wipes
saved progress). Both are invisible to students; the visible title, HTML `<title>` and hub card all
say Stilla efnajöfnur.

The `hvolf` ruling swept 43 occurrences across five games — `1-ar` lotukerfið (including the freshly
harvested `trends.ts`), and `2-ar` rafeindabygging, Lewis, VSEPR. It is the ruling this file's
closing warning was written about: **almost none of the 43 was a string swap.** `skel` is feminine
and `hvolf` is neuter, so `full ysta skel` became `fullt ysta hvolf`, `í ystu skel` became `í ysta
hvolfi`, `vegna fullrar ystu skeljar` became `vegna fulls ysta hvolfs`, and `allar skeljar fylltar`
became `öll hvolf fyllt`. Two strings were already ungrammatical before the change and are now
right by accident: `mörg rafeindaskel` (neuter agreement on a feminine noun) and
`Fullfyllt d-skel ... er sérlega stöðugt`. Two more were wrong for an unrelated reason and were
fixed with them: `nota d-undirskeljum` takes the accusative, not the dative.

The `leysni` ruling swept 20 occurrences: 19 in `1-ar/lausnir`, the one game whose whole subject it
names, plus a `Leysanleiki` label in `2-ar/intermolecular-forces`. One phrase needed rewriting
rather than substitution — `skoðaðu leysigetu feril` was already ungrammatical and is now
`skoðaðu leysniferilinn`. `atómradíus` swept only the harvested `trends.ts`: the coinage had no
foothold in shipped code.

The `koldíoxíð` ruling swept 18 occurrences across all three years — `1-ar` einingakedjan, lausnir
and molmassi; `2-ar` IMF, Lewis, Hess and VSEPR; `3-ar` gas-law. Five are prose and needed the
neuter case rather than a string swap: `gefur frá sér koldíoxíð`, `massa koldíoxíðsins`, `mól af
koldíoxíði`, `myndast koldíoxíð og vatn`, `massa koldíoxíðs`. The one ASCII mock-up that names it
(`molmassi/VISUAL_COMPARISON.md`) was re-padded so the box still lines up.

**What the test cannot do.** It matches strings, so it cannot check agreement. Replacing a banned
term in Icelandic is not a string swap — three of the six above change grammatical gender, which
moves the adjectives and determiners around them. A future fix that swaps only the noun will pass
the test and still read wrong to a student.

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
