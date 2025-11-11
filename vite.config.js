import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoBase = process.env.GITHUB_REPOSITORY?.split('/')?.[1];

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES && repoBase ? `/${repoBase}/` : '/',
  cacheDir: 'node_modules/.cache/vite',
  build: {
    outDir: 'node_modules/.cache/vite',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
