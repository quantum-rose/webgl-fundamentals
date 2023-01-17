import { useEffect, useRef } from 'react';
import { Mesh, OrthographicCamera, Renderer, RenderTarget, Scene } from '../core';
import { CheckerboardTexture } from '../extras/checkerboardtexture';
import { PlanControls } from '../extras/planecontrols';
import { PlaneGeometry } from '../geometries';
import { WebGLUtil } from '../utils/webglutil';
import fragment from './fragment.frag';
import gameFragment from './game.frag';
import vertex from './vertex.vert';

function useWebGL() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;

        // renderer
        const renderer = new Renderer(canvas);

        // scene
        const scene = new Scene();

        // initial data
        const stageSize = 2 ** 10;
        const pixelsNum = stageSize ** 2;
        const initialData: number[] = [];
        for (let i = 0; i < pixelsNum; i++) {
            const offset = i * 4;
            const cell = Math.random() < 0.6 ? 0 : 255;
            initialData[offset + 0] = cell;
            initialData[offset + 1] = cell;
            initialData[offset + 2] = cell;
            initialData[offset + 3] = 255;
        }

        // camera
        const cellSize = 8;
        let halfW = canvas.clientWidth / 2 / cellSize;
        let halfH = (halfW * canvas.clientHeight) / canvas.clientWidth;
        const camera = new OrthographicCamera(-halfW, halfW, halfH, -halfH, -100, 100);

        const halfStageSize = stageSize / 2;
        const renderTargetCamera = new OrthographicCamera(-halfStageSize, halfStageSize, halfStageSize, -halfStageSize, -100, 100);

        // controls
        const controls = new PlanControls(camera, canvas);

        // rendertarget
        const renderTarget1 = new RenderTarget(stageSize, stageSize);
        renderTarget1.texture.data = new Uint8Array(initialData);
        renderTarget1.texture.magFilter = 'NEAREST';
        renderTarget1.texture.wrapS = 'REPEAT';
        renderTarget1.texture.wrapT = 'REPEAT';

        const renderTarget2 = new RenderTarget(stageSize, stageSize);
        renderTarget2.texture.magFilter = 'NEAREST';
        renderTarget2.texture.wrapS = 'REPEAT';
        renderTarget2.texture.wrapT = 'REPEAT';

        const renderTargets = [renderTarget1, renderTarget2] as const;

        // texture
        let texture = renderTarget1.texture;

        // program
        const program = renderer.createProgram(vertex, fragment, {
            background: new CheckerboardTexture(stageSize, stageSize, 0xee),
        });
        const gameProgram = renderer.createProgram(vertex, gameFragment, {
            pixelSize: 1 / stageSize,
        });

        const stage = new Mesh(new PlaneGeometry(stageSize, stageSize), program);
        stage.setParent(scene);

        let input = 0;
        let output = 1;

        const fps = 24;
        const delay = 1000 / fps;
        let then = Date.now();
        let now = then;
        let requestId: number | null = null;

        const render = () => {
            now = Date.now();

            if (WebGLUtil.resizeCanvasToDisplaySize(canvas)) {
                halfW = canvas.clientWidth / 2 / cellSize;
                halfH = (halfW * canvas.clientHeight) / canvas.clientWidth;
                camera.left = -halfW;
                camera.right = halfW;
                camera.top = halfH;
                camera.bottom = -halfH;
                camera.updateProjectionMatrix();
            }

            if (now - then > delay) {
                gameProgram.uniforms.map = renderTargets[input].texture;
                scene.overrideProgram = gameProgram;
                renderer.setViewPort(0, 0, stageSize, stageSize);
                renderer.render(scene, renderTargetCamera, renderTargets[output]);

                texture = renderTargets[output].texture;

                input += output;
                output = input - output;
                input = input - output;

                then = now;
            }

            program.uniforms.map = texture;
            scene.overrideProgram = null;
            renderer.setViewPort(0, 0, renderer.drawingBufferWidth, renderer.drawingBufferHeight);
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

export default function GameOfLife() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
