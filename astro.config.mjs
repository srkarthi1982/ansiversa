// @ts-check
import { defineConfig } from 'astro/config';
import alpinejs from '@astrojs/alpinejs';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

import db from '@astrojs/db';

export default defineConfig({
  integrations: [alpinejs(), db()],
  vite: {
    plugins: [tailwindcss()]
  },
  output: "server",
  adapter: vercel()
});
