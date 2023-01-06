import { BufferAttribute, BufferGeometry } from '../core';

export class CameraGeometry extends BufferGeometry {
    private static _positions = [
        -1, -1, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1, -1, -1, 3, 1, -1, 3, -1, 1, 3, 1, 1, 3, 0, 0, 1, 1, 0, 0, 0.5, 0.8660254037844386, 0, -0.5, 0.8660254037844387,
        0, -1, 0, 0, -0.5, -0.8660254037844385, 0, 0.5, -0.8660254037844386, 0,
    ];

    private static _indices = [
        0, 1, 1, 3, 3, 2, 2, 0, 4, 5, 5, 7, 7, 6, 6, 4, 0, 4, 1, 5, 3, 7, 2, 6, 8, 9, 9, 10, 8, 10, 10, 11, 8, 11, 11, 12, 8, 12, 12, 13, 8, 13, 13, 14, 8, 14,
        14, 9,
    ];

    constructor() {
        super();

        this.setAttribute('position', new BufferAttribute(new Float32Array(CameraGeometry._positions), 3));
        this.setIndex(CameraGeometry._indices);
    }
}
