// @ts-check
import { defineConfig } from 'astro/config';
import alpinejs from '@astrojs/alpinejs';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  integrations: [alpinejs()],
  vite: {
    plugins: [tailwindcss()]
  },
  output: "server",
  adapter: vercel()
});