import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import importGLSL from './build/vite-plugin-import-glsl';

export default defineConfig({
    plugins: [react(), importGLSL()],
    server: {
        open: true,
    },
});
