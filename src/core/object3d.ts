import { Matrix4, Vector3 } from '../math';

export class Object3D {
    public position = new Vector3(0, 0, 1);

    public target = new Vector3(0, 0, 0);

    public up = new Vector3(0, 1, 0);

    public matrixWorld = new Matrix4();

    constructor() {
        this.updateMatrixWorld();
    }

    public lookAt(v: number[]): this;
    public lookAt(x: number, y: number, z: number): this;
    public lookAt(x: number | number[], y?: number, z?: number) {
        if (typeof x === 'number') {
            this.target.set(x, y!, z!);
        } else {
            this.target.copy(x);
        }
        this.updateMatrixWorld();
        return this;
    }

    public updateMatrixWorld() {
        const zAxis = this.position.clone().sub(this.target).normalize();
        const xAxis = this.up.clone().cross(zAxis).normalize();
        const yAxis = zAxis.clone().cross(xAxis);
        this.matrixWorld.makeBasis(xAxis, yAxis, zAxis);
        this.matrixWorld.setPosition(this.position);
    }
}
