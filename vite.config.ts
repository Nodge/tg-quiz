import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';

// https://vitejs.dev/config/
export default defineConfig({
    root: './src/site',
    publicDir: 'public',
    build: {
        outDir: '../../build',
    },
    css: {
        postcss: {
            plugins: [tailwindcss, autoprefixer],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src/site'),
        },
    },
    plugins: [react()],
});
