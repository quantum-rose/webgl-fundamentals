import { BufferAttribute, BufferGeometry } from '../core';
import { BezierSegment } from '../extras/beziersegment';
import { Matrix4, Vector2, Vector3 } from '../math';

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

export interface IWaterDropGeometryParameters {
    widthSegments: number;
    heightSegments: number;
}

export class WaterDropGeometry extends BufferGeometry {
    // 多段连续三次贝塞尔曲线的控制点
    private static _points = [
        new Vector2(0, 0.46830985915492956),
        new Vector2(0.04401408450704226, 0.46830985915492956),
        new Vector2(0.08626760563380281, 0.45774647887323944),
        new Vector2(0.1267605633802817, 0.44659624413145543),
        new Vector2(0.34330985915492956, 0.3873239436619718),
        new Vector2(0.5, 0.14788732394366197),
        new Vector2(0.45892018779342725, -0.0715962441314554),
        new Vector2(0.4413145539906103, -0.16549295774647887),
        new Vector2(0.40492957746478875, -0.2564553990610329),
        new Vector2(0.36795774647887325, -0.3438967136150235),
        new Vector2(0.2693661971830986, -0.5751173708920188),
        new Vector2(0.13673708920187794, -0.7875586854460094),
        new Vector2(0, -1.005281690140845),
    ];

    private static _segments = [
        new BezierSegment([this._points[0], this._points[1], this._points[2], this._points[3]]),
        new BezierSegment([this._points[3], this._points[4], this._points[5], this._points[6]]),
        new BezierSegment([this._points[6], this._points[7], this._points[8], this._points[9]]),
        new BezierSegment([this._points[9], this._points[10], this._points[11], this._points[12]]),
    ];

    public parameters: IWaterDropGeometryParameters;

    constructor(widthSegments = 16, heightSegments = 4) {
        super();

        this.parameters = {
            widthSegments,
            heightSegments,
        };

        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        const normalTolerance = Math.PI / 6;
        const capStart = false;
        const capEnd = false;

        // 组合为贝塞尔曲线
        const segments = WaterDropGeometry._segments;

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

        this.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
        this.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
        this.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
        this.setIndex(indices);
    }
}
