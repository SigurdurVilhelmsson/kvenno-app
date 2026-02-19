import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@kvenno/shared': path.resolve(__dirname, '../../packages/shared'),
      '@shared': path.resolve(__dirname, '../../packages/shared'),
    },
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
});
