import { Object3DClass } from '../constants';
import { Matrix4, Quaternion, Vector3 } from '../math';

export abstract class Object3D {
    public static DefaultUp = new Vector3(0, 1, 0);

    private static _xAxis = new Vector3(1, 0, 0);

    private static _yAxis = new Vector3(0, 1, 0);

    private static _zAxis = new Vector3(0, 0, 1);

    private static _rotationMatrix = new Matrix4();

    private static _quaternion = new Quaternion();

    private static _currentId = 0;

    public abstract classId: Object3DClass;

    public id: number;

    public position: Vector3;

    public scale: Vector3;

    public quaternion: Quaternion;

    public up: Vector3;

    public matrix: Matrix4;

    public matrixWorld: Matrix4;

    public parent: Object3D | null;

    public children: Object3D[];

    public visible: boolean;

    constructor() {
        this.id = Object3D._currentId++;
        this.position = new Vector3();
        this.scale = new Vector3(1, 1, 1);
        this.quaternion = new Quaternion();
        this.up = Object3D.DefaultUp.clone();
        this.matrix = new Matrix4();
        this.matrixWorld = new Matrix4();
        this.parent = null;
        this.children = [];
        this.visible = true;
    }

    public lookAt(v: number[]): void;
    public lookAt(x: number, y: number, z: number): void;
    public lookAt(x: number | number[], y?: number, z?: number) {
        let target: number[];
        if (typeof x === 'number') {
            target = [x, y!, z!];
        } else {
            target = x;
        }
        this.updateWorldMatrix();
        const position = this.matrixWorld.getPosition();
        if (this.classId === Object3DClass.OrthographicCamera || this.classId === Object3DClass.PerspectiveCamera) {
            Object3D._rotationMatrix.lookAt(position, target, this.up);
        } else {
            Object3D._rotationMatrix.lookAt(target, position, this.up);
        }
        this.quaternion.setFromMatrix4(Object3D._rotationMatrix);
        if (this.parent) {
            Object3D._quaternion.setFromMatrix4(this.parent.matrixWorld).invert();
            this.quaternion.premultiply(Object3D._quaternion);
        }
    }

    public updateMatrix() {
        this.matrix.compose(this.position, this.quaternion, this.scale);
    }

    public updateMatrixWorld() {
        this.updateMatrix();
        if (this.parent) {
            this.matrixWorld.copy(this.parent.matrixWorld).multiply(this.matrix);
        } else {
            this.matrixWorld.copy(this.matrix);
        }
        this.children.forEach(child => child.updateMatrixWorld());
    }

    public updateWorldMatrix() {
        if (this.parent) {
            this.parent.updateWorldMatrix();
        }
        this.updateMatrix();
        if (this.parent) {
            this.matrixWorld.copy(this.parent.matrixWorld).multiply(this.matrix);
        } else {
            this.matrixWorld.copy(this.matrix);
        }
    }

    public setParent(parent: Object3D) {
        if (this.parent) {
            const idx = this.parent.children.indexOf(this);
            if (idx === -1) {
                throw '';
            }
            this.parent.children.splice(idx, 1);
        }
        this.parent = parent;
        this.parent.children.push(this);
    }

    public applyMatrix4(matrix: number[]) {
        this.updateMatrix();
        this.matrix.premultiply(matrix);
        this.matrix.decompose(this.position, this.quaternion, this.scale);
    }

    public traverse(callback: (obj: Object3D) => boolean) {
        if (callback(this)) return;
        this.children.forEach(child => child.traverse(callback));
    }

    public rotateOnWorldAxis(axis: number[], angle: number) {
        Object3D._quaternion.setFromAxisAngle(axis, angle);
        this.quaternion.premultiply(Object3D._quaternion);
        return this;
    }

    public rotateOnAxis(axis: number[], angle: number) {
        Object3D._quaternion.setFromAxisAngle(axis, angle);
        this.quaternion.multiply(Object3D._quaternion);
        return this;
    }

    public rotateX(angle: number) {
        return this.rotateOnAxis(Object3D._xAxis, angle);
    }

    public rotateY(angle: number) {
        return this.rotateOnAxis(Object3D._yAxis, angle);
    }

    public rotateZ(angle: number) {
        return this.rotateOnAxis(Object3D._zAxis, angle);
    }
}
