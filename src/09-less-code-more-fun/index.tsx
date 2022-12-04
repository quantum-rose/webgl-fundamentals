import { useEffect, useRef } from 'react';
import { BufferAttribute, BufferGeometry, Mesh, OrbitControls, PerspectiveCamera, Renderer, Scene } from '../core';
import { Vector3 } from '../math';
import { WebGLUtils } from '../utils/webglutils';
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
        const camera = new PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 1, 10000);
        camera.position.set(0, 0, 2000);
        camera.position.applyAxisAngle([0, 1, 0], Math.PI / 6);
        camera.position.applyAxisAngle([1, 0, 0], -Math.PI / 6);

        // controls
        const controls = new OrbitControls(camera, canvas);

        // geometry
        const fGeometry = new BufferGeometry();
        fGeometry.setAttribute('position', new BufferAttribute(new Float32Array(WebGLUtils.getFGeometry()), 3));
        fGeometry.setAttribute('color', new BufferAttribute(new Uint8Array(WebGLUtils.getFColors()), 3, true));
        fGeometry.setAttribute('normal', new BufferAttribute(new Float32Array(WebGLUtils.getFNormals()), 3));

        // program
        const program = renderer.createProgram(vertex, fragment, {
            ambientLightColor: [0.1, 0.1, 0.1],
            pointLightPosition: [0, 0, 0],
            specularFactor: 2,
            shininess: 200,
        });

        const objects: { mesh: Mesh; rotateAxis: number[] }[] = [];
        for (let i = 0; i < 256; i++) {
            const mesh = new Mesh(fGeometry, program);
            mesh.scale.setY(-1);
            const x = Math.random() * 2000 - 1000;
            const y = Math.random() * 2000 - 1000;
            const z = Math.random() * 2000 - 1000;
            mesh.position.set(x, y, z);
            mesh.lookAt(0, 0, 0);
            mesh.rotateZ(Math.random() * Math.PI * 2);
            mesh.setParent(scene);
            const angle = Math.random() * Math.PI * 2;
            objects.push({
                mesh,
                rotateAxis: new Vector3(Math.cos(angle), Math.sin(angle), 0).applyMatrix4(mesh.matrixWorld).sub(mesh.position).normalize(),
            });
        }

        let requestId: number | null = null;

        const render = () => {
            objects.forEach(({ mesh, rotateAxis }) => {
                mesh.position.applyAxisAngle(rotateAxis, 0.008);
                mesh.rotateOnWorldAxis(rotateAxis, 0.008);
            });

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

export default function LessCodeMoreFun() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
