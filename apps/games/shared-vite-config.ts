import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

interface GameViteConfigOptions {
  gameName: string;
  yearDir: string;
  gameDir: string;
}

export function createGameViteConfig({ gameName, yearDir, gameDir }: GameViteConfigOptions) {
  const sharedRoot = path.resolve(gameDir, '../../../../packages/shared');

  return defineConfig({
    plugins: [
      tailwindcss(),
      react(),
      viteSingleFile(),
    ],
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
      emptyOutDir: false,
      rollupOptions: {
        input: {
          [gameName]: path.resolve(gameDir, 'index.html'),
        },
        output: {
          entryFileNames: `${gameName}.js`,
          assetFileNames: `${gameName}.[ext]`,
        },
      },
    },
  });
}
