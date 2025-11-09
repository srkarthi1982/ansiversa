// @ts-check
import { defineConfig } from 'astro/config';
import db from '@astrojs/db';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [db()],

  vite: {
    logLevel: 'error', // hides Vite warnings
    server: {
      cors: {
        origin: true,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      },
    },
  },
  output: "server",
  adapter: vercel(),
});
