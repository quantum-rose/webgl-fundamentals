import { useEffect, useRef } from 'react';
import { BufferAttribute, BufferGeometry, Mesh, PerspectiveCamera, Renderer, Scene } from '../core';
import { BezierSegment } from '../extras/beziersegment';
import { OrbitControls } from '../extras/orbitcontrols';
import { Matrix4, Vector2, Vector3 } from '../math';
import fragment from './fragment.frag';
import vertex from './vertex.vert';

interface IDiscretePoint {
    point: Vector2;
    normal: Vector2;
    len: number;
}

interface IVertex {
    position: Vector3;
    normal: Vector3;
    uv: Vector2;
    index: number;
}

function getBowlingGeometry() {
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const normalTolerance = Math.PI / 6;
    const capStart = true;
    const capEnd = false;

    const widthSegments = 32;
    const heightSegments = 8;

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

    let indexOffset = 0;
    let totalLength = 0;

    // 插入一个 y 轴上的点作为起点，用以构造封闭图形
    let startPoint: Vector2 | undefined;
    if (capStart) {
        indexOffset += widthSegments;
        totalLength += Math.abs(segments[0].start.x);
        startPoint = new Vector2(0, segments[0].start.y);
    }

    // 离散化
    const discretePoints: IDiscretePoint[] = [];
    let lastPoint = segments[0].start;
    segments.forEach((segment, index) => {
        for (let i = index === 0 ? 0 : 1; i <= heightSegments; i++) {
            const t = i / heightSegments;
            const point = segment.getPointAt(t);
            const normal = segment.getNormalAt(t);

            totalLength += lastPoint.distanceTo(point);
            lastPoint = point;

            discretePoints.push({
                point,
                normal,
                len: totalLength,
            });
        }
    });

    // 每列顶点数
    const verticesPerColumn = discretePoints.length;

    // 插入一个 y 轴上的点作为终点，用以构造封闭图形
    let endPoint: Vector2 | undefined;
    if (capEnd) {
        totalLength += Math.abs(segments[segments.length - 1].end.x);
        endPoint = new Vector2(0, segments[segments.length - 1].end.y);
    }

    // 添加起点
    let startVertices: IVertex[] | undefined;
    if (startPoint) {
        startVertices = [];
        // 如果一个圆被分割成 8 个扇形，圆上应该有 9 个顶点，第一个和最后一个顶点只有 uv 不同
        // 但绘制 8 个扇形只需要 8 个圆心， 所以这里是 widthSegments 个顶点
        for (let i = 0; i < widthSegments; i++) {
            const position = new Vector3(startPoint.x, startPoint.y, 0);
            positions.push(...position);

            const normal = new Vector3(0, 1, 0);
            normals.push(...normal);

            const uv = new Vector2((2 * i + 1) / (2 * widthSegments), 0); // 取中点作为 u
            uvs.push(...uv);

            const index = i;

            startVertices.push({
                position,
                normal,
                uv,
                index,
            });
        }
    }

    // 离散点转为三维顶点
    const vertices: IVertex[] = [];
    discretePoints.forEach((point, i) => {
        const position = new Vector3(point.point.x, point.point.y, 0);
        positions.push(...position);

        const normal = new Vector3(point.normal.x, point.normal.y, 0);
        normals.push(...normal);

        const uv = new Vector2(0, point.len / totalLength);
        uvs.push(...uv);

        const index = i + indexOffset;

        vertices.push({
            position,
            normal,
            uv,
            index,
        });
    });

    // 绕 Y 轴旋转，获取每一列
    const columns: IVertex[][] = [vertices];
    for (let i = 1; i <= widthSegments; i++) {
        const u = i / widthSegments;
        const columnIndexOffset = i * verticesPerColumn + indexOffset;
        const rm = new Matrix4().rotateY(Math.PI * 2 * u);
        const column: IVertex[] = vertices.map((vertex, j) => {
            const position = vertex.position.clone().applyMatrix4(rm);
            positions.push(...position);

            const normal = vertex.normal.clone().applyMatrix4(rm);
            normals.push(...normal);

            const uv = new Vector2(u, vertex.uv.y);
            uvs.push(...uv);

            return {
                position,
                normal,
                uv,
                index: columnIndexOffset + j,
            };
        });
        columns.push(column);
    }

    // 添加终点
    let endVertices: IVertex[] | undefined;
    if (endPoint) {
        endVertices = [];
        for (let i = 0; i < widthSegments; i++) {
            const position = new Vector3(endPoint.x, endPoint.y, 0);
            positions.push(...position);

            const normal = new Vector3(0, -1, 0);
            normals.push(...normal);

            const uv = new Vector2((2 * i + 1) / (2 * widthSegments), 1);
            uvs.push(...uv);

            const index = widthSegments + (widthSegments + 1) * verticesPerColumn + i;

            endVertices.push({
                position,
                normal,
                uv,
                index,
            });
        }
    }

    // 如果顶点的法向量与三角面的法向量相差过大，需要添加新的顶点
    function checkNormal(vertex: IVertex, faceNormal: Vector3) {
        if (vertex.normal.angleTo(faceNormal) < normalTolerance) {
            indices.push(vertex.index);
        } else {
            positions.push(...vertex.position);
            normals.push(...faceNormal);
            uvs.push(...vertex.uv);
            indices.push(positions.length / 3 - 1);
        }
    }

    // 构建三角面
    function generateFace(a: IVertex, b: IVertex, c: IVertex) {
        const faceNormal1 = b.position.clone().sub(a.position).cross(c.position.clone().sub(a.position)).normalize();
        checkNormal(a, faceNormal1);
        checkNormal(b, faceNormal1);
        checkNormal(c, faceNormal1);
    }

    for (let i = 0; i < widthSegments; i++) {
        const leftColumn = columns[i];
        const rightColumn = columns[i + 1];

        for (let j = 0; j < verticesPerColumn - 1; j++) {
            const topLeft = leftColumn[j];
            const topRight = rightColumn[j];
            const bottomLeft = leftColumn[j + 1];
            const bottomRight = rightColumn[j + 1];

            if (startVertices && j === 0) {
                generateFace(startVertices[i], topLeft, topRight);
            }

            generateFace(topRight, bottomLeft, bottomRight);

            generateFace(topLeft, bottomLeft, topRight);

            if (endVertices && j === verticesPerColumn - 2) {
                generateFace(bottomLeft, endVertices[i], bottomRight);
            }
        }
    }

    return {
        positions,
        normals,
        uvs,
        indices,
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
        const { positions, normals, uvs, indices } = getBowlingGeometry();
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
        geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
        geometry.setAttribute('index', new BufferAttribute(new Uint16Array(indices), 1));
        const program = renderer.createProgram(vertex, fragment, {
            ambientLightColor: [0.04, 0.04, 0.04],
            pointLightPosition: [800, -400, 400],
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
