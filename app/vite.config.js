import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the client runs on 5173 and the API on 4000; this proxy keeps
// them same-origin from the browser's point of view, so cookies and CSRF behave
// exactly as they will in production, where one server serves both.
// A project page on GitHub Pages is served from /<repo>/, so the base has to be
// set at build time; anything served from a domain root leaves it alone.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://localhost:4000',
        changeOrigin: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
