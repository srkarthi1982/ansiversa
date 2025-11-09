// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';
import alpinejs from '@astrojs/alpinejs';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
      logLevel: 'error', // hides Vite warnings,
      plugins: [tailwindcss()],
      resolve: {
          alias: {
              '@ansiversa/components': new URL('../components/src', import.meta.url).pathname,
          },
      },
  },

  output: "server",
  adapter: vercel(),
  integrations: [alpinejs()],
});
