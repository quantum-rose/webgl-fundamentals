import { AttributeName } from '../interfaces';
import { Matrix3, Matrix4 } from '../math';
import { WebGLUtil } from '../utils/webglutil';
import { BufferAttribute } from './bufferattribute';

export class BufferGeometry {
    private static _matrix3 = new Matrix3();

    private static _matrix4 = new Matrix4();

    private static _currentId = 0;

    public id: number;

    public attributes: Map<AttributeName, BufferAttribute>;

    public first: number;

    public count: number;

    constructor() {
        this.id = BufferGeometry._currentId++;
        this.attributes = new Map();
        this.first = 0;
        this.count = 0;
    }

    public setAttribute(name: AttributeName, value: BufferAttribute) {
        this.attributes.set(name, value);
        if (name === 'index') {
            this.count = value.count;
        } else {
            this.count = Math.max(this.count, value.count);
        }
    }

    public getAttribute(name: AttributeName) {
        return this.attributes.get(name);
    }

    public setIndex(indices: number[] | Uint16Array | Uint32Array) {
        let array: Uint16Array | Uint32Array;
        if (Array.isArray(indices)) {
            if (WebGLUtil.arrayNeedsUint32(indices)) {
                array = new Uint32Array(indices);
            } else {
                array = new Uint16Array(indices);
            }
        } else {
            array = indices;
        }
        this.setAttribute('index', new BufferAttribute(array, 1));
    }

    public applyMatrix4(matrix: number[]) {
        const position = this.attributes.get('position');
        if (position !== undefined) {
            position.applyMatrix4(matrix);
            position.needsUpdate = true;
        }

        const normal = this.attributes.get('normal');
        if (normal !== undefined) {
            BufferGeometry._matrix3.getNormalMatrix(matrix);
            normal.applyNormalMatrix(BufferGeometry._matrix3);
            normal.needsUpdate = true;
        }

        return this;
    }

    public applyQuaternion(q: number[]) {
        BufferGeometry._matrix4.setFromQuaternion(q);
        return this.applyMatrix4(BufferGeometry._matrix4);
    }

    public scale(sx: number, sy: number, sz: number) {
        BufferGeometry._matrix4.makeScale(sx, sy, sz);
        return this.applyMatrix4(BufferGeometry._matrix4);
    }

    public rotateX(theta: number) {
        BufferGeometry._matrix4.makeRotationX(theta);
        return this.applyMatrix4(BufferGeometry._matrix4);
    }

    public rotateY(theta: number) {
        BufferGeometry._matrix4.makeRotationY(theta);
        return this.applyMatrix4(BufferGeometry._matrix4);
    }

    public rotateZ(theta: number) {
        BufferGeometry._matrix4.makeRotationZ(theta);
        return this.applyMatrix4(BufferGeometry._matrix4);
    }

    public translate(tx: number, ty: number, tz: number) {
        BufferGeometry._matrix4.makeTranslation(tx, ty, tz);
        return this.applyMatrix4(BufferGeometry._matrix4);
    }

    public toLinesGeometry() {
        const newBufferGeometry = new BufferGeometry();
        if (this.attributes.has('index')) {
            this.attributes.forEach((attribute, name) => {
                if (name === 'index') {
                    const newAttribute = attribute.toLinesData();
                    newBufferGeometry.setAttribute(name, newAttribute);
                } else {
                    newBufferGeometry.setAttribute(name, attribute.clone());
                }
            });
        } else {
            this.attributes.forEach((attribute, name) => {
                const newAttribute = attribute.toLinesData();
                newBufferGeometry.setAttribute(name, newAttribute);
            });
        }
        return newBufferGeometry;
    }
}
