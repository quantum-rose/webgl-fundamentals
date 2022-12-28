import { useEffect, useRef } from 'react';
import { Group, Mesh, Object3D, PerspectiveCamera, Renderer, Scene } from '../core';
import { BoxGeometry } from '../extras/boxgeometry';
import { OrbitControls } from '../extras/orbitcontrols';
import { SphereGeometry } from '../extras/spheregeometry';
import { Color } from '../math/color';
import { WebGLUtil } from '../utils/webglutil';
import blockGuyFragment from './blockguy.frag';
import planetFragment from './planet.frag';
import stellarFragment from './stellar.frag';
import style from './style.module.css';
import vertex from './vertex.vert';

interface IBlockGuyNode {
    name: string;
    draw?: boolean;
    children?: IBlockGuyNode[];
    translation?: [number, number, number];
}

function createSolarSystem(canvas: HTMLCanvasElement, renderer: Renderer, eventReceiver: HTMLDivElement) {
    // scene
    const scene = new Scene();

    // camera
    const camera = new PerspectiveCamera(70, canvas.clientWidth / 2 / canvas.clientHeight, 1, 10000);
    camera.position.set(0, 0, 2000);
    camera.position.applyAxisAngle([0, 1, 0], Math.PI / 6);
    camera.position.applyAxisAngle([1, 0, 0], -Math.PI / 6);

    // controls
    const controls = new OrbitControls(camera, eventReceiver);

    const solarSystem = new Group();
    solarSystem.setParent(scene);

    const sunGeometry = new SphereGeometry(120, 128, 64);
    const sunProgram = renderer.createProgram(vertex, stellarFragment, {
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
    earth.position.set(1000, 0, 0);
    earth.setParent(earthOrbit);

    const moonOrbit = new Group();
    moonOrbit.position.set(1000, 0, 0);
    moonOrbit.setParent(earthOrbit);

    const moonGeometry = new SphereGeometry(25);
    const moon = new Mesh(moonGeometry, planetProgram, {
        color: new Color('gray'),
        specularFactor: 0.1,
        shininess: 20,
    });
    moon.position.set(160, 0, 0);
    moon.setParent(moonOrbit);

    const earthRotationSpeed = Math.PI * 0.2;
    const moonRotationSpeed = Math.PI * 2;

    let then = 0;
    function animation(now: number) {
        const deltaT = (now - then) * 0.001;
        then = now;
        const earthAngle = earthRotationSpeed * deltaT;
        earthOrbit.rotateY(earthAngle);
        const moonAngle = moonRotationSpeed * deltaT;
        moonOrbit.rotateY(moonAngle);
    }

    return [scene, camera, animation] as const;
}

function createBlockGuy(canvas: HTMLCanvasElement, renderer: Renderer, eventReceiver: HTMLDivElement) {
    // scene
    const scene = new Scene();
    scene.background = new Color('white');

    // camera
    const camera = new PerspectiveCamera(70, canvas.clientWidth / 2 / canvas.clientHeight, 1, 100);
    camera.position.set(8, 0, 12);

    // controls
    const controls = new OrbitControls(camera, eventReceiver);

    // Let's make all the nodes
    const blockGuyNodeDescriptions: IBlockGuyNode = {
        name: 'point between feet',
        draw: false,
        children: [
            {
                name: 'waist',
                translation: [0, 3, 0],
                children: [
                    {
                        name: 'torso',
                        translation: [0, 2, 0],
                        children: [
                            {
                                name: 'neck',
                                translation: [0, 1, 0],
                                children: [
                                    {
                                        name: 'head',
                                        translation: [0, 1, 0],
                                    },
                                ],
                            },
                            {
                                name: 'left-arm',
                                translation: [-1, 0, 0],
                                children: [
                                    {
                                        name: 'left-forearm',
                                        translation: [-1, 0, 0],
                                        children: [
                                            {
                                                name: 'left-hand',
                                                translation: [-1, 0, 0],
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                name: 'right-arm',
                                translation: [1, 0, 0],
                                children: [
                                    {
                                        name: 'right-forearm',
                                        translation: [1, 0, 0],
                                        children: [
                                            {
                                                name: 'right-hand',
                                                translation: [1, 0, 0],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        name: 'left-leg',
                        translation: [-1, -1, 0],
                        children: [
                            {
                                name: 'left-calf',
                                translation: [0, -1, 0],
                                children: [
                                    {
                                        name: 'left-foot',
                                        translation: [0, -1, 0],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        name: 'right-leg',
                        translation: [1, -1, 0],
                        children: [
                            {
                                name: 'right-calf',
                                translation: [0, -1, 0],
                                children: [
                                    {
                                        name: 'right-foot',
                                        translation: [0, -1, 0],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    const name2Node: Record<string, Object3D> = {};

    const geometry = new BoxGeometry(1);
    const program = renderer.createProgram(vertex, blockGuyFragment, {
        ambientLightColor: new Color(128, 128, 128),
        reverseLightDirection: [1, 1, 1],
        color: new Color(63, 86, 231),
    });

    function makeNode(nodeDescription: IBlockGuyNode) {
        let node: Object3D;
        if (nodeDescription.draw !== false) {
            node = new Mesh(geometry, program);
        } else {
            node = new Group();
        }
        if (nodeDescription.translation) {
            node.position.set(...nodeDescription.translation);
        }
        if (nodeDescription.children) {
            makeNodes(nodeDescription.children).forEach(function (child) {
                child.setParent(node);
            });
        }
        name2Node[nodeDescription.name] = node;
        return node;
    }

    function makeNodes(nodeDescriptions: IBlockGuyNode[]) {
        return nodeDescriptions ? nodeDescriptions.map(makeNode) : [];
    }

    const blockGuy = makeNode(blockGuyNodeDescriptions);
    blockGuy.position.setY(-4);
    blockGuy.setParent(scene);

    const xAxis = [1, 0, 0];
    const yAxis = [0, 1, 0];
    const zAxis = [0, 0, 1];

    function animation(time: number) {
        let adjust: number;
        const speed = 3;
        const c = time * speed * 0.001;
        adjust = Math.abs(Math.sin(c)) - 4;
        name2Node['point between feet'].position.setY(adjust);
        adjust = Math.sin(c);
        name2Node['left-leg'].quaternion.setFromAxisAngle(xAxis, adjust);
        name2Node['right-leg'].quaternion.setFromAxisAngle(xAxis, -adjust);
        adjust = Math.sin(c + 0.1) * 0.4;
        name2Node['left-calf'].quaternion.setFromAxisAngle(xAxis, -adjust);
        name2Node['right-calf'].quaternion.setFromAxisAngle(xAxis, adjust);
        adjust = Math.sin(c + 0.1) * 0.4;
        name2Node['left-foot'].quaternion.setFromAxisAngle(xAxis, -adjust);
        name2Node['right-foot'].quaternion.setFromAxisAngle(xAxis, adjust);

        adjust = Math.sin(c) * 0.4;
        name2Node['left-arm'].quaternion.setFromAxisAngle(zAxis, adjust);
        name2Node['right-arm'].quaternion.setFromAxisAngle(zAxis, adjust);
        adjust = Math.sin(c + 0.1) * 0.4;
        name2Node['left-forearm'].quaternion.setFromAxisAngle(zAxis, adjust);
        name2Node['right-forearm'].quaternion.setFromAxisAngle(zAxis, adjust);
        adjust = Math.sin(c - 0.1) * 0.4;
        name2Node['left-hand'].quaternion.setFromAxisAngle(zAxis, adjust);
        name2Node['right-hand'].quaternion.setFromAxisAngle(zAxis, adjust);

        adjust = Math.sin(c) * 0.4;
        name2Node['waist'].quaternion.setFromAxisAngle(yAxis, adjust);
        adjust = Math.sin(c) * 0.4;
        name2Node['torso'].quaternion.setFromAxisAngle(yAxis, adjust);
        adjust = Math.sin(c + 0.25) * 0.4;
        name2Node['neck'].quaternion.setFromAxisAngle(yAxis, adjust);
        adjust = Math.sin(c + 0.5) * 0.4;
        name2Node['head'].quaternion.setFromAxisAngle(yAxis, adjust);
        adjust = Math.cos(c * 2) * 0.4;
        name2Node['head'].quaternion.setFromAxisAngle(xAxis, adjust);
    }

    return [scene, camera, animation] as const;
}

function useWebGL() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const eventLayerLeft = useRef<HTMLDivElement | null>(null);
    const eventLayerRight = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;

        // renderer
        const renderer = new Renderer(canvas);
        renderer.setScissorTest(true);

        const [solarSystemScene, solarSystemCamera, solarSystemAnimation] = createSolarSystem(canvas, renderer, eventLayerLeft.current!);

        const [blockGuyScene, blockGuyCamera, blockGuyAnimation] = createBlockGuy(canvas, renderer, eventLayerRight.current!);

        let requestId: number | null = null;

        let halfWidth = renderer.drawingBufferWidth / 2;

        const render = (t: number) => {
            solarSystemAnimation(t);
            blockGuyAnimation(t);

            if (WebGLUtil.resizeCanvasToDisplaySize(canvas)) {
                halfWidth = renderer.drawingBufferWidth / 2;
                const aspect = canvas.clientWidth / 2 / canvas.clientHeight;
                solarSystemCamera.aspect = aspect;
                solarSystemCamera.updateProjectionMatrix();
                blockGuyCamera.aspect = aspect;
                blockGuyCamera.updateProjectionMatrix();
            }

            renderer.setViewPort(0, 0, halfWidth, canvas.height);
            renderer.setScissor(0, 0, halfWidth, canvas.height);
            renderer.render(solarSystemScene, solarSystemCamera);

            renderer.setViewPort(halfWidth, 0, halfWidth, canvas.height);
            renderer.setScissor(halfWidth, 0, halfWidth, canvas.height);
            renderer.render(blockGuyScene, blockGuyCamera);

            requestId = requestAnimationFrame(render);
        };

        render(0);

        return function cleanup() {
            if (requestId !== null) {
                cancelAnimationFrame(requestId);
            }
        };
    });

    return [canvasRef, eventLayerLeft, eventLayerRight] as const;
}

export default function SceneGraph() {
    const [canvasRef, eventLayerLeft, eventLayerRight] = useWebGL();

    return (
        <div className={style['scene-graph']}>
            <canvas ref={canvasRef} />
            <div ref={eventLayerLeft} className={style['event-layer']}></div>
            <div ref={eventLayerRight} className={style['event-layer']} style={{ left: '50%' }}></div>
        </div>
    );
}
