import { useEffect, useRef } from 'react';
import { Group, Mesh, Object3D, PerspectiveCamera, Renderer, Scene } from '../core';
import { BowlingPinGeometry } from '../extras/bowlingpingeometry';
import { OBJLoader } from '../extras/objloader';
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
        const camera = new PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 1, 1000);
        camera.position.set(0, 0, 16);

        // controls
        const controls = new OrbitControls(camera, canvas);

        const pointLightPosition = new Vector3(20, 20, 20);
        const pointLightRotationAxis = [-1, 0, 1];

        const program = renderer.createProgram(vertex, fragment, {
            ambientLightColor: [0.2, 0.2, 0.2],
            pointLightPosition,
        });

        const bowlingPinGeometry = new BowlingPinGeometry().toLinesGeometry()!;
        const bowlingPin = new Mesh(bowlingPinGeometry, program, {
            specularFactor: 2,
            shininess: 200,
        });
        bowlingPin.mode = 'LINES';
        bowlingPin.scale.set(0.015, -0.015, 0.015);
        bowlingPin.position.set(-5, 3, 0);
        bowlingPin.setParent(scene);

        let cube: Object3D | undefined;
        let chair: Object3D | undefined;
        let book: Object3D | undefined;

        const rotationSpeed = Math.PI * 0.1;

        let then = 0;
        let requestId: number | null = null;

        const render = (now: number) => {
            const angle = rotationSpeed * (now - then) * 0.001;
            then = now;

            pointLightPosition.applyAxisAngle(pointLightRotationAxis, angle);

            bowlingPin.rotateY(angle);

            if (cube) {
                cube.rotateY(angle);
            }

            if (chair) {
                chair.rotateY(angle);
            }

            if (book) {
                book.rotateY(angle);
            }

            renderer.render(scene, camera);

            requestId = requestAnimationFrame(render);
        };

        render(then);

        // 立方体
        const cubeLoader = new OBJLoader();
        cubeLoader.load('./cube.obj').then(geometries => {
            cube = new Group();
            geometries.forEach(geometry => {
                const mesh = new Mesh(geometry.toLinesGeometry()!, program, {
                    specularFactor: 20,
                    shininess: 100,
                });
                mesh.mode = 'LINES';
                mesh.setParent(cube!);
            });
            cube.position.set(5, -1, 0);
            cube.setParent(scene);
        });

        // 椅子
        const chairLoader = new OBJLoader();
        chairLoader.load('./chair.obj').then(geometries => {
            chair = new Group();
            geometries.forEach(geometry => {
                const mesh = new Mesh(geometry.toLinesGeometry()!, program, {
                    specularFactor: 2,
                    shininess: 200,
                });
                mesh.mode = 'LINES';
                mesh.setParent(chair!);
            });
            chair.position.setY(-3.5);
            chair.setParent(scene);
        });

        // 书
        const bookLoader = new OBJLoader();
        bookLoader.load('./book.obj').then(geometries => {
            book = new Group();
            geometries.forEach(geometry => {
                const mesh = new Mesh(geometry.toLinesGeometry()!, program, {
                    specularFactor: 0,
                    shininess: 1,
                });
                mesh.mode = 'LINES';
                mesh.setParent(book!);
            });
            book.scale.set(5, 5, 5);
            book.position.set(5, 2, 0);
            book.setParent(scene);
        });

        return function cleanup() {
            if (requestId !== null) {
                cancelAnimationFrame(requestId);
            }
        };
    });

    return [canvasRef] as const;
}

export default function MeshModel() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
