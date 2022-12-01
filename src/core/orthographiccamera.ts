import { Camera } from './camera';

export class OrthographicCamera extends Camera {
    public left: number;

    public right: number;

    public top: number;

    public bottom: number;

    public near: number;

    public far: number;

    constructor(left: number, right: number, top: number, bottom: number, near: number, far: number) {
        super();
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
        this.near = near;
        this.far = far;
        this.updateProjectionMatrix();
    }

    public updateProjectionMatrix() {
        this.projectionMatrix.makeOrthographic(this.left, this.right, this.top, this.bottom, this.near, this.far);
    }
}
