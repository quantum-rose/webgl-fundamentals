import { useEffect, useRef, useState } from 'react';
import Slider from '../components/slider';
import { Mesh, PerspectiveCamera, Renderer, Scene, Texture } from '../core';
import { ClipSpaceCubeGeometry } from '../extras/clipspacecubegeometry';
import { OrbitControls } from '../extras/orbitcontrols';
import { PlaneGeometry } from '../extras/planegeometry';
import { SphereGeometry } from '../extras/spheregeometry';
import { Color, Matrix4 } from '../math';
import { WebGLUtil } from '../utils/webglutil';
import clipSpaceCubeVertex from './clipspacecube.vert';
import fragment from './fragment.frag';
import pureFragment from './pure.frag';
import style from './style.module.css';
import vertex from './vertex.vert';

function useWebGL(fov: number, near: number, far: number) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const projectorView = useRef<HTMLDivElement | null>(null);
    const view = useRef<HTMLDivElement | null>(null);

    const projectorRef = useRef<PerspectiveCamera | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;

        // renderer
        const renderer = new Renderer(canvas);
        renderer.autoClear = false;

        // scene
        const scene = new Scene();

        // camera parameters
        let aspect = canvas.clientWidth / 2 / canvas.clientHeight;

        // camera
        const camera = new PerspectiveCamera(70, aspect, 0.1, 1000);
        camera.position.set(-3, 12, 18);
        camera.lookAt(0, 1, 0);
        new OrbitControls(camera, view.current!);

        // projector
        const projector = new PerspectiveCamera(fov, aspect, near, far);
        projectorRef.current = projector;
        projector.position.set(4.242, 12, 0);
        projector.up.set(0, 0, -1);
        new OrbitControls(projector, projectorView.current!);

        // texture
        const texture = new Texture(
            new Uint8Array([
                0xff, 0xcc, 0xff, 0xcc, 0xff, 0xcc, 0xff, 0xcc, 0xcc, 0xff, 0xcc, 0xff, 0xcc, 0xff, 0xcc, 0xff, 0xff, 0xcc, 0xff, 0xcc, 0xff, 0xcc, 0xff, 0xcc,
                0xcc, 0xff, 0xcc, 0xff, 0xcc, 0xff, 0xcc, 0xff, 0xff, 0xcc, 0xff, 0xcc, 0xff, 0xcc, 0xff, 0xcc, 0xcc, 0xff, 0xcc, 0xff, 0xcc, 0xff, 0xcc, 0xff,
                0xff, 0xcc, 0xff, 0xcc, 0xff, 0xcc, 0xff, 0xcc, 0xcc, 0xff, 0xcc, 0xff, 0xcc, 0xff, 0xcc, 0xff,
            ]),
            8,
            8
        );
        texture.format = 'LUMINANCE';
        texture.internalformat = 'LUMINANCE';
        texture.magFilter = 'NEAREST';

        const projectedTexture = new Texture('./uv-grid.png');
        projectedTexture.magFilter = 'NEAREST';

        // program
        const program = renderer.createProgram(vertex, fragment, {
            ambientLightColor: [0.2, 0.2, 0.2],
            pointLightPosition: [150, 150, 150],
            map: texture,
            projectedMatrix: new Matrix4(),
            projectedMap: projectedTexture,
            projectedMapOpacity: 1,
        });

        const clipSpaceCubeProgram = renderer.createProgram(clipSpaceCubeVertex, pureFragment, {
            matrix: new Matrix4(),
            color: [1, 0, 0],
        });

        // ground
        const groundGeometry = new PlaneGeometry(20, 20);
        groundGeometry.rotateX(-Math.PI / 2);
        const ground = new Mesh(groundGeometry, program, {
            specularFactor: 0.1,
            shininess: 100,
            colorMult: new Color('skyblue'),
        });
        ground.side = 'DOUBLE';
        ground.setParent(scene);

        // ball
        const ballGeometry = new SphereGeometry(1, 64, 32);
        const ball = new Mesh(ballGeometry, program, {
            specularFactor: 0.5,
            shininess: 200,
            colorMult: new Color('pink'),
        });
        ball.position.setY(3);
        ball.setParent(scene);

        // 视锥体
        const clipSpaceCubeGeometry = new ClipSpaceCubeGeometry();
        const clipSpaceCube = new Mesh(clipSpaceCubeGeometry, clipSpaceCubeProgram);
        clipSpaceCube.mode = 'LINES';
        clipSpaceCube.setParent(scene);

        let requestId: number | null = null;

        let halfWidth = renderer.drawingBufferWidth / 2;

        const render = () => {
            if (WebGLUtil.resizeCanvasToDisplaySize(canvas)) {
                halfWidth = renderer.drawingBufferWidth / 2;
                aspect = canvas.clientWidth / 2 / canvas.clientHeight;
                camera.aspect = aspect;
                camera.updateProjectionMatrix();
                projector.aspect = aspect;
                projector.updateProjectionMatrix();
            }

            projector.updateMatrixWorld();
            program.uniforms.projectedMatrix
                .copy(projector.projectionMatrix)
                .multiply(projector.matrixWorldInverse)
                .scale(0.5, 0.5, 0.5)
                .translate(0.5, 0.5, 0.5);
            clipSpaceCubeProgram.uniforms.matrix.copy(projector.projectionMatrix).multiply(projector.matrixWorldInverse).invert();

            renderer.clear();

            clipSpaceCube.visible = false;
            program.uniforms.projectedMapOpacity = 0.3;
            renderer.setViewPort(0, 0, halfWidth, canvas.height);
            renderer.render(scene, projector);

            clipSpaceCube.visible = true;
            program.uniforms.projectedMapOpacity = 1;
            renderer.setViewPort(halfWidth, 0, halfWidth, canvas.height);
            renderer.render(scene, camera);

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
        const projector = projectorRef.current;
        if (projector) {
            projector.fov = fov;
            projector.near = near;
            projector.far = far;
            projector.updateProjectionMatrix();
        }
    }, [fov, near, far]);

    return [canvasRef, projectorView, view] as const;
}

export default function PlanarProjectionMapping() {
    const [fov, setPerspCamFov] = useState(15);
    const [near, setPerspCamNear] = useState(1);
    const [far, setPerspCamFar] = useState(30);

    const [canvasRef, projectorView, view] = useWebGL(fov, near, far);

    return (
        <div className={style['planar-projection-mapping']}>
            <canvas ref={canvasRef} />
            <div ref={projectorView} className={style['projector-view']}></div>
            <div ref={view} className={style['view']}></div>
            <div className={style['controls-wrapper']}>
                <div className={style['controls']}>
                    <Slider label='fov' min={1} max={179} value={fov} step={0.1} onChange={v => setPerspCamFov(v)} />
                    <Slider label='near' min={0.1} max={far - 0.1} step={0.1} value={near} onChange={v => setPerspCamNear(v)} />
                    <Slider label='far' min={near + 0.1} max={100} step={0.1} value={far} onChange={v => setPerspCamFar(v)} />
                </div>
            </div>
        </div>
    );
}
