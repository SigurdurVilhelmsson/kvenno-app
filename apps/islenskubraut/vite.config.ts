import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/islenskubraut/',
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@kvenno/shared': path.resolve(__dirname, '../../packages/shared'),
      '@shared': path.resolve(__dirname, '../../packages/shared'),
    },
  },
  // The download button calls /api/islenskubraut/pdf on its own origin, which nginx
  // proxies in production. Without this the dev server answers it with a 404.
  // Run the backend beside it: `pnpm --filter kvenno-server dev`.
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  build: {
    outDir: '../../dist/islenskubraut',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
});
