import { useEffect, useRef, useState } from 'react';
import Slider from '../components/slider';
import { BufferAttribute, BufferGeometry, Mesh, OrthographicCamera, PerspectiveCamera, Renderer, Scene } from '../core';
import { OrbitControls } from '../extras/orbitcontrols';
import { Matrix4 } from '../math';
import { WebGLUtil } from '../utils/webglutil';
import clipSpaceCubeVertex from './clipspacecube.vert';
import pureFragment from './pure.frag';
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

function getClipSpaceCubeGeometry() {
    const positions = [
        -1,
        -1,
        -1, // 立方体的顶点
        1,
        -1,
        -1,
        -1,
        1,
        -1,
        1,
        1,
        -1,
        -1,
        -1,
        1,
        1,
        -1,
        1,
        -1,
        1,
        1,
        1,
        1,
        1,
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

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    geometry.setIndex(indices);
    return geometry;
}

function useWebGL(orthoNear: number, orthoFar: number, perspFov: number, perspNear: number, perspFar: number) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const orthoCamView = useRef<HTMLDivElement | null>(null);
    const orthoCamThirdView = useRef<HTMLDivElement | null>(null);
    const perspCamView = useRef<HTMLDivElement | null>(null);
    const perspCamThirdView = useRef<HTMLDivElement | null>(null);

    const orthoCamRef = useRef<OrthographicCamera | null>(null);
    const perspCamRef = useRef<PerspectiveCamera | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;

        // renderer
        const renderer = new Renderer(canvas);
        renderer.autoClear = false;

        // scene
        const scene = new Scene();

        // camera parameters
        let aspect = canvas.clientWidth / canvas.clientHeight;
        let halfH = 120;
        let halfW = halfH * aspect;

        // orthographic camera
        const orthoCam = new OrthographicCamera(-halfW, halfW, halfH, -halfH, orthoNear, orthoFar);
        orthoCamRef.current = orthoCam;
        orthoCam.position.set(0, 0, 400);
        new OrbitControls(orthoCam, orthoCamView.current!);

        // orthographic third view camera
        const orthoThirdViewCam = new PerspectiveCamera(70, aspect, 1, 100000);
        orthoThirdViewCam.position.set(450, 300, 600);
        new OrbitControls(orthoThirdViewCam, orthoCamThirdView.current!);

        // perspective camera
        const perspCam = new PerspectiveCamera(perspFov, aspect, perspNear, perspFar);
        perspCamRef.current = perspCam;
        perspCam.position.setZ(400);
        new OrbitControls(perspCam, perspCamView.current!);

        // perspective third view camera
        const perspThirdViewCam = new PerspectiveCamera(70, aspect, 1, 100000);
        perspThirdViewCam.position.set(450, 300, 600);
        new OrbitControls(perspThirdViewCam, perspCamThirdView.current!);

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

        // 相机
        const cameraGeometry = getCameraGeometry();
        const cameraProgram = renderer.createProgram(vertex, pureFragment, {
            color: [1, 1, 1],
        });
        const cameraMesh = new Mesh(cameraGeometry, cameraProgram);
        cameraMesh.mode = 'LINES';
        cameraMesh.scale.set(10, 10, 10);
        cameraMesh.setParent(scene);

        // 视锥体
        const clipSpaceCubeGeometry = getClipSpaceCubeGeometry();
        const clipSpaceCubeProgram = renderer.createProgram(clipSpaceCubeVertex, pureFragment, {
            color: [1, 0, 0],
        });
        const clipSpaceCube = new Mesh(clipSpaceCubeGeometry, clipSpaceCubeProgram, {
            matrix: new Matrix4(),
        });
        clipSpaceCube.mode = 'LINES';
        clipSpaceCube.setParent(scene);

        let requestId: number | null = null;

        // viewport parameters
        let halfWidth = renderer.drawingBufferWidth / 2;
        let halfHeight = renderer.drawingBufferHeight / 2;

        const render = () => {
            if (WebGLUtil.resizeCanvasToDisplaySize(canvas)) {
                // 更新 viewport 参数
                halfWidth = renderer.drawingBufferWidth / 2;
                halfHeight = renderer.drawingBufferHeight / 2;

                // 更新相机参数
                aspect = canvas.clientWidth / canvas.clientHeight;
                halfW = halfH * aspect;

                orthoCam.left = -halfW;
                orthoCam.right = halfW;
                orthoCam.top = halfH;
                orthoCam.bottom = -halfH;
                orthoCam.updateProjectionMatrix();

                orthoThirdViewCam.aspect = aspect;
                orthoThirdViewCam.updateProjectionMatrix();

                perspCam.aspect = aspect;
                perspCam.updateProjectionMatrix();

                perspThirdViewCam.aspect = aspect;
                perspThirdViewCam.updateProjectionMatrix();
            }

            renderer.clear();

            cameraMesh.visible = false;
            clipSpaceCube.visible = false;

            // 正交相机视角
            renderer.setViewPort(0, halfHeight, halfWidth, halfHeight);
            renderer.render(scene, orthoCam);

            // 透视相机视角
            renderer.setViewPort(0, 0, halfWidth, halfHeight);
            renderer.render(scene, perspCam);

            cameraMesh.visible = true;
            clipSpaceCube.visible = true;

            // 正交相机第三视角
            cameraMesh.position.copy(orthoCam.position);
            cameraMesh.quaternion.copy(orthoCam.quaternion);
            clipSpaceCube.uniforms.matrix.copy(orthoCam.projectionMatrix).multiply(orthoCam.matrixWorldInverse).invert();
            renderer.setViewPort(halfWidth, halfHeight, halfWidth, halfHeight);
            renderer.render(scene, orthoThirdViewCam);

            // 透视相机第三视角
            cameraMesh.position.copy(perspCam.position);
            cameraMesh.quaternion.copy(perspCam.quaternion);
            clipSpaceCube.uniforms.matrix.copy(perspCam.projectionMatrix).multiply(perspCam.matrixWorldInverse).invert();
            renderer.setViewPort(halfWidth, 0, halfWidth, halfHeight);
            renderer.render(scene, perspThirdViewCam);

            requestId = requestAnimationFrame(render);
        };

        render();

        return function cleanup() {
            if (requestId !== null) {
                cancelAnimationFrame(requestId);
            }
        };
    }, []);

    useEffect(() => {
        const orthoCam = orthoCamRef.current;
        if (orthoCam) {
            orthoCam.near = orthoNear;
            orthoCam.far = orthoFar;
            orthoCam.updateProjectionMatrix();
        }
    }, [orthoNear, orthoFar]);

    useEffect(() => {
        const perspCam = perspCamRef.current;
        if (perspCam) {
            perspCam.fov = perspFov;
            perspCam.near = perspNear;
            perspCam.far = perspFar;
            perspCam.updateProjectionMatrix();
        }
    }, [perspFov, perspNear, perspFar]);

    return [canvasRef, orthoCamView, orthoCamThirdView, perspCamView, perspCamThirdView] as const;
}

