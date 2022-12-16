import { useEffect, useRef } from 'react';
import { BufferAttribute, BufferGeometry, Mesh, PerspectiveCamera, Renderer, Scene } from '../core';
import { BezierSegment } from '../extras/beziersegment';
import { OrbitControls } from '../extras/orbitcontrols';
import { Matrix4, Vector2, Vector3 } from '../math';
import fragment from './fragment.frag';
import vertex from './vertex.vert';

function insertToMapArray<K, T>(map: Map<K, T[]>, key: K, value: T) {
    const array = map.get(key);
    if (array) {
        array.push(value);
    } else {
        map.set(key, [value]);
    }
}

function getBowlingGeometry() {
    const widthSegments = 128;
    const heightSegments = 32;

    // 多段连续三次贝塞尔曲线的控制点
    const points = [
        new Vector2(44, 371),
        new Vector2(62, 338),
        new Vector2(63, 305),
        new Vector2(59, 260),
        new Vector2(55, 215),
        new Vector2(22, 156),
        new Vector2(20, 128),
        new Vector2(18, 100),
        new Vector2(31, 77),
        new Vector2(36, 47),
        new Vector2(41, 17),
        new Vector2(39, -16),
        new Vector2(0, -16),
    ];

    // 组合为贝塞尔曲线
    const segments = [
        new BezierSegment([points[0], points[1], points[2], points[3]]),
        new BezierSegment([points[3], points[4], points[5], points[6]]),
        new BezierSegment([points[6], points[7], points[8], points[9]]),
        new BezierSegment([points[9], points[10], points[11], points[12]]),
    ];

    // 离散化并转为三维点
    const discretePoints: Vector3[] = [new Vector3(0, segments[0].start.y, 0)];
    segments.forEach((segment, index) => {
        for (let i = index === 0 ? 0 : 1; i <= heightSegments; i++) {
            const point2D = segment.getPointAt(i / heightSegments);
            discretePoints.push(new Vector3(point2D.x, point2D.y, 0));
        }
    });

    // 绕 Y 轴旋转，获取每一列
    const columns: Vector3[][] = [discretePoints];
    for (let i = 1; i < widthSegments; i++) {
        const rm = new Matrix4().rotateY(Math.PI * 2 * (i / widthSegments));
        const column = discretePoints.map(point => point.clone().applyMatrix4(rm));
        columns.push(column);
    }

    const vertex2Normals = new Map<Vector3, Vector3[]>();
    const vertices: Vector3[] = [];
    const position: number[] = [];
    const normal: number[] = [];
    for (let i = 0; i < widthSegments; i++) {
        const left = columns[i === 0 ? widthSegments - 1 : i - 1];
        const right = columns[i];
        for (let j = 0; j < heightSegments * 4 + 1; j++) {
            const topLeft = left[j];
            const bottomLeft = left[j + 1];
            const topRight = right[j];
            const bottomRight = right[j + 1];

            let normalVector: Vector3;
            if (topLeft.nearlyEquals(topRight)) {
                vertices.push(topRight, bottomLeft, bottomRight);
                normalVector = bottomLeft.clone().sub(topRight).cross(bottomRight.clone().sub(topRight)).normalize();
            } else if (bottomLeft.nearlyEquals(bottomRight)) {
                vertices.push(topLeft, bottomLeft, topRight);
                normalVector = bottomLeft.clone().sub(topLeft).cross(topRight.clone().sub(topLeft)).normalize();
            } else {
                vertices.push(topRight, bottomLeft, bottomRight);
                vertices.push(topLeft, bottomLeft, topRight);
                normalVector = bottomLeft.clone().sub(topLeft).cross(topRight.clone().sub(topLeft)).normalize();
            }

            insertToMapArray(vertex2Normals, topLeft, normalVector);
            insertToMapArray(vertex2Normals, bottomLeft, normalVector);
            insertToMapArray(vertex2Normals, topRight, normalVector);
            insertToMapArray(vertex2Normals, bottomRight, normalVector);
        }
    }

    vertices.forEach(vertex => {
        position.push(...vertex);
        const normals = vertex2Normals.get(vertex)!;
        const normalVector = normals[0].clone();
        for (let i = 1; i < normals.length; i++) {
            const nv = normals[i];
            normalVector.add(nv);
        }
        normalVector.normalize();
        normal.push(normalVector.x, normalVector.y, normalVector.z);
    });

    return {
        position,
        normal,
    };
}

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

        // controls
        const controls = new OrbitControls(camera, canvas);

        const geometry = new BufferGeometry();
        const { position, normal } = getBowlingGeometry();
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(position), 3));
        geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normal), 3));
        const program = renderer.createProgram(vertex, fragment, {
            ambientLightColor: [0.04, 0.04, 0.04],
            pointLightPosition: [200, -800, 0],
            specularFactor: 2,
            shininess: 200,
        });
        const mesh = new Mesh(geometry, program);
        mesh.scale.setY(-1);
        mesh.setParent(scene);

        camera.position.set(0, -178, 400);
        camera.lookAt(0, -178, 0);

        let requestId: number | null = null;

        const render = () => {
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

export default function ThreeDGeometryLathe() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
