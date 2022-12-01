import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import importGLSL from './build/vite-plugin-import-glsl';

export default defineConfig({
    plugins: [react(), importGLSL()],
});
