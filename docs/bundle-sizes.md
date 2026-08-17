# Bundle Sizes

Measured: 2026-08-15 (20 games, post Three.js code-split)

**Provenance.** Every figure below comes from the on-disk `dist/`, which is the **2026-08-15
20:00–20:01** build. The three app tables (lab-reports, landing, íslenskubraut) were re-derived by
`ls -l` / `gzip -c -9 | wc -c` against that build on **2026-08-17**; the previous versions of those
tables had the `index.js` and `react-vendor.js` rows transposed. Sizes are KiB (bytes ÷ 1024).

**Is `dist/` stale?** Mostly no. Comparing mtimes across every file under `apps/`, `packages/`,
`scripts/` and `server/` (excluding `node_modules/` and build output), exactly one non-Markdown file
post-dates the build: `packages/shared/components/MoleculeViewer3D/MoleculeViewer3DLazy.tsx`, at
20:11 — eleven minutes after it finished. So the three Three.js games' figures may be one edit
behind current source; everything else that changed since is documentation. Re-run `pnpm build`
before trusting the game table to the kilobyte. (mtime is a weaker signal than a rebuild — it is
what was available without running a build.)

## Chemistry Games

Most games build to one self-contained HTML file via `vite-plugin-singlefile`. The three Three.js
games opt out (`singleFile: false` in `apps/games/shared-vite-config.ts`) so their 3D payload can
be deferred — see the note below.

"Initial" is what a student downloads on page open (HTML + CSS + entry JS). "Deferred" loads only
if they open a 3D view.

| Game                     | Year | Initial | Deferred |
| ------------------------ | ---- | ------- | -------- |
| vsepr-geometry           | 2-ar | 401 KB  | 1004 KB  |
| buffer-recipe-creator    | 3-ar | 389 KB  | —        |
| lewis-structures         | 2-ar | 379 KB  | 1004 KB  |
| intermolecular-forces    | 2-ar | 376 KB  | 1004 KB  |
| organic-nomenclature     | 2-ar | 373 KB  | —        |
| dimensional-analysis     | 1-ar | 368 KB  | —        |
| ph-titration             | 3-ar | 362 KB  | —        |
| kinetics                 | 2-ar | 359 KB  | —        |
| redox-reactions          | 2-ar | 354 KB  | —        |
| lausnir                  | 1-ar | 353 KB  | —        |
| hess-law                 | 2-ar | 351 KB  | —        |
| equilibrium-shifter      | 3-ar | 344 KB  | —        |
| nafnakerfid              | 1-ar | 331 KB  | —        |
| gas-law-challenge        | 3-ar | 328 KB  | —        |
| molmassi                 | 1-ar | 326 KB  | —        |
| thermodynamics-predictor | 3-ar | 315 KB  | —        |
| lotukerfid               | 1-ar | 314 KB  | —        |
| rafeindabygging          | 2-ar | 302 KB  | —        |
| takmarkandi              | 1-ar | 300 KB  | —        |
| jafna-jofnur             | 1-ar | 290 KB  | —        |

Every game now opens in 290–401 KB. Two changes got here:

- **Vite 8 / Rolldown** took non-3D games from ~1.3 MB to ~300–400 KB.
- **The Aug 2026 Three.js code-split** took VSEPR, Lewis, and IMF from ~2.9 MB to ~380–400 KB by
  deferring three / fiber / drei until a 3D view is actually opened. The blocker was not the
  bundler: a static re-export in `packages/shared/components/MoleculeViewer3D/index.ts` had been
  silently defeating the existing lazy boundary. `e2e/threejs-lazy-loading.spec.ts` guards it.
- **The drei-probe fix** then halved the deferred payload again, 2600 KB → 1004 KB, by dropping an
  `await import('@react-three/drei')` that pulled the entire barrel (incl. `hls.js` and
  `@mediapipe/tasks-vision`) just to test that it resolved.

To re-measure:

```bash
pnpm build && ls -la dist/efnafraedi/*/games/*.html
```

## Lab Reports (multi-chunk SPA, deployed to 2-ar and 3-ar)

| File                        | Size    | Gzip   |
| --------------------------- | ------- | ------ |
| pdf.worker.min.mjs          | 1210 KB | 356 KB |
| index.js                    | 784 KB  | 218 KB |
| react-vendor.js             | 185 KB  | 57 KB  |
| index.css                   | 55 KB   | 10 KB  |
| ui-vendor.js (lucide-react) | 6 KB    | 2.5 KB |
| index.html                  | 1 KB    | 0.4 KB |
| rolldown-runtime.js         | 0.6 KB  | 0.4 KB |

