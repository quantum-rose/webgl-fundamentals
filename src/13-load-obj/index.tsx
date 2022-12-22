import { useEffect, useRef } from 'react';
import { Group, Mesh, Object3D, PerspectiveCamera, Renderer, Scene, Texture } from '../core';
import { OBJLoader } from '../extras/objloader';
import { OrbitControls } from '../extras/orbitcontrols';
import { Vector3 } from '../math';
import fragment from './fragment.frag';
import vertex from './vertex.vert';
import vertexColorFragment from './vertexcolor.frag';

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
        camera.position.set(0, 0, 8);

        // controls
        const controls = new OrbitControls(camera, canvas);

        const pointLightPosition = new Vector3(20, 20, 20);
        const pointLightRotationAxis = [-1, 0, 1];

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

        const uvGrid = new Texture('./uv-grid.png');
        const textureProgram = renderer.createProgram(vertex, fragment, {
            ambientLightColor: [0.2, 0.2, 0.2],
            pointLightPosition,
            uvGrid: uvGrid,
        });

        const vertexColorProgram = renderer.createProgram(vertex, vertexColorFragment, {
            ambientLightColor: [0.2, 0.2, 0.2],
            pointLightPosition,
            specularFactor: 0,
            shininess: 1,
        });

        // 立方体
        const cubeLoader = new OBJLoader();
        cubeLoader.load('./cube.obj').then(geometries => {
            cube = new Group();
            geometries.forEach(geometry => {
                const mesh = new Mesh(geometry, textureProgram, {
                    specularFactor: 20,
                    shininess: 100,
                });
                mesh.setParent(cube!);
            });
            cube.position.setX(-5);
            cube.setParent(scene);
        });

        // 椅子
        const chairLoader = new OBJLoader();
        chairLoader.load('./chair.obj').then(geometries => {
            chair = new Group();
            geometries.forEach(geometry => {
                const mesh = new Mesh(geometry, textureProgram, {
                    specularFactor: 2,
                    shininess: 200,
                });
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
                const mesh = new Mesh(geometry, vertexColorProgram);
                mesh.setParent(book!);
            });
            book.scale.set(5, 5, 5);
            book.position.setX(5);
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

export default function LoadOBJ() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
