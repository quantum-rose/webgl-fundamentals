import { MouseButton } from '../constants';
import { Camera, OrthographicCamera, PerspectiveCamera } from '../core';
import { Vector3 } from '../math';

export class OrbitControls {
    private static _xAxis = new Vector3();

    private static _yAxis = new Vector3();

    private static _zAxis = new Vector3();

    public camera: Camera;

    public domElement: HTMLElement;

    private _lastPointer: [number, number];

    constructor(camera: Camera, domElement?: HTMLElement) {
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
        if (this.camera instanceof PerspectiveCamera) {
            const { position, target } = this.camera;
            if (deltaY > 0) {
                position.sub(target).scale(1.25).add(target);
            } else {
                position.sub(target).scale(0.8).add(target);
            }
        } else if (this.camera instanceof OrthographicCamera) {
            if (deltaY > 0) {
                this.camera.zoom *= 0.8;
            } else {
                this.camera.zoom *= 1.25;
            }
            this.camera.updateProjectionMatrix();
        }
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
            if (this.camera instanceof PerspectiveCamera) {
                const { fov } = this.camera;
                const targetDistance = position.distanceTo(target);
                const k = (2 * Math.tan(((fov / 2) * Math.PI) / 180) * targetDistance) / this.domElement.clientHeight;

                const vHorizontal = OrbitControls._xAxis.setLength(-deltaX * k);
                const vVertical = OrbitControls._yAxis.setLength(deltaY * k);

                position.add(vHorizontal).add(vVertical);
                target.add(vHorizontal).add(vVertical);
            } else if (this.camera instanceof OrthographicCamera) {
                const { left, right, top, bottom, zoom } = this.camera;

                const vHorizontal = OrbitControls._xAxis.setLength((-deltaX * (right - left)) / zoom / this.domElement.clientWidth);
                const vVertical = OrbitControls._yAxis.setLength((deltaY * (top - bottom)) / zoom / this.domElement.clientHeight);

                position.add(vHorizontal).add(vVertical);
                target.add(vHorizontal).add(vVertical);
            }
        } else if (buttons & MouseButton.MIDDLE) {
            const deltaS = (2 * deltaY) / this.domElement.clientHeight;
            if (this.camera instanceof PerspectiveCamera) {
                const { position, target } = this.camera;
                position
                    .sub(target)
                    .scale(Math.max(1 - deltaS, 0))
                    .add(target);
            } else if (this.camera instanceof OrthographicCamera) {
                this.camera.zoom *= Math.max(1 + deltaS, 0);
                this.camera.updateProjectionMatrix();
            }
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
