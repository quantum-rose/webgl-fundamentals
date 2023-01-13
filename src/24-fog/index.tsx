import { useEffect, useRef } from 'react';
import { BufferGeometry, Mesh, PerspectiveCamera, Renderer, Scene } from '../core';
import { OrbitControls } from '../extras/orbitcontrols';
import { BoxGeometry, SphereGeometry, WaterDropGeometry } from '../geometries';
import { Color, Vector3 } from '../math';
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
        scene.background = new Color(0xbbddff);

        // camera parameters
        let aspect = canvas.clientWidth / canvas.clientHeight;

        // camera
        const camera = new PerspectiveCamera(70, aspect, 0.01, 128);
        camera.position.set(-12, 12, -12);
        new OrbitControls(camera, canvas);

        // geometry
        const cubeGeometry = new BoxGeometry(1);
        const ballGeometry = new SphereGeometry(0.618);
        const waterDropGeometry = new WaterDropGeometry();

        // program
        const program = renderer.createProgram(vertex, fragment, {
            ambientLightColor: scene.background,
            reverseLightDirection: new Vector3(0, 1, 0),
            fogColor: scene.background,
            fogDensity: 0.06,
        });

        const objects: { mesh: Mesh; rotateAxis: number[] }[] = [];
        for (let i = 0; i < 256; i++) {
            let geometry: BufferGeometry;
            const random = Math.random();
            if (random < 0.33) {
                geometry = cubeGeometry;
            } else if (random < 0.67) {
                geometry = ballGeometry;
            } else {
                geometry = waterDropGeometry;
            }

            const mesh = new Mesh(geometry, program, {
                color: new Color(Math.random() * 0xffffff),
            });

            const x = Math.random() * 32 - 16;
            const y = Math.random() * 32 - 16;
            const z = Math.random() * 32 - 16;
            mesh.position.set(x, y, z);
            mesh.lookAt(0, 0, 0);

            const angle = Math.random() * Math.PI * 2;
            objects.push({
                mesh,
                rotateAxis: new Vector3(Math.cos(angle), Math.sin(angle), 0).applyQuaternion(mesh.quaternion),
            });

            if (geometry instanceof WaterDropGeometry) {
                mesh.rotateZ(angle + Math.PI);
                mesh.scale.setY(1.5);
            }

            mesh.setParent(scene);
        }

        const rotationSpeed = Math.PI * 0.02;

        let then = 0;
        let requestId: number | null = null;

        const render = (now: number) => {
            const angle = rotationSpeed * (now - then) * 0.001;
            then = now;

            objects.forEach(({ mesh, rotateAxis }) => {
                mesh.position.applyAxisAngle(rotateAxis, angle);
                mesh.rotateOnWorldAxis(rotateAxis, angle);
            });

            if (WebGLUtil.resizeCanvasToDisplaySize(canvas)) {
                aspect = canvas.clientWidth / canvas.clientHeight;
                camera.aspect = aspect;
                camera.updateProjectionMatrix();
            }

            renderer.render(scene, camera);

            requestId = requestAnimationFrame(render);
        };

        render(then);

        return function cleanup() {
            if (requestId !== null) {
                cancelAnimationFrame(requestId);
            }
        };
    }, []);

    return [canvasRef] as const;
}

export default function Fog() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
