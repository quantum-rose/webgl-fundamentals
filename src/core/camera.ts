import { Matrix4, Vector3 } from '../math';
import { Object3D } from './object3d';

export abstract class Camera extends Object3D {
    public matrixWorldInverse: Matrix4;

    public projectionMatrix: Matrix4;

    public target: Vector3;

    constructor() {
        super();
        this.matrixWorldInverse = new Matrix4();
        this.projectionMatrix = new Matrix4();
        this.target = new Vector3();
    }

    public abstract updateProjectionMatrix(): void;

    public lookAt(v: number[]): void;
    public lookAt(x: number, y: number, z: number): void;
    public lookAt(x: number | number[], y?: number, z?: number) {
        if (typeof x === 'number') {
            this.target.fromArray([x, y!, z!]);
        } else {
            this.target.copy(x);
        }
        super.lookAt(this.target);
    }

    public updateMatrixWorld() {
        super.updateMatrixWorld();
        this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }

    public updateWorldMatrix() {
        super.updateWorldMatrix();
        this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }
}
