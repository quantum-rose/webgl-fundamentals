import { useEffect, useRef } from 'react';
import { BufferAttribute, BufferGeometry, Group, Mesh, PerspectiveCamera, Renderer, RenderTarget, Scene, Texture } from '../core';
import { CheckerboardTexture } from '../extras/checkerboardtexture';
import { OrbitControls } from '../extras/orbitcontrols';
import { BowlingPinGeometry, BoxGeometry, PlaneGeometry, SphereGeometry } from '../geometries';
import { Color, Matrix4, Vector3 } from '../math';
import { WebGLUtil } from '../utils/webglutil';
import depthFragment from './depth.frag';
import depthVertex from './depth.vert';
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

        const depthRenderTarget = new RenderTarget(1000, 1000, true);

        const ambientLightColor = new Color(0x080808);
        const spotLightColor = new Color(0xbbddff);
        const spotLightPosition = new Vector3(10, 10, 10);
        const spotLightDirection = new Vector3(-10, -10, -10);
        const angle = 15;
        const rad = (angle * Math.PI) / 180;
        const spotLightInnerLimit = Math.cos(0.95 * rad);
        const spotLightOuterLimit = Math.cos(rad);
        const spotLightCamera = new PerspectiveCamera(2 * angle, depthRenderTarget.width / depthRenderTarget.height, 1, 1000);
        spotLightCamera.position.copy(spotLightPosition);
        spotLightCamera.lookAt(spotLightDirection);
        spotLightCamera.updateMatrixWorld();

        // camera parameters
        let aspect = canvas.clientWidth / canvas.clientHeight;

        // camera
        const camera = new PerspectiveCamera(35, aspect, 1, 1000);
        camera.position.set(12, 3, 6);
        new OrbitControls(camera, canvas);

        // texture
        const texture = new CheckerboardTexture(14, 14);
        const uvGrid = new Texture('./uv-grid.png');

        // program
        const depthProgram = renderer.createProgram(depthVertex, depthFragment);

        const program = renderer.createProgram(vertex, fragment, {
            ambientLightColor,
            spotLightColor,
            spotLightPosition,
            spotLightDirection,
            spotLightInnerLimit,
            spotLightOuterLimit,
            specularFactor: 0.05,
            shininess: 100,
            map: texture,
            shadowMatrix: new Matrix4()
                .copy(spotLightCamera.projectionMatrix)
                .multiply(spotLightCamera.matrixWorldInverse)
                .scale(0.5, 0.5, 0.5)
                .translate(0.5, 0.5, 0.5),
            shadowMap: depthRenderTarget.texture,
        });

        // geometry
        const faceGeometry = new PlaneGeometry(14, 14);
        const cubeGeometry = new BoxGeometry(1);
        const ballGeometry = new SphereGeometry(0.707, 64, 32);
        const bowlingPinGeometry = new BowlingPinGeometry(128, 32);
        const fGeometry = new BufferGeometry();
        fGeometry.setAttribute('position', new BufferAttribute(new Float32Array(WebGLUtil.getFGeometry()), 3));
        fGeometry.setAttribute('normal', new BufferAttribute(new Float32Array(WebGLUtil.getFNormals()), 3));
        fGeometry.setAttribute('uv', new BufferAttribute(new Float32Array(WebGLUtil.getFTexcoords()), 2));

        const ground = new Mesh(faceGeometry, program);
        ground.rotateX(-Math.PI / 2);
        ground.position.set(0, -3, 2);
        ground.setParent(scene);

        const backWall = new Mesh(faceGeometry, program);
        backWall.position.set(0, 4, -5);
        backWall.setParent(scene);

        const leftWall = new Mesh(faceGeometry, program);
        leftWall.rotateY(Math.PI / 2);
        leftWall.position.set(-7, 4, 2);
        leftWall.setParent(scene);

        const cube = new Mesh(cubeGeometry, program, {
            map: uvGrid,
        });
        cube.position.setY(1.2);
        cube.setParent(scene);

        const ball = new Mesh(ballGeometry, program, {
            map: uvGrid,
        });
        ball.position.setY(-1.5);
        ball.setParent(scene);

        const bowlingPin = new Group();
        bowlingPin.position.set(2, -3, -2);
        bowlingPin.setParent(scene);
        const bowlingPinMesh = new Mesh(bowlingPinGeometry, program, {
            map: uvGrid,
        });
        bowlingPinMesh.scale.set(0.01, -0.01, 0.01);
        bowlingPinMesh.position.setY(3.7);
        bowlingPinMesh.setParent(bowlingPin);

        const f = new Group();
        f.position.set(-1, -3, 2.5);
        f.setParent(scene);
        const fMesh = new Mesh(fGeometry, program, {
            map: uvGrid,
        });
        fMesh.scale.set(0.02, -0.02, 0.02);
        fMesh.position.set(-0.3, 3, -0.3);
        fMesh.setParent(f);

        const rotationSpeed = Math.PI * 0.2;

        let then = 0;
        let requestId: number | null = null;

        const render = (now: number) => {
            const angle = rotationSpeed * (now - then) * 0.001;
            const p = Math.sin(now * 0.001);
            then = now;

            cube.rotateZ(2 * angle);
            const a = 2 * p;
            ball.position.setX(a);
            ball.position.setZ(a);
            f.rotateY(-2 * angle);
            const s = Math.abs(p) + 0.1;
            bowlingPin.scale.set(s, s, s);

            spotLightPosition.applyAxisAngle([0, 1, 0], angle);
            spotLightDirection.copy(spotLightPosition).negate();
            spotLightCamera.position.copy(spotLightPosition);
            spotLightCamera.lookAt(spotLightDirection);

            if (WebGLUtil.resizeCanvasToDisplaySize(canvas)) {
                aspect = canvas.clientWidth / canvas.clientHeight;
                camera.aspect = aspect;
                camera.updateProjectionMatrix();
            }

            // 绘制到深度纹理
            scene.overrideProgram = depthProgram;
            renderer.setViewPort(0, 0, depthRenderTarget.width, depthRenderTarget.height);
            renderer.render(scene, spotLightCamera, depthRenderTarget);

            // 绘制到屏幕
            program.uniforms.shadowMatrix
                .copy(spotLightCamera.projectionMatrix)
                .multiply(spotLightCamera.matrixWorldInverse)
                .scale(0.5, 0.5, 0.5)
                .translate(0.5, 0.5, 0.5);
            scene.overrideProgram = null;
            renderer.setViewPort(0, 0, renderer.drawingBufferWidth, renderer.drawingBufferHeight);
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

export default function Shadows() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