Total per deployment: ~2.2 MB (two deployments: 2-ar and 3-ar), of which 1210 KB is the PDF worker
fetched on demand — about 1.0 MB is blocking on initial page load. The worker was missing from the
earlier version of this table, which is why the total read ~1.1 MB.

Vendor chunks: react-vendor (react + react-dom), ui-vendor (lucide-react).
React.lazy() is used for TeacherResults, StudentFeedback, and SessionHistory components, though Rollup currently inlines them due to shared dependencies.

## Landing Page (SPA with chemistry year hubs)

| File                | Size   | Gzip   |
| ------------------- | ------ | ------ |
| react-vendor.js     | 185 KB | 57 KB  |
| index.js            | 63 KB  | 20 KB  |
| index.css           | 48 KB  | 9 KB   |
| index.html          | 1 KB   | 0.5 KB |
| rolldown-runtime.js | 0.6 KB | 0.4 KB |

Total: ~298 KB

Note: the landing page carries no 3D code at all. `grep -rn MoleculeViewer3D apps/landing/src/`
returns zero hits and `dist/assets/` holds no Three.js chunk — the app previously code-split a
`MoleculeViewer3D` chunk but no longer references the component.

## Islenskubraut (SPA)

| File                | Size   | Gzip   |
| ------------------- | ------ | ------ |
| react-vendor.js     | 185 KB | 57 KB  |
| index.js            | 88 KB  | 24 KB  |
| index.css           | 52 KB  | 10 KB  |
| index.html          | 1 KB   | 0.5 KB |
| rolldown-runtime.js | 0.6 KB | 0.4 KB |

Total: ~327 KB

## Full dist/ Total

~17 MB across 20 games (17,621,594 bytes of files — `du -sh` reports 18M because it counts
filesystem blocks rather than file sizes). The three Three.js games account for ~4.1 MB of that, but
~2.9 MB of it is deferred chunks a student only downloads if they open a 3D view.

## Animation & Graphics Components

The remaining graphics and animation features (`AnimatedCounter`, `ScorePopup`, `StreakCounter`, `ParticleSimulation`) are implemented with **zero external dependencies**:

- **CSS**: Spring easing curves via `cubic-bezier()`, 17 keyframe animations, utility classes
- **Canvas 2D**: Particle physics rendered with `requestAnimationFrame`

Bundle cost: effectively **0 KB** of additional dependencies. The component code itself adds a few KB per game but is negligible relative to the React/Tailwind baseline.

**Removed Aug 2026:** `ParticleCelebration`, `AnimatedBackground`, `SoundToggle`, and `useGameSounds` (with its Web Audio oscillator bank) were deleted after the April 2026 restructure left them with zero importers across `apps/`.

## Optimization Recommendations

1. **Done (Aug 2026) — Three.js is deferred.** VSEPR, Lewis, and IMF used to ship ~2.9 MB up front.
   They now open in ~380-400 KB, with ~1004 KB fetched only when a student opens a 3D view. This was
   two bugs, not a bundler limitation: a static re-export defeating the lazy boundary, and a
   dependency probe importing the whole `@react-three/drei` barrel. `e2e/threejs-lazy-loading.spec.ts`
   guards it — do not "simplify" that spec away. The 1004 KB is reproducible from the on-disk build
   (`dist/efnafraedi/2-ar/games/assets/vsepr-geometry/` = 1,028,868 B); the pre-fix ~2.9 MB and
   2600 KB figures are historical and cannot be re-measured without reverting the fix.

2. **Single-file builds re-bundle shared libraries.** Each of the 17 single-file games inlines its own
   copy of React and Tailwind, so the ~290-400 KB is mostly duplicated across games. That is the
   deliberate cost of self-contained, offline-capable HTML. Only revisit it if a game exceeds ~500 KB.

3. **Lab reports PDF worker** (~1210 KB) is the largest single asset. It loads as a web worker
   on-demand, so it does not block initial page load.

4. **Landing page carries no 3D code** (react-vendor 185 KB + index 63 KB). It previously code-split a
   MoleculeViewer3D chunk; the landing app no longer references it at all.

5. **Gzip compression** reduces transfer sizes significantly (lab-reports main chunk: 784 KB -> 218 KB gzipped). Ensure nginx serves with gzip/brotli.
