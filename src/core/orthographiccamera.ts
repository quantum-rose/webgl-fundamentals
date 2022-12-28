import { Object3DClass } from '../constants';
import { Camera } from './camera';

export class OrthographicCamera extends Camera {
    public static classId = Object3DClass.OrthographicCamera;

    public classId = OrthographicCamera.classId;

    public left: number;

    public right: number;

    public top: number;

    public bottom: number;

    public near: number;

    public far: number;

    public zoom: number;

    constructor(left: number, right: number, top: number, bottom: number, near: number, far: number) {
        super();
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
        this.near = near;
        this.far = far;
        this.zoom = 1;
        this.updateProjectionMatrix();
    }

    public updateProjectionMatrix() {
        const dx = (this.right - this.left) / (2 * this.zoom);
        const dy = (this.top - this.bottom) / (2 * this.zoom);
        const cx = (this.right + this.left) / 2;
        const cy = (this.top + this.bottom) / 2;
        const left = cx - dx;
        const right = cx + dx;
        const top = cy + dy;
        const bottom = cy - dy;
        this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far);
    }
}
