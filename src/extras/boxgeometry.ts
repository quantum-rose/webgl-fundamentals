import { BufferAttribute, BufferGeometry } from '../core';

export interface IBoxGeometryParameters {
    width: number;
    height: number;
    depth: number;
}

export class BoxGeometry extends BufferGeometry {
    private static _uniqueVertices = [
        [-1, -1, -1],
        [+1, -1, -1],
        [-1, +1, -1],
        [+1, +1, -1],
        [-1, -1, +1],
        [+1, -1, +1],
        [-1, +1, +1],
        [+1, +1, +1],
    ] as const;

    private static _faceIndices = [
        [3, 7, 5, 1], // right
        [6, 2, 0, 4], // left
        [3, 2, 6, 7], // top
        [5, 4, 0, 1], // bottom
        [7, 6, 4, 5], // front
        [2, 3, 1, 0], // back
    ] as const;

    private static _uniuqeNormals = [
        [+1, +0, +0],
        [-1, +0, +0],
        [+0, +1, +0],
        [+0, -1, +0],
        [+0, +0, +1],
        [+0, +0, -1],
    ] as const;

    private static _uniqueUvs = [
        [1, 1],
        [0, 1],
        [0, 0],
        [1, 0],
    ] as const;

    public parameters: IBoxGeometryParameters;

    constructor(width: number, height = width, depth = height) {
        super();

        this.parameters = {
            width,
            height,
            depth,
        };

        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const halfDepth = depth / 2;

        const vertices = BoxGeometry._uniqueVertices.map(([x, y, z]) => [x * halfWidth, y * halfHeight, z * halfDepth]);

        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        for (let i = 0; i < 6; i++) {
            const vertexIndices = BoxGeometry._faceIndices[i];
            const normal = BoxGeometry._uniuqeNormals[i];

            for (let j = 0; j < 4; j++) {
                const vertexIndex = vertexIndices[j];
                const vertex = vertices[vertexIndex];
                const uv = BoxGeometry._uniqueUvs[j];
                positions.push(vertex[0], vertex[1], vertex[2]);
                normals.push(normal[0], normal[1], normal[2]);
                uvs.push(uv[0], uv[1]);
            }

            const offset = 4 * i;
            indices.push(offset + 0, offset + 1, offset + 2);
            indices.push(offset + 0, offset + 2, offset + 3);
        }

        this.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
        this.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
        this.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
        this.setIndex(indices);
    }
}
