import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// UI/UX-only build: no backend, no API keys, no env wiring.
export default defineConfig({
  // Relative base so the build works under any GitHub Pages sub-path.
  base: './',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
