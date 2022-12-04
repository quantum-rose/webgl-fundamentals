import { Object3DClass } from '../constants';
import { Camera } from './camera';

export class PerspectiveCamera extends Camera {
    public static classId = Object3DClass.PerspectiveCamera;

    public classId = PerspectiveCamera.classId;

    public fov: number;

    public aspect: number;

    public near: number;

    public far: number;

    constructor(fov: number, aspect: number, near: number, far: number) {
        super();
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.updateProjectionMatrix();
    }

    public updateProjectionMatrix() {
        this.projectionMatrix.makePerspective((this.fov * Math.PI) / 180, this.aspect, this.near, this.far);
    }
}
