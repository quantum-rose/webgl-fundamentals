import { useEffect, useRef } from 'react';
import { BufferAttribute, BufferGeometry, Mesh, PerspectiveCamera, Renderer, Scene } from '../core';
import { OrbitControls } from '../extras/orbitcontrols';
import { WebGLUtil } from '../utils/webglutil';
import basicFragment from './basic.frag';
import style from './style.module.css';
import vertex from './vertex.vert';
import vertexColorFragment from './vertexcolor.frag';

function getCameraGeometry() {
    // 首先，让我们添加一个立方体。它的范围是 1 到 3，
    // 因为相机看向的是 -Z 方向，所以我们想要相机在 Z = 0 处开始。
    // 我们会把一个圆锥放到该立方体的前面，
    // 且该圆锥的开口方向朝 -Z 方向。
    const positions = [
        -1,
        -1,
        1, // 立方体的顶点
        1,
        -1,
        1,
        -1,
        1,
        1,
        1,
        1,
        1,
        -1,
        -1,
        3,
        1,
        -1,
        3,
        -1,
        1,
        3,
        1,
        1,
        3,
        0,
        0,
        1, // 圆锥的尖头
    ];
    const indices = [
        0,
        1,
        1,
        3,
        3,
        2,
        2,
        0, // 立方体的索引
        4,
        5,
        5,
        7,
        7,
        6,
        6,
        4,
        0,
        4,
        1,
        5,
        3,
        7,
        2,
        6,
    ];
    // 添加圆锥的片段
    const numSegments = 6;
    const coneBaseIndex = positions.length / 3;
    const coneTipIndex = coneBaseIndex - 1;
    for (let i = 0; i < numSegments; ++i) {
        const u = i / numSegments;
        const angle = u * Math.PI * 2;
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        positions.push(x, y, 0);
        // 从圆锥尖头到圆锥边缘的线段
        indices.push(coneTipIndex, coneBaseIndex + i);
        // 从圆锥边缘一点到圆锥边缘下一点的线段
        indices.push(coneBaseIndex + i, coneBaseIndex + ((i + 1) % numSegments));
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    geometry.setIndex(indices);
    return geometry;
}

function useWebGL() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const eventLayerLeft = useRef<HTMLDivElement | null>(null);
    const eventLayerRight = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;

        // renderer
        const renderer = new Renderer(canvas);
        renderer.setScissorTest(true);

        // scene
        const scene = new Scene();

        let aspect = canvas.clientWidth / 2 / canvas.clientHeight;

        // camera
        const camera = new PerspectiveCamera(70, aspect, 1, 10000);
        camera.position.setZ(200);
        const controls = new OrbitControls(camera, eventLayerLeft.current!);
        (controls as any).name = 1;

        // third camera
        const thirdCamera = new PerspectiveCamera(70, aspect, 1, 10000);
        thirdCamera.position.set(200, 200, 400);
        const thirdControls = new OrbitControls(thirdCamera, eventLayerRight.current!);
        (thirdControls as any).name = 2;

        // F
        const fGeometry = new BufferGeometry();
        fGeometry.setAttribute('position', new BufferAttribute(new Float32Array(WebGLUtil.getFGeometry()), 3));
        fGeometry.setAttribute('normal', new BufferAttribute(new Float32Array(WebGLUtil.getFNormals()), 3));
        fGeometry.setAttribute('color', new BufferAttribute(new Uint8Array(WebGLUtil.getFColors()), 3, true));
        const vertexColorProgram = renderer.createProgram(vertex, vertexColorFragment, {
            ambientLightColor: [0.2, 0.2, 0.2],
            pointLightPosition: [150, 150, 150],
            specularFactor: 2,
            shininess: 200,
        });
        const f = new Mesh(fGeometry, vertexColorProgram);
        f.scale.setY(-1);
        f.position.set(-50, 75, -15);
        f.setParent(scene);

        // Visualizing The Camera
        const cameraGeometry = getCameraGeometry();
        const basicProgram = renderer.createProgram(vertex, basicFragment);
        const cameraMesh = new Mesh(cameraGeometry, basicProgram, {
            color: [1, 1, 1],
        });
        cameraMesh.mode = 'LINES';
        cameraMesh.scale.set(10, 10, 10);
        cameraMesh.setParent(scene);

        let requestId: number | null = null;

        let halfWidth = renderer.drawingBufferWidth / 2;

        const render = () => {
            cameraMesh.up.copy(camera.up);
            cameraMesh.position.copy(camera.position);
            cameraMesh.lookAt(camera.target.clone().sub(camera.position).negate().add(camera.position));

            if (WebGLUtil.resizeCanvasToDisplaySize(canvas)) {
                halfWidth = renderer.drawingBufferWidth / 2;
                aspect = canvas.clientWidth / 2 / canvas.clientHeight;
                camera.aspect = aspect;
                camera.updateProjectionMatrix();
                thirdCamera.aspect = aspect;
                thirdCamera.updateProjectionMatrix();
            }

            renderer.setViewPort(0, 0, halfWidth, canvas.height);
            renderer.setScissor(0, 0, halfWidth, canvas.height);
            renderer.render(scene, camera);

            renderer.setViewPort(halfWidth, 0, halfWidth, canvas.height);
            renderer.setScissor(halfWidth, 0, halfWidth, canvas.height);
            renderer.render(scene, thirdCamera);

            requestId = requestAnimationFrame(render);
        };

        render();

        return function cleanup() {
            if (requestId !== null) {
                cancelAnimationFrame(requestId);
            }
        };
    });

    return [canvasRef, eventLayerLeft, eventLayerRight] as const;
}

export default function VisualizingTheCamera() {
    const [canvasRef, eventLayerLeft, eventLayerRight] = useWebGL();

    return (
        <div className={style['visualizing-the-camera']}>
            <canvas ref={canvasRef} />
            <div ref={eventLayerLeft} className={style['event-layer']}></div>
            <div ref={eventLayerRight} className={style['event-layer']} style={{ left: '50%' }}></div>
        </div>
    );
}
