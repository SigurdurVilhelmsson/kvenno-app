import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../../../packages/shared'),
    },
  },
  build: {
    outDir: '../../../../dist/efnafraedi/2-ar/games',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        kinetics: path.resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'kinetics.js',
        assetFileNames: 'kinetics.[ext]',
      },
    },
  },
});
