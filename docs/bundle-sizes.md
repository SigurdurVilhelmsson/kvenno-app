# Bundle Sizes

Measured: 2026-08-15 (20 games, post Three.js code-split)

## Chemistry Games

Most games build to one self-contained HTML file via `vite-plugin-singlefile`. The three Three.js
games opt out (`singleFile: false` in `apps/games/shared-vite-config.ts`) so their 3D payload can
be deferred — see the note below.

"Initial" is what a student downloads on page open (HTML + CSS + entry JS). "Deferred" loads only
if they open a 3D view.

| Game                     | Year | Initial | Deferred |
| ------------------------ | ---- | ------- | -------- |
| vsepr-geometry           | 2-ar | 401 KB  | 2600 KB  |
| buffer-recipe-creator    | 3-ar | 389 KB  | —        |
| lewis-structures         | 2-ar | 380 KB  | 2600 KB  |
| intermolecular-forces    | 2-ar | 377 KB  | 2600 KB  |
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

To re-measure:

```bash
pnpm build && ls -la dist/efnafraedi/*/games/*.html
```

## Lab Reports (multi-chunk SPA, deployed to 2-ar and 3-ar)

| File                        | Size   | Gzip   |
| --------------------------- | ------ | ------ |
| index.js                    | 812 KB | 227 KB |
| react-vendor.js             | 194 KB | 61 KB  |
| index.css                   | 57 KB  | 11 KB  |
| ui-vendor.js (lucide-react) | 12 KB  | 3 KB   |
| index.html                  | 0.8 KB | 0.4 KB |

Total per deployment: ~1.1 MB (two deployments: 2-ar and 3-ar)

Vendor chunks: react-vendor (react + react-dom), ui-vendor (lucide-react).
React.lazy() is used for TeacherResults, StudentFeedback, and SessionHistory components, though Rollup currently inlines them due to shared dependencies.

## Landing Page (SPA with chemistry year hubs)

| File            | Size   | Gzip   |
| --------------- | ------ | ------ |
| index.js        | 246 KB | 77 KB  |
| index.css       | 50 KB  | 10 KB  |
| react-vendor.js | 12 KB  | 4 KB   |
| index.html      | 1 KB   | 0.5 KB |

Total: ~310 KB

Note: MoleculeViewer3D is already code-split (lazy-loaded). Users only download it when viewing a year hub page that includes 3D previews.

## Islenskubraut (SPA)

| File            | Size   | Gzip   |
| --------------- | ------ | ------ |
| index.js        | 272 KB | 82 KB  |
| index.css       | 54 KB  | 10 KB  |
| react-vendor.js | 12 KB  | 4 KB   |
| index.html      | 1 KB   | 0.5 KB |

Total: ~340 KB

## Full dist/ Total

~22 MB across 20 games. The three Three.js games account for ~7.8 MB of that, but ~7.4 MB of it
is deferred chunks a student only downloads if they open a 3D view.

## Animation & Graphics Components

The remaining graphics and animation features (`AnimatedCounter`, `ScorePopup`, `StreakCounter`, `ParticleSimulation`) are implemented with **zero external dependencies**:

- **CSS**: Spring easing curves via `cubic-bezier()`, 17 keyframe animations, utility classes
- **Canvas 2D**: Particle physics rendered with `requestAnimationFrame`

Bundle cost: effectively **0 KB** of additional dependencies. The component code itself adds a few KB per game but is negligible relative to the React/Tailwind baseline.

**Removed Aug 2026:** `ParticleCelebration`, `AnimatedBackground`, `SoundToggle`, and `useGameSounds` (with its Web Audio oscillator bank) were deleted after the April 2026 restructure left them with zero importers across `apps/`.

## Optimization Recommendations

1. **Games are the largest contributor.** The 0.3-2.9 MB per game is due to vite-plugin-singlefile bundling all dependencies (React, Tailwind CSS, Three.js) into each HTML file. This is by design for offline-capable, zero-dependency deployment but means each game re-bundles shared libraries.

2. **Three.js games are ~2x larger** than non-3D games (2.9 MB vs 1.2-1.3 MB). If game load time is a concern, consider lazy-loading Three.js within 3D games.

3. **Lab reports PDF worker** (1.4 MB) is the largest single asset. It's loaded as a web worker on-demand, so it doesn't block initial page load.

4. **Landing page** already code-splits the MoleculeViewer3D chunk (948 KB Three.js). Good pattern.

5. **Gzip compression** reduces transfer sizes significantly (lab-reports main chunk: 813 KB -> 227 KB gzipped). Ensure nginx serves with gzip/brotli.
