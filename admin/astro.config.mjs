// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    vite: {
        logLevel: 'error', // hides Vite warnings,
        resolve: {
            alias: {
                '@ansiversa/components': new URL('../components/src', import.meta.url).pathname,
            },
        },
    },
});
