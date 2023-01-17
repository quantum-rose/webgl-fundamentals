import { MouseButton } from '../constants';
import { OrthographicCamera } from '../core';
import { Vector3 } from '../math';

export class PlanControls {
    private static _xAxis = new Vector3();

    private static _yAxis = new Vector3();

    public camera: OrthographicCamera;

    public domElement: HTMLElement;

    private _lastPointer: [number, number];

    constructor(camera: OrthographicCamera, domElement?: HTMLElement) {
        this.camera = camera;
        this.domElement = domElement ?? document.documentElement;

        this.domElement.addEventListener('wheel', this._onWheel, { passive: true });
        this.domElement.addEventListener('pointerdown', this._onDragStart);
        this.domElement.addEventListener('contextmenu', this._onContextMenu);

        this._lastPointer = [0, 0];

        this.camera.lookAt(camera.target);
    }

    private _onWheel = (e: WheelEvent) => {
        const { deltaY } = e;
        if (deltaY > 0) {
            this.camera.zoom *= 0.8;
        } else {
            this.camera.zoom *= 1.25;
        }
        this.camera.updateProjectionMatrix();
    };

    private _onDragStart = (e: PointerEvent) => {
        this._lastPointer[0] = e.offsetX;
        this._lastPointer[1] = e.offsetY;

        this.domElement.setPointerCapture(e.pointerId);
        this.domElement.addEventListener('pointermove', this._onDragMove);
        this.domElement.addEventListener('pointerup', this._onDragEnd);
    };

    private _onDragMove = (e: PointerEvent) => {
        const { offsetX, offsetY, buttons } = e;
        const deltaX = offsetX - this._lastPointer[0];
        const deltaY = offsetY - this._lastPointer[1];

        const { position, target, matrixWorld } = this.camera;
        PlanControls._xAxis.setFromMatrix4Column(matrixWorld, 0);
        PlanControls._yAxis.setFromMatrix4Column(matrixWorld, 1);

        if (buttons & MouseButton.LEFT || buttons & MouseButton.RIGHT) {
            const { left, right, top, bottom, zoom } = this.camera;

            const vHorizontal = PlanControls._xAxis.setLength((-deltaX * (right - left)) / zoom / this.domElement.clientWidth);
            const vVertical = PlanControls._yAxis.setLength((deltaY * (top - bottom)) / zoom / this.domElement.clientHeight);

            position.add(vHorizontal).add(vVertical);
            target.add(vHorizontal).add(vVertical);
        } else if (buttons & MouseButton.MIDDLE) {
            const deltaS = (2 * deltaY) / this.domElement.clientHeight;
            this.camera.zoom *= Math.max(1 + deltaS, 0);
            this.camera.updateProjectionMatrix();
        }

        this._lastPointer[0] = offsetX;
        this._lastPointer[1] = offsetY;
    };

    private _onDragEnd = (e: PointerEvent) => {
        this.domElement.releasePointerCapture(e.pointerId);
        this.domElement.removeEventListener('pointermove', this._onDragMove);
        this.domElement.removeEventListener('pointerup', this._onDragEnd);
    };

    private _onContextMenu = (e: MouseEvent) => {
        e.preventDefault();
    };
}
