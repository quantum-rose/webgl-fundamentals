import { useEffect, useRef } from 'react';
import { Mesh, PerspectiveCamera, Renderer, Scene, Texture } from '../core';
import { BoxGeometry } from '../extras/boxgeometry';
import { OrbitControls } from '../extras/orbitcontrols';
import fragment from './fragment.frag';
import vertex from './vertex.vert';

function useWebGL() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;

        // renderer
        const renderer = new Renderer(canvas);

        // scene
        const scene = new Scene();

        // camera
        const camera = new PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 1, 1000);

        // controls
        const controls = new OrbitControls(camera, canvas);

        const geometry = new BoxGeometry(200);
        const program = renderer.createProgram(vertex, fragment);

        {
            const map = new Texture('./uv-grid.png');
            map.generateMipmaps = false;
            map.minFilter = 'LINEAR_MIPMAP_LINEAR';
            map.magFilter = 'NEAREST';

            const luminanceMap = new Texture('https://c1.staticflickr.com/9/8873/18598400202_3af67ef38f_q.jpg');
            luminanceMap.generateMipmaps = false;

            const mesh = new Mesh(geometry, program, {
                map,
                luminanceMap,
            });
            mesh.setParent(scene);
            mesh.position.setX(-150);
        }

        {
            const map = new Texture(new Uint8Array([255, 0, 0, 255, 0, 0, 255, 255, 255, 255, 0, 255, 0, 255, 0, 255]), 2, 2);
            map.generateMipmaps = false;
            map.minFilter = 'NEAREST';
            map.magFilter = 'NEAREST';

            const luminanceMap = new Texture(new Uint8Array([0, 32, 64, 96, 128, 160, 192, 224, 255]), 3, 3);
            luminanceMap.internalformat = 'LUMINANCE';
            luminanceMap.format = 'LUMINANCE';
            luminanceMap.generateMipmaps = false;
            luminanceMap.unpackAlignment = 1;
            luminanceMap.minFilter = 'NEAREST';
            luminanceMap.magFilter = 'NEAREST';

            const mesh = new Mesh(geometry, program, {
                map,
                luminanceMap,
            });
            mesh.setParent(scene);
            mesh.position.setX(150);
        }

        camera.position.setZ(400);

        let requestId: number | null = null;

        const render = () => {
            renderer.render(scene, camera);

            requestId = requestAnimationFrame(render);
        };

        render();

        return function cleanup() {
            if (requestId !== null) {
                cancelAnimationFrame(requestId);
            }
        };
    });

    return [canvasRef] as const;
}

export default function Textures() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
