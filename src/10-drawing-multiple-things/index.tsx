import { useEffect, useRef } from 'react';
import { BufferAttribute, BufferGeometry, Mesh, PerspectiveCamera, Renderer, Scene } from '../core';
import { OrbitControls } from '../extras/orbitcontrols';
import { BoxGeometry, SphereGeometry } from '../geometries';
import { Vector3 } from '../math';
import { WebGLUtil } from '../utils/webglutil';
import basicFragment from './basic.frag';
import pointLightFragment from './pointlight.frag';
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
        const boxgeometry = new BoxGeometry(100);

        const sphereGeometry = new SphereGeometry(50);

        const fGeometry = new BufferGeometry();
        fGeometry.setAttribute('position', new BufferAttribute(new Float32Array(WebGLUtil.getFGeometry()), 3));
        fGeometry.setAttribute('color', new BufferAttribute(new Uint8Array(WebGLUtil.getFColors()), 3, true));
        fGeometry.setAttribute('normal', new BufferAttribute(new Float32Array(WebGLUtil.getFNormals()), 3));

        // program
        const basicProgram = renderer.createProgram(vertex, basicFragment);

        const pointLightProgram = renderer.createProgram(vertex, pointLightFragment, {
            ambientLightColor: [0.1, 0.1, 0.1],
            pointLightPosition: [0, 0, 0],
            specularFactor: 2,
            shininess: 200,
        });

        const objects: { mesh: Mesh; rotateAxis: number[] }[] = [];
        for (let i = 0; i < 256; i++) {
            let mesh: Mesh;
            if (i % 3 === 2) {
                mesh = new Mesh(boxgeometry, basicProgram);
            } else if (i % 3 === 1) {
                mesh = new Mesh(sphereGeometry, basicProgram);
            } else {
                mesh = new Mesh(fGeometry, pointLightProgram);
            }
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
                rotateAxis: new Vector3(Math.cos(angle), Math.sin(angle), 0).applyQuaternion(mesh.quaternion),
            });
        }

        const rotationSpeed = Math.PI * 0.2;

        let then = 0;
        let requestId: number | null = null;

        const render = (now: number) => {
            const angle = rotationSpeed * (now - then) * 0.001;
            then = now;

            objects.forEach(({ mesh, rotateAxis }) => {
                mesh.position.applyAxisAngle(rotateAxis, angle);
                mesh.rotateOnWorldAxis(rotateAxis, angle);
            });

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

export default function DrawingMultipleThings() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
