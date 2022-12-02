import { MouseButton } from '../interfaces';
import { Vector3 } from '../math';
import { Camera } from './camera';

export class OrbitControls {
    public camera: Camera;

    public domElement: HTMLElement;

    private _lastMouse: [number, number] = [0, 0];

    constructor(camera: Camera, domElement?: HTMLElement) {
        this.camera = camera;
        this.domElement = domElement ?? document.documentElement;

        this.domElement.addEventListener('wheel', this._onWheel);
        this.domElement.addEventListener('mousedown', this._onDragStart);
        this.domElement.addEventListener('mouseup', this._onDragEnd);
        this.domElement.addEventListener('contextmenu', this._onContextMenu);
    }

    private _onWheel = (e: WheelEvent) => {
        const { deltaY } = e;
        const { position, target } = this.camera;
        if (deltaY > 0) {
            position.sub(target).scale(1.25).add(target);
        } else {
            position.sub(target).scale(0.8).add(target);
        }
        this.camera.updateMatrixWorld();
    };

    private _onDragStart = (e: MouseEvent) => {
        this._lastMouse[0] = e.offsetX;
        this._lastMouse[1] = e.offsetY;
        this.domElement.addEventListener('mousemove', this._onDragMove);
    };

    private _onDragMove = (e: MouseEvent) => {
        const { offsetX, offsetY, buttons } = e;
        const deltaX = offsetX - this._lastMouse[0];
        const deltaY = offsetY - this._lastMouse[1];

        const { position, target, up, matrixWorld } = this.camera;
        const xAxis = new Vector3().setFromMatrixColumn(matrixWorld, 0);
        const yAxis = new Vector3().setFromMatrixColumn(matrixWorld, 1);
        const zAxis = new Vector3().setFromMatrixColumn(matrixWorld, 2);

        if (buttons & MouseButton.LEFT) {
            position.sub(target);

            const rotateX = -deltaY * 0.01;
            position.applyAxisAngle(xAxis, rotateX);
            up.applyAxisAngle(xAxis, rotateX);

            const rotateY = -deltaX * 0.01;
            position.applyAxisAngle(yAxis, rotateY);
            up.applyAxisAngle(yAxis, rotateY);

            position.add(target);

            this.camera.updateMatrixWorld();
        } else if (buttons & MouseButton.RIGHT) {
            const vDepth = zAxis.setLength(-deltaY);
            position.add(vDepth);
            target.add(vDepth);

            const vHorizontal = xAxis.setLength(-deltaX);
            position.add(vHorizontal);
            target.add(vHorizontal);

            this.camera.updateMatrixWorld();
        }

        this._lastMouse[0] = offsetX;
        this._lastMouse[1] = offsetY;
    };

    private _onDragEnd = () => {
        this.domElement.removeEventListener('mousemove', this._onDragMove);
    };

    private _onContextMenu = (e: MouseEvent) => {
        e.preventDefault();
    };
}
