import { useEffect, useRef } from 'react';
import { Mesh, PerspectiveCamera, Renderer, Scene, Texture } from '../core';
import { OrbitControls } from '../extras/orbitcontrols';
import { BoxGeometry } from '../geometries';
import { Color, Vector3 } from '../math';
import { WebGLUtil } from '../utils/webglutil';
import fragment from './fragment.frag';
import vertex from './vertex.vert';

const CubeMapFaceInfos = [
    { faceColor: '#F00', textColor: '#0FF', text: '+X' },
    { faceColor: '#FF0', textColor: '#00F', text: '-X' },
    { faceColor: '#0F0', textColor: '#F0F', text: '+Y' },
    { faceColor: '#0FF', textColor: '#F00', text: '-Y' },
    { faceColor: '#00F', textColor: '#FF0', text: '+Z' },
    { faceColor: '#F0F', textColor: '#0F0', text: '-Z' },
];

function getCubeMapImages(size: number) {
    const cvsCtx = document.createElement('canvas').getContext('2d');
    if (!cvsCtx) {
        throw 'failed to get canvas rendering context 2D';
    }

    cvsCtx.canvas.width = size;
    cvsCtx.canvas.height = size;

    const task = CubeMapFaceInfos.map(faceInfo => {
        const { faceColor, textColor, text } = faceInfo;
        cvsCtx.fillStyle = faceColor;
        cvsCtx.fillRect(0, 0, size, size);
        cvsCtx.font = `bold ${size * 0.7}px monospace`;
        cvsCtx.textAlign = 'center';
        cvsCtx.textBaseline = 'middle';
        cvsCtx.fillStyle = textColor;
        cvsCtx.fillText(text, size / 2, size / 2);

        return new Promise<HTMLImageElement>((resolve, reject) => {
            cvsCtx.canvas.toBlob(blob => {
                if (blob) {
                    const img = new Image();
                    img.src = URL.createObjectURL(blob);
                    img.onload = () => resolve(img);
                } else {
                    reject('failed to blob');
                }
            });
        });
    });

    return Promise.all(task);
}

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
        const camera = new PerspectiveCamera(35, aspect, 1, 1000);
        camera.position.set(4, 1, 2);
        new OrbitControls(camera, canvas);

        // light
        const ambientLightColor = new Color(0x202020);
        const spotLightColor = new Color(0xffffff);
        const spotLightPosition = new Vector3(10, 10, 10);
        const spotLightDirection = new Vector3(-10, -10, -10);
        const angle = 15;
        const rad = (angle * Math.PI) / 180;
        const spotLightInnerLimit = Math.cos(0.95 * rad);
        const spotLightOuterLimit = Math.cos(rad);

        // texture
        const cubeMapSize = 2 ** 8;
        const cubeTexture = new Texture(null, cubeMapSize, cubeMapSize);
        cubeTexture.target = 'TEXTURE_CUBE_MAP';
        cubeTexture.flipY = false;
        getCubeMapImages(cubeMapSize).then(images => {
            cubeTexture.data = images;
            cubeTexture.needsUpdate = true;
        });

        // program
        const program = renderer.createProgram(vertex, fragment, {
            ambientLightColor,
            spotLightColor,
            spotLightPosition,
            spotLightDirection,
            spotLightInnerLimit,
            spotLightOuterLimit,
            specularFactor: 2,
            shininess: 400,
            cubeMap: cubeTexture,
        });

        // cube
        const cubeGeometry = new BoxGeometry(1);
        const cube = new Mesh(cubeGeometry, program);
        cube.setParent(scene);

        const rotationSpeed = Math.PI * 0.4;

        let then = 0;
        let requestId: number | null = null;

        const render = (now: number) => {
            const angle = rotationSpeed * (now - then) * 0.001;
            then = now;

            cube.rotateY(angle);

            if (WebGLUtil.resizeCanvasToDisplaySize(canvas)) {
                aspect = canvas.clientWidth / canvas.clientHeight;
                camera.aspect = aspect;
                camera.updateProjectionMatrix();
            }

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

export default function CubeMaps() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
