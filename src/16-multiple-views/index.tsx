import { useEffect, useMemo, useRef } from 'react';
import { BufferAttribute, BufferGeometry, Group, Mesh, Object3D, PerspectiveCamera, Renderer, Scene } from '../core';
import { BoxGeometry, SphereGeometry, WaterDropGeometry } from '../geometries';
import { BowlingPinGeometry } from '../geometries/bowlingpingeometry';
import { Color, Vector3 } from '../math';
import { WebGLUtil } from '../utils/webglutil';
import fragment from './fragment.frag';
import style from './style.module.css';
import vertex from './vertex.vert';

interface IItem {
    object: Object3D;
    element: HTMLDivElement;
    background: Color;
}

function useWebGL() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const viewRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current!;
        let canvasBound = canvas.getBoundingClientRect();
        const scrollContainer = scrollContainerRef.current!;

        // renderer
        const renderer = new Renderer(canvas);
        renderer.setScissorTest(true);

        // scene
        const scene = new Scene();
        scene.background = new Color('white');

        // camera
        const camera = new PerspectiveCamera(35, 1, 0.01, 100);
        camera.position.setZ(4);

        const pointLightPosition = new Vector3(10, 10, 10);
        const program = renderer.createProgram(vertex, fragment, {
            ambientLightColor: [0.5, 0.5, 0.5],
            pointLightPosition,
            specularFactor: 2,
            shininess: 200,
        });

        // 方块
        const cubeGeometry = new BoxGeometry(1);
        const cube = new Mesh(cubeGeometry, program);
        cube.setParent(scene);

        // 球
        const ballGeometry = new SphereGeometry(2 ** 0.5 * 0.5);
        const ball = new Mesh(ballGeometry, program);
        ball.position.setX(4);
        ball.setParent(scene);

        // 保龄球瓶
        const bowlingPin = new Group();
        bowlingPin.rotateZ(-Math.PI / 4);
        bowlingPin.position.setX(8);
        bowlingPin.setParent(scene);
        const bowlingPinGeometry = new BowlingPinGeometry();
        const bowlingPinMesh = new Mesh(bowlingPinGeometry, program);
        bowlingPinMesh.position.setY(-1);
        bowlingPinMesh.setParent(bowlingPin);

        // F
        const f = new Group();
        f.position.setX(12);
        f.setParent(scene);
        const fGeometry = new BufferGeometry();
        fGeometry.setAttribute('position', new BufferAttribute(new Float32Array(WebGLUtil.getFGeometry()), 3));
        fGeometry.setAttribute('normal', new BufferAttribute(new Float32Array(WebGLUtil.getFNormals()), 3));
        const fMesh = new Mesh(fGeometry, program);
        fMesh.scale.set(0.01, -0.01, 0.01);
        fMesh.position.set(-0.5, 0.75, -0.15);
        fMesh.setParent(f);

        // 水滴
        const waterDrop = new Group();
        waterDrop.rotateZ(Math.PI / 4);
        waterDrop.position.setX(16);
        waterDrop.setParent(scene);
        const waterDropGeometry = new WaterDropGeometry();
        const waterDropMesh = new Mesh(waterDropGeometry, program);
        waterDropMesh.position.setY(-0.2);
        waterDropMesh.scale.set(1.2, 1.2, 1.2);
        waterDropMesh.setParent(waterDrop);

        const objects = [cube, ball, bowlingPin, f, waterDrop] as const;
        const items: IItem[] = viewRefs.current.map(item => {
            return {
                object: objects[Math.floor(Math.random() * 5)],
                element: item!,
                background: new Color(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)),
            };
        });

        const rotationAxis = new Vector3(1, 0, -1).normalize();
        const rotationSpeed = Math.PI * 0.2;

        let then = 0;
        let requestId: number | null = null;

        const render = (now: number) => {
            const angle = rotationSpeed * (now - then) * 0.001;
            then = now;
            canvas.style.transform = `translate(${scrollContainer.scrollLeft}px, ${scrollContainer.scrollTop}px)`;

            pointLightPosition.applyAxisAngle(rotationAxis, angle);

            cube.rotateOnAxis(rotationAxis, angle);
            ball.rotateOnAxis(rotationAxis, angle);
            bowlingPin.rotateY(angle);
            f.rotateY(angle);
            waterDrop.rotateY(angle);

            if (WebGLUtil.resizeCanvasToDisplaySize(canvas)) {
                canvasBound = canvas.getBoundingClientRect();
            }

            items.forEach(({ object, element, background }) => {
                const rect = element.getBoundingClientRect();
                if (rect.bottom < canvasBound.top || rect.top > canvasBound.bottom || rect.right < canvasBound.left || rect.left > canvasBound.right) {
                    return;
                }
                const width = rect.right - rect.left;
                const height = rect.bottom - rect.top;
                const left = rect.left - canvasBound.left;
                const bottom = canvasBound.bottom - rect.bottom;

                renderer.setViewPort(left, bottom, width, height);
                renderer.setScissor(left, bottom, width, height);
                scene.background = background;
                camera.position.setX(object.position.x);
                renderer.render(scene, camera);
            });

            requestId = requestAnimationFrame(render);
        };

        render(then);

        return function cleanup() {
            if (requestId !== null) {
                cancelAnimationFrame(requestId);
            }
        };
    });

    return [canvasRef, scrollContainerRef, viewRefs] as const;
}

export default function MultipleViews() {
    const [canvasRef, scrollContainerRef, viewRefs] = useWebGL();

    const items = useMemo(() => {
        const array: string[] = [];
        for (let i = 0; i < 100; i++) {
            array.push(`item ${i + 1}`);
        }
        return array;
    }, undefined);

    return (
        <div ref={scrollContainerRef} className={style['multiple-views']}>
            <canvas ref={canvasRef} className={style['canvas']} />
            <div className={style['content']}>
                {items.map((item, i) => (
                    <div key={item} className={style['item']}>
                        <div
                            ref={ref => {
                                viewRefs.current[i] = ref;
                            }}
                            className={style['view']}
                        ></div>
                        <div className={style['label']}>{item}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
