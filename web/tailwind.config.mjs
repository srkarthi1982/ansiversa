/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'


export default {
    content: [
        './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    ],
    darkMode: 'class',
    theme: {
        container: {
            center: true,
            padding: '1rem',
            screens: {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
                '2xl': '1440px',
            },
        },
        extend: {
            fontFamily: {
                sans: [
                    'Inter var',
                    'Inter',
                    'ui-sans-serif',
                    'system-ui',
                    'Segoe UI',
                    'Roboto',
                    'Helvetica Neue',
                    'Arial',
                    'Noto Sans',
                    'Apple Color Emoji',
                    'Segoe UI Emoji',
                    'Segoe UI Symbol',
                ],
            },
            colors: {
                // Design tokens (kept in CSS variables too)
                primary: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1', // base
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                },
                accent: {
                    500: '#06b6d4',
                    600: '#0891b2',
                },
                success: '#10b981',
                warning: '#f59e0b',
                danger: '#ef4444',
            },
            boxShadow: {
                soft: '0 10px 25px -10px rgb(0 0 0 / 0.15)',
                glass: 'inset 0 1px 0 0 rgb(255 255 255 / 0.06), 0 8px 30px rgb(0 0 0 / 0.12)'
            },
            borderRadius: {
                xl: '1rem',
                '2xl': '1.25rem',
            },
        },
    },
    plugins: [typography(), forms()],
}