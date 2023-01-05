import { useEffect, useRef } from 'react';
import { Mesh, PerspectiveCamera, Renderer, RenderTarget, Scene, Texture } from '../core';
import { BoxGeometry } from '../extras/boxgeometry';
import { OrbitControls } from '../extras/orbitcontrols';
import { Color } from '../math';
import { WebGLUtil } from '../utils/webglutil';
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

        // camera parameters
        let aspect = canvas.clientWidth / canvas.clientHeight;

        // camera
        const camera = new PerspectiveCamera(70, aspect, 0.1, 1000);
        camera.position.setZ(3);
        new OrbitControls(camera, canvas);

        // texture
        const texture = new Texture('./uv-grid.png');
        texture.magFilter = 'NEAREST';

        const renderTarget = new RenderTarget(1000, 1000);

        // geometry
        const cubeGeometry = new BoxGeometry(1);

        // program
        const program = renderer.createProgram(vertex, fragment, {
            ambientLightColor: [0.2, 0.2, 0.2],
            pointLightPosition: [15, 15, 15],
            specularFactor: 0.1,
            shininess: 100,
            map: texture,
        });

        // cubes
        const cube1 = new Mesh(cubeGeometry, program, {
            colorMult: new Color('pink'),
        });
        cube1.position.setX(-1);
        cube1.rotateZ(Math.PI / 4);
        cube1.setParent(scene);

        const cube2 = new Mesh(cubeGeometry, program, {
            colorMult: new Color('yellow'),
        });
        cube2.rotateY(Math.PI / 4);
        cube2.setParent(scene);

        const cube3 = new Mesh(cubeGeometry, program, {
            colorMult: new Color('skyblue'),
        });
        cube3.position.setX(1);
        cube3.rotateZ(Math.PI / 4);
        cube3.setParent(scene);

        const rotationSpeed = Math.PI * 0.2;
        const textureBackground = new Color(0xffffff);
        const background = new Color(0x199663);

        let then = 0;
        let requestId: number | null = null;

        const render = (now: number) => {
            const angle = rotationSpeed * (now - then) * 0.001;
            then = now;

            cube1.rotateY(angle);
            cube2.rotateY(angle);
            cube3.rotateY(angle);

            if (WebGLUtil.resizeCanvasToDisplaySize(canvas)) {
                aspect = canvas.clientWidth / canvas.clientHeight;
            }

            // 绘制到纹理
            program.uniforms.map = texture;
            scene.background = textureBackground;
            camera.aspect = renderTarget.width / renderTarget.height;
            camera.updateProjectionMatrix();
            renderer.setViewPort(0, 0, renderTarget.width, renderTarget.height);
            renderer.render(scene, camera, renderTarget);

            // 绘制到屏幕
            program.uniforms.map = renderTarget.texture;
            scene.background = background;
            camera.aspect = aspect;
            camera.updateProjectionMatrix();
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

export default function RenderToTexture() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
