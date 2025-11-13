// @ts-check
import { defineConfig } from 'astro/config';
import alpinejs from '@astrojs/alpinejs';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

import db from '@astrojs/db';

export default defineConfig({
  integrations: [alpinejs(), db()],
  vite: {
    logLevel: 'error', // hides Vite warnings
    cacheDir: '.astro-vite-cache',
    plugins: [tailwindcss()],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@ansiversa/components': new URL('../components/src', import.meta.url).pathname,
        '@ansiversa/core': new URL('../core/src', import.meta.url).pathname,
        '@ansiversa/core/db': new URL('../core/db', import.meta.url).pathname,
        '@ansiversa/db': new URL('../ansiversa-db/src', import.meta.url).pathname,
        '@features': new URL('./src/features', import.meta.url).pathname,
      },
    },
  },
  output: "server",
  adapter: vercel()
});
