# Bundle Sizes

Measured: 2026-02-19

## Chemistry Games (single-file HTML via vite-plugin-singlefile)

Games using Three.js (3D molecule viewers):

| Game | Year | Size |
|------|------|------|
| lewis-structures | 2-ar | 2.9 MB |
| vsepr-geometry | 2-ar | 2.9 MB |
| intermolecular-forces | 2-ar | 2.9 MB |
| molmassi | 1-ar | 2.9 MB |

Games without Three.js:

| Game | Year | Size |
|------|------|------|
| dimensional-analysis | 1-ar | 1.3 MB |
| lausnir | 1-ar | 1.3 MB |
| organic-nomenclature | 2-ar | 1.3 MB |
| buffer-recipe-creator | 3-ar | 1.3 MB |
| ph-titration | 3-ar | 1.3 MB |
| kinetics | 2-ar | 1.3 MB |
| takmarkandi | 1-ar | 1.3 MB |
| nafnakerfid | 1-ar | 1.3 MB |
| redox-reactions | 2-ar | 1.3 MB |
| hess-law | 2-ar | 1.3 MB |
| equilibrium-shifter | 3-ar | 1.3 MB |
| gas-law-challenge | 3-ar | 1.2 MB |
| thermodynamics-predictor | 3-ar | 1.2 MB |

Total: 17 games, ~25 MB combined

## Lab Reports (multi-chunk SPA, deployed to 2-ar and 3-ar)

| File | Size | Gzip |
|------|------|------|
| pdf.worker.min.mjs | 1.4 MB | (not gzipped, loaded as worker) |
| index.js | 813 KB | 227 KB |
| react-vendor.js | 194 KB | 61 KB |
| index.css | 29 KB | 6 KB |
| ui-vendor.js (lucide-react) | 11 KB | 3 KB |
| index.html | 0.8 KB | 0.4 KB |

Total per deployment: ~2.4 MB (two deployments: 2-ar and 3-ar)

Vendor chunks: react-vendor (react + react-dom), ui-vendor (lucide-react).
React.lazy() is used for TeacherResults, StudentFeedback, and SessionHistory components, though Rollup currently inlines them due to shared dependencies.

## Landing Page (SPA with chemistry year hubs)

| File | Size | Gzip |
|------|------|------|
| MoleculeViewer3D.js (Three.js lazy chunk) | 948 KB | 269 KB |
| index.js | 235 KB | 75 KB |
| react-vendor.js | 12 KB | 4 KB |
| index.css | 12 KB | 3 KB |
| index.html | 1 KB | 0.5 KB |

Total: ~1.2 MB

Note: MoleculeViewer3D is already code-split (lazy-loaded). Users only download it when viewing a year hub page that includes 3D previews.

## Islenskubraut (SPA)

| File | Size | Gzip |
|------|------|------|
| index.js | 265 KB | 80 KB |
| index.css | 22 KB | 5 KB |
| react-vendor.js | 12 KB | 4 KB |
| index.html | 1 KB | 0.5 KB |

Total: ~300 KB

## Full dist/ Total

~29 MB (dominated by 17 single-file game HTML files)

## Animation & Graphics Components

All graphics and animation features (`ParticleCelebration`, `AnimatedBackground`, `AnimatedCounter`, `ScorePopup`, `StreakCounter`, `SoundToggle`, `useGameSounds`) are implemented with **zero external dependencies**:

- **CSS**: Spring easing curves via `cubic-bezier()`, 17 keyframe animations, utility classes
- **Canvas 2D**: Particle physics rendered with `requestAnimationFrame`
- **Web Audio API**: 6 synthesized sound effects via oscillators (no audio files)

Bundle cost: effectively **0 KB** of additional dependencies. The component code itself adds a few KB per game but is negligible relative to the React/Tailwind baseline.

## Optimization Recommendations

1. **Games are the largest contributor.** The 1.2-2.9 MB per game is due to vite-plugin-singlefile bundling all dependencies (React, Tailwind CSS, Three.js) into each HTML file. This is by design for offline-capable, zero-dependency deployment but means each game re-bundles shared libraries.

2. **Three.js games are ~2x larger** than non-3D games (2.9 MB vs 1.2-1.3 MB). If game load time is a concern, consider lazy-loading Three.js within 3D games.

3. **Lab reports PDF worker** (1.4 MB) is the largest single asset. It's loaded as a web worker on-demand, so it doesn't block initial page load.

4. **Landing page** already code-splits the MoleculeViewer3D chunk (948 KB Three.js). Good pattern.

5. **Gzip compression** reduces transfer sizes significantly (lab-reports main chunk: 813 KB -> 227 KB gzipped). Ensure nginx serves with gzip/brotli.
