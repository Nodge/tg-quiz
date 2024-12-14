import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    root: './src/site', // Set the root directory containing index.html
    build: {
        outDir: '../../build',
    },
    plugins: [react()],
});
