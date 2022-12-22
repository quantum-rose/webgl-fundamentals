import { useEffect, useRef } from 'react';
import { Mesh, PerspectiveCamera, Renderer, Scene, Texture } from '../core';
import { BowlingPinGeometry } from '../extras/bowlingpingeometry';
import { OrbitControls } from '../extras/orbitcontrols';
import { Vector3 } from '../math';
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

        const geometry = new BowlingPinGeometry();
        const pointLightPosition = new Vector3(800, 800, 800);
        const pointLightRotationAxis = [-1, 0, 1];
        const program = renderer.createProgram(vertex, fragment, {
            ambientLightColor: [0.04, 0.04, 0.04],
            pointLightPosition,
            specularFactor: 2,
            shininess: 200,
            uvGrid: new Texture('./uv-grid.png'),
        });
        const mesh = new Mesh(geometry, program);
        mesh.scale.setY(-1);
        mesh.setParent(scene);

        camera.position.set(0, -178, 400);
        camera.lookAt(0, -178, 0);

        const rotationSpeed = Math.PI * 0.1;

        let then = 0;
        let requestId: number | null = null;

        const render = (now: number) => {
            const angle = rotationSpeed * (now - then) * 0.001;
            then = now;

            pointLightPosition.applyAxisAngle(pointLightRotationAxis, angle);
            mesh.rotateY(angle);

            renderer.render(scene, camera);

            requestId = requestAnimationFrame(render);
        };

        render(then);

        return function cleanup() {
            if (requestId !== null) {
                cancelAnimationFrame(requestId);
            }
        };
    });

    return [canvasRef] as const;
}

export default function ThreeDGeometryLathe() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
