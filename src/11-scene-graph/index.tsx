import { useEffect, useRef } from 'react';
import { Group, Mesh, PerspectiveCamera, Renderer, Scene } from '../core';
import { OrbitControls } from '../extras/orbitcontrols';
import { SphereGeometry } from '../extras/spheregeometry';
import { Color } from '../math/color';
import planetFragment from './planet.frag';
import stellarFragment from './stellar.frag';
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
        const camera = new PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 1, 10000);
        camera.position.set(0, 0, 2000);
        camera.position.applyAxisAngle([0, 1, 0], Math.PI / 6);
        camera.position.applyAxisAngle([1, 0, 0], -Math.PI / 6);

        // controls
        const controls = new OrbitControls(camera, canvas);

        const solarSystem = new Group();
        solarSystem.setParent(scene);

        const sunGeometry = new SphereGeometry(120, 128, 64);
        const sunProgram = renderer.createProgram(vertex, stellarFragment, {
            // color: new Color(0, 0, 255),
            color: new Color(215, 157, 29),
        });
        const sun = new Mesh(sunGeometry, sunProgram);
        sun.setParent(solarSystem);

        const planetProgram = renderer.createProgram(vertex, planetFragment, {
            ambientLightColor: new Color(0x111111),
            pointLightPosition: sun.position,
        });

        const earthOrbit = new Group();
        earthOrbit.rotateZ(Math.PI / 8);
        earthOrbit.setParent(solarSystem);

        const earthGeometry = new SphereGeometry(50, 64, 32);
        const earth = new Mesh(earthGeometry, planetProgram, {
            color: new Color(37, 78, 163),
            specularFactor: 0.2,
            shininess: 80,
        });
        earth.position.set(1500, 0, 0);
        earth.setParent(earthOrbit);

        const moonOrbit = new Group();
        moonOrbit.position.set(1500, 0, 0);
        moonOrbit.setParent(earthOrbit);

        const moonGeometry = new SphereGeometry(25);
        const moon = new Mesh(moonGeometry, planetProgram, {
            color: new Color('gray'),
            specularFactor: 0.1,
            shininess: 20,
        });
        moon.position.set(160, 0, 0);
        moon.setParent(moonOrbit);

        let requestId: number | null = null;

        const render = () => {
            earthOrbit.rotateY(0.008);
            moonOrbit.rotateY(0.08);

            renderer.render(scene, camera);

            requestId = requestAnimationFrame(render);
        };

        render();

        return function cleanup() {
            if (requestId !== null) {
                cancelAnimationFrame(requestId);
            }
        };
    });

    return [canvasRef] as const;
}

export default function SceneGraph() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
