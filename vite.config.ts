import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    root: './src/site',
    build: {
        outDir: '../../build',
    },
    plugins: [react()],
});
