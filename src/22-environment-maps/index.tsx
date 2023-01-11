import { useEffect, useRef } from 'react';
import { Mesh, PerspectiveCamera, Renderer, Scene, Texture } from '../core';
import { OrbitControls } from '../extras/orbitcontrols';
import { SphereGeometry } from '../geometries';
import { WebGLUtil } from '../utils/webglutil';
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

        // camera parameters
        let aspect = canvas.clientWidth / canvas.clientHeight;

        // camera
        const camera = new PerspectiveCamera(35, aspect, 0.1, 1000);
        camera.position.setZ(2);
        new OrbitControls(camera, canvas);

        // texture
        const cubeTexture = new Texture([
            './living-room-r.jpg',
            './living-room-l.jpg',
            './living-room-u.jpg',
            './living-room-d.jpg',
            './living-room-f.jpg',
            './living-room-b.jpg',
        ]);

        // program
        const program = renderer.createProgram(vertex, fragment, {
            cubeMap: cubeTexture,
        });

        // geometry
        const ballGeometry = new SphereGeometry(0.5, 128, 64);

        // ball
        const ball = new Mesh(ballGeometry, program);
        ball.setParent(scene);

        let requestId: number | null = null;

        const render = () => {
            if (WebGLUtil.resizeCanvasToDisplaySize(canvas)) {
                aspect = canvas.clientWidth / canvas.clientHeight;
                camera.aspect = aspect;
                camera.updateProjectionMatrix();
            }

            renderer.render(scene, camera);

            requestId = requestAnimationFrame(render);
        };

        render();

        return function cleanup() {
            if (requestId !== null) {
                cancelAnimationFrame(requestId);
            }
        };
    }, []);

    return [canvasRef] as const;
}

export default function EnvironmentMaps() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
