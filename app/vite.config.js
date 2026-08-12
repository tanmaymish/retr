import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the client runs on 5173 and the API on 4000; this proxy keeps
// them same-origin from the browser's point of view, so cookies and CSRF behave
// exactly as they will in production, where one server serves both.
export default defineConfig({
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
