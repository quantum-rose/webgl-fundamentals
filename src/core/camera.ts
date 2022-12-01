import { Matrix4 } from '../math';
import { Object3D } from './object3d';

export abstract class Camera extends Object3D {
    public projectionMatrix: Matrix4;

    constructor() {
        super();
        this.projectionMatrix = new Matrix4();
    }

    public abstract updateProjectionMatrix(): void;
}