export default function VisualizingTheCamera() {
    const [orthoNear, setOrthoNear] = useState(100);
    const [orthoFar, setOrthoFar] = useState(800);
    const [perspFov, setPerspCamFov] = useState(35);
    const [perspNear, setPerspCamNear] = useState(30);
    const [perspFar, setPerspCamFar] = useState(600);

    const [canvasRef, orthoCamView, orthoCamThirdView, perspCamView, perspCamThirdView] = useWebGL(orthoNear, orthoFar, perspFov, perspNear, perspFar);

    return (
        <div className={style['visualizing-the-camera']}>
            <canvas ref={canvasRef} />
            <div className={style['orthographic-camera']}>
                <div ref={orthoCamView} className={style['view']} />
                <div ref={orthoCamThirdView} className={style['third-view']} />
                <div className={style['controls-wrapper']}>
                    <div className={style['controls']}>
                        <Slider label='near' min={1} max={orthoFar - 1} value={orthoNear} onChange={v => setOrthoNear(v)} />
                        <Slider label='far' min={orthoNear + 1} max={1000} value={orthoFar} onChange={v => setOrthoFar(v)} />
                    </div>
                </div>
            </div>
            <div className={style['perspective-camera']}>
                <div ref={perspCamView} className={style['view']} />
                <div ref={perspCamThirdView} className={style['third-view']} />
                <div className={style['controls-wrapper']}>
                    <div className={style['controls']}>
                        <Slider label='fov' min={1} max={179} value={perspFov} onChange={v => setPerspCamFov(v)} />
                        <Slider label='near' min={1} max={perspFar - 1} value={perspNear} onChange={v => setPerspCamNear(v)} />
                        <Slider label='far' min={perspNear + 1} max={1000} value={perspFar} onChange={v => setPerspCamFar(v)} />
                    </div>
                </div>
            </div>
        </div>
    );
}
