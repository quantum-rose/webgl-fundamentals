import { MouseButton } from '../constants';
import { Camera } from '../core/camera';
import { Vector3 } from '../math';

export class OrbitControls {
    private static _xAxis = new Vector3();

    private static _yAxis = new Vector3();

    private static _zAxis = new Vector3();

    public camera: Camera;

    public domElement: HTMLElement;

    private _lastMouse: [number, number];

    constructor(camera: Camera, domElement?: HTMLElement) {
        this.camera = camera;
        this.domElement = domElement ?? document.documentElement;

        this.domElement.addEventListener('wheel', this._onWheel, { passive: true });
        this.domElement.addEventListener('mousedown', this._onDragStart);
        this.domElement.addEventListener('mouseup', this._onDragEnd);
        this.domElement.addEventListener('contextmenu', this._onContextMenu);

        this._lastMouse = [0, 0];

        this.camera.lookAt(camera.target);
    }

    private _onWheel = (e: WheelEvent) => {
        const { deltaY } = e;
        const { position, target } = this.camera;
        if (deltaY > 0) {
            position.sub(target).scale(1.25).add(target);
        } else {
            position.sub(target).scale(0.8).add(target);
        }
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
        OrbitControls._xAxis.setFromMatrix4Column(matrixWorld, 0);
        OrbitControls._yAxis.setFromMatrix4Column(matrixWorld, 1);
        OrbitControls._zAxis.setFromMatrix4Column(matrixWorld, 2);

        if (buttons & MouseButton.LEFT) {
            position.sub(target);

            const rotateX = -deltaY * 0.01;
            position.applyAxisAngle(OrbitControls._xAxis, rotateX);
            up.applyAxisAngle(OrbitControls._xAxis, rotateX);

            const rotateY = -deltaX * 0.01;
            position.applyAxisAngle(OrbitControls._yAxis, rotateY);
            up.applyAxisAngle(OrbitControls._yAxis, rotateY);

            position.add(target);

            this.camera.lookAt(target);
        } else if (buttons & MouseButton.RIGHT) {
            const vDepth = OrbitControls._zAxis.setLength(-deltaY);
            position.add(vDepth);
            target.add(vDepth);

            const vHorizontal = OrbitControls._xAxis.setLength(-deltaX);
            position.add(vHorizontal);
            target.add(vHorizontal);

            this.camera.lookAt(target);
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
