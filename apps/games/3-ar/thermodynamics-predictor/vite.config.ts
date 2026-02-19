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
      '@shared/components': path.resolve(__dirname, '../../../../packages/shared/components'),
      '@shared/hooks': path.resolve(__dirname, '../../../../packages/shared/hooks'),
      '@shared/utils': path.resolve(__dirname, '../../../../packages/shared/utils'),
      '@shared/types': path.resolve(__dirname, '../../../../packages/shared/types'),
      '@shared/i18n': path.resolve(__dirname, '../../../../packages/shared/i18n'),
      '@shared/styles': path.resolve(__dirname, '../../../../packages/shared/styles'),
    },
  },
  build: {
    outDir: '../../../../dist/efnafraedi/3-ar/games',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        'thermodynamics-predictor': path.resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'thermodynamics-predictor.js',
        assetFileNames: 'thermodynamics-predictor.[ext]',
      },
    },
  },
});
