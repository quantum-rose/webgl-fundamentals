import { useEffect, useRef } from 'react';
import { Mesh, PerspectiveCamera, Renderer, Scene, Texture } from '../core';
import { OrbitControls } from '../extras/orbitcontrols';
import { PlaneGeometry } from '../extras/planegeometry';
import { SphereGeometry } from '../extras/spheregeometry';
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

        // camera
        const camera = new PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 1, 1000);
        camera.position.set(1, 6, 4);
        camera.lookAt(0, 1, 0);
        new OrbitControls(camera, canvas);

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

        // program
        const program = renderer.createProgram(vertex, fragment, {
            ambientLightColor: [0.2, 0.2, 0.2],
            pointLightPosition: [150, 150, 150],
            map: texture,
        });

        // ground
        const groundGeometry = new PlaneGeometry(20, 20);
        groundGeometry.rotateX(-Math.PI / 2);
        const ground = new Mesh(groundGeometry, program, {
            specularFactor: 0.1,
            shininess: 100,
            colorMult: new Color('skyblue'),
        });
        ground.setParent(scene);

        // ball
        const ballGeometry = new SphereGeometry(1, 12, 6);
        const ball = new Mesh(ballGeometry, program, {
            specularFactor: 2,
            shininess: 200,
            colorMult: new Color('pink'),
        });
        ball.position.setY(3);
        ball.setParent(scene);

        let requestId: number | null = null;

        const render = () => {
            if (WebGLUtil.resizeCanvasToDisplaySize(canvas)) {
                renderer.setViewPort(0, 0, renderer.drawingBufferWidth, renderer.drawingBufferHeight);
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }

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

    return [canvasRef] as const;
}

export default function PlanarProjectionMapping() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
