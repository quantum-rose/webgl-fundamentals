import { BufferAttribute, BufferGeometry } from '../core';

export class ClipSpaceCubeGeometry extends BufferGeometry {
    private static _positions = [-1, -1, -1, 1, -1, -1, -1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1];

    private static _indices = [0, 1, 1, 3, 3, 2, 2, 0, 4, 5, 5, 7, 7, 6, 6, 4, 0, 4, 1, 5, 3, 7, 2, 6];

    constructor() {
        super();

        this.setAttribute('position', new BufferAttribute(new Float32Array(ClipSpaceCubeGeometry._positions), 3));
        this.setIndex(ClipSpaceCubeGeometry._indices);
    }
}
