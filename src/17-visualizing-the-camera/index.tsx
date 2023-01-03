import { useEffect, useRef, useState } from 'react';
import Slider from '../components/slider';
import { BufferAttribute, BufferGeometry, Mesh, OrthographicCamera, PerspectiveCamera, Renderer, Scene } from '../core';
import { CameraGeometry } from '../extras/camerageometry';
import { ClipSpaceCubeGeometry } from '../extras/clipspacecubegeometry';
import { OrbitControls } from '../extras/orbitcontrols';
import { Matrix4 } from '../math';
import { WebGLUtil } from '../utils/webglutil';
import clipSpaceCubeVertex from './clipspacecube.vert';
import pureFragment from './pure.frag';
import style from './style.module.css';
import vertex from './vertex.vert';
import vertexColorFragment from './vertexcolor.frag';

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
        const cameraGeometry = new CameraGeometry();
        const cameraProgram = renderer.createProgram(vertex, pureFragment, {
            color: [1, 1, 1],
        });
        const cameraMesh = new Mesh(cameraGeometry, cameraProgram);
        cameraMesh.mode = 'LINES';
        cameraMesh.scale.set(10, 10, 10);
        cameraMesh.setParent(scene);

        // 视锥体
        const clipSpaceCubeGeometry = new ClipSpaceCubeGeometry();
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
