import { useEffect, useRef } from 'react';
import { BufferAttribute, BufferGeometry, Mesh, PerspectiveCamera, Renderer, Scene, Texture } from '../core';
import { OrbitControls } from '../extras/orbitcontrols';
import { WaterDropGeometry } from '../geometries';
import { Matrix4 } from '../math';
import { WebGLUtil } from '../utils/webglutil';
import fragment from './fragment.frag';
import skyboxFragment from './skybox.frag';
import skyboxVertex from './skybox.vert';
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
        const camera = new PerspectiveCamera(70, aspect, 0.01, 100);
        camera.position.set(-2, 2, -2);
        new OrbitControls(camera, canvas);

        (window as any).CCC = camera;

        // texture
        const cubeTexture = new Texture([
            'GalaxyTex_PositiveX.png',
            'GalaxyTex_NegativeX.png',
            'GalaxyTex_PositiveY.png',
            'GalaxyTex_NegativeY.png',
            'GalaxyTex_PositiveZ.png',
            'GalaxyTex_NegativeZ.png',
        ]);

        // water drop
        const waterDropGeometry = new WaterDropGeometry(128, 32);
        const reflectProgram = renderer.createProgram(vertex, fragment, {
            cubeMap: cubeTexture,
        });
        const waterDrop = new Mesh(waterDropGeometry, reflectProgram);
        waterDrop.scale.set(1, 1.5, 1);
        waterDrop.rotateZ(-Math.PI / 2);
        waterDrop.setParent(scene);

        // skybox
        const skyboxGeometry = new BufferGeometry();
        skyboxGeometry.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), 2));
        const skyboxProgram = renderer.createProgram(skyboxVertex, skyboxFragment, {
            cubeMap: cubeTexture,
            matrix: new Matrix4(),
        });
        const skybox = new Mesh(skyboxGeometry, skyboxProgram);
        skybox.depthFunc = 'LEQUAL';
        skybox.setParent(scene);

        let requestId: number | null = null;

        const render = () => {
            if (WebGLUtil.resizeCanvasToDisplaySize(canvas)) {
                aspect = canvas.clientWidth / canvas.clientHeight;
                camera.aspect = aspect;
                camera.updateProjectionMatrix();
            }

            camera.updateMatrixWorld();

            skyboxProgram.uniforms.matrix.copy(camera.matrixWorldInverse).setPosition(0, 0, 0).premultiply(camera.projectionMatrix).invert();

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

export default function Skybox() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
