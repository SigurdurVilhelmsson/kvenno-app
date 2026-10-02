import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

interface GameViteConfigOptions {
  gameName: string;
  yearDir: string;
  gameDir: string;
  /**
   * Inline all JS/CSS into one self-contained .html file (the default).
   *
   * Set to `false` for games with a heavy lazy-loaded dependency — currently the
   * three Three.js games. `vite-plugin-singlefile` re-inlines dynamic-import
   * chunks, so a code-split boundary buys nothing while it is enabled; opting out
   * lets the browser defer that payload until the student actually opens a 3D view.
   *
   * Trade-off: the game is no longer a single portable file. It becomes
   * `{gameName}.html` plus `{gameName}.css` and `assets/{gameName}/*.js`, all of
   * which must be served together.
   */
  singleFile?: boolean;
}

export function createGameViteConfig({
  gameName,
  yearDir,
  gameDir,
  singleFile = true,
}: GameViteConfigOptions) {
  const sharedRoot = path.resolve(gameDir, '../../../../packages/shared');

  return defineConfig({
    // Split builds emit real asset URLs, and the built HTML is served from
    // /efnafraedi/{year}/games/ — not the site root. A relative base keeps those
    // URLs resolving next to the HTML instead of 404ing at the domain root.
    // Harmless for single-file builds, where nothing is emitted to reference.
    base: './',
    plugins: [tailwindcss(), react(), ...(singleFile ? [viteSingleFile()] : [])],
    resolve: {
      alias: {
        '@shared': sharedRoot,
        '@shared/components': path.resolve(sharedRoot, 'components'),
        '@shared/hooks': path.resolve(sharedRoot, 'hooks'),
        '@shared/utils': path.resolve(sharedRoot, 'utils'),
        '@shared/types': path.resolve(sharedRoot, 'types'),
        '@shared/i18n': path.resolve(sharedRoot, 'i18n'),
        '@shared/styles': path.resolve(sharedRoot, 'styles'),
      },
    },
    build: {
      outDir: `../../../../dist/efnafraedi/${yearDir}/games`,
      // Every game in a year builds into this same directory, so emptying it
      // would delete the games built before this one.
      emptyOutDir: false,
      rollupOptions: {
        input: {
          [gameName]: path.resolve(gameDir, 'index.html'),
        },
        output: {
          // A single-file game inlines its entry and stylesheet, so their names never
          // reach the server. A code-split game's do, and nginx caches every .js and .css
          // for a year as immutable — so a fixed `{game}.js` let a returning browser run a
          // year-old bundle after a redeploy (REVIEW-QUEUE D2). Those two are hashed under
          // the per-game directory like everything else they load; the HTML, which is not
          // year-cached, names the current ones.
          entryFileNames: singleFile
            ? `${gameName}.js`
            : `assets/${gameName}/${gameName}-[hash].js`,
          // Any other emitted asset (the 3D viewer's label font) goes under the per-game
          // directory with a content hash, like the split chunks: nginx caches it for a
          // year as immutable, and build-games.mjs clears that directory per build.
          assetFileNames: (asset) =>
            asset.names.some((n) => n.endsWith('.css'))
              ? singleFile
                ? `${gameName}.[ext]`
                : `assets/${gameName}/${gameName}-[hash].[ext]`
              : `assets/${gameName}/[name]-[hash][extname]`,
          // Namespace split chunks per game. The output directory is shared with
          // every other game in the year, so a flat `assets/` would mix them and
          // make stale-chunk cleanup impossible to scope.
          chunkFileNames: `assets/${gameName}/[name]-[hash].js`,
        },
      },
    },
  });
}
