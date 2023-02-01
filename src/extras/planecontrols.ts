import { MouseButton } from '../constants';
import { OrthographicCamera } from '../core';
import { Matrix4, Vector3 } from '../math';

export class PlanControls {
    private static _vector3 = new Vector3();

    private static _matrix4 = new Matrix4();

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

    private _screenToModel(x: number, y: number) {
        PlanControls._matrix4.copy(this.camera.projectionMatrix).multiply(this.camera.matrixWorldInverse).invert();
        return new Vector3(x, y, 0).applyMatrix4(PlanControls._matrix4);
    }

    private _onWheel = (e: WheelEvent) => {
        const { offsetX, offsetY, deltaY } = e;
        const screenX = (offsetX / this.domElement.clientWidth) * 2 - 1;
        const screenY = 1 - 2 * (offsetY / this.domElement.clientHeight);
        const oldPosition = this._screenToModel(screenX, screenY);

        if (deltaY > 0) {
            this.camera.zoom *= 0.8;
        } else {
            this.camera.zoom *= 1.25;
        }
        this.camera.updateProjectionMatrix();

        const newPosition = this._screenToModel(screenX, screenY);
        this.camera.position.add(oldPosition).sub(newPosition);
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

        if (buttons & MouseButton.LEFT || buttons & MouseButton.RIGHT) {
            const { position, target, matrixWorld, left, right, top, bottom, zoom } = this.camera;

            PlanControls._vector3.setFromMatrix4Column(matrixWorld, 0).setLength((-deltaX * (right - left)) / zoom / this.domElement.clientWidth);
            position.add(PlanControls._vector3);
            target.add(PlanControls._vector3);

            PlanControls._vector3.setFromMatrix4Column(matrixWorld, 1).setLength((deltaY * (top - bottom)) / zoom / this.domElement.clientHeight);
            position.add(PlanControls._vector3);
            target.add(PlanControls._vector3);
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
