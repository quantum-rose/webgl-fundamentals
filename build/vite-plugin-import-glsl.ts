import { PluginOption } from 'vite';

const glslRegex = /\.(vert|frag|glsl)$/i;

export default function importGLSL(): PluginOption {
    return {
        name: 'glsl-loader',
        transform(src: string, id: string) {
            if (glslRegex.test(id)) {
                return {
                    code: `export default ${JSON.stringify(src)}`,
                };
            }
        },
    };
}
