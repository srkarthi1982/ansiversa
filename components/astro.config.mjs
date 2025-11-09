// @ts-check
import { defineConfig } from 'astro/config';

import alpinejs from '@astrojs/alpinejs';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    // hides Vite warnings
    logLevel: 'error',

    plugins: [tailwindcss()],
  },

  integrations: [alpinejs()],
});