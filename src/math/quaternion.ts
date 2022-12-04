import { MathUtils } from '../utils/mathutils.js';
import { QuaternionFunction } from './functions/quaternionfunction.js';

export class Quaternion extends Array<number> {
    public get x() {
        return this[0];
    }

    public get y() {
        return this[1];
    }

    public get z() {
        return this[2];
    }

    public get w() {
        return this[3];
    }

    public set x(v) {
        this[0] = v;
    }

    public set y(v) {
        this[1] = v;
    }

    public set z(v) {
        this[2] = v;
    }

    public set w(v) {
        this[3] = v;
    }

    constructor(x = 0, y = 0, z = 0, w = 1) {
        super(x, y, z, w);
        Object.setPrototypeOf(this, Quaternion.prototype);
    }

    public set(x: number, y: number, z: number, w: number) {
        QuaternionFunction.set(this, x, y, z, w);
        return this;
    }

    public identity() {
        QuaternionFunction.identity(this);
        return this;
    }

    public copy(q: number[]) {
        QuaternionFunction.copy(this, q);
        return this;
    }

    public dot(v: number[]) {
        return QuaternionFunction.dot(this, v);
    }

    public multiply(q: number[]) {
        QuaternionFunction.multiply(this, this, q);
        return this;
    }

    public premultiply(q: number[]) {
        QuaternionFunction.multiply(this, q, this);
        return this;
    }

    public conjugate() {
        QuaternionFunction.conjugate(this, this);
        return this;
    }

    public invert() {
        QuaternionFunction.invert(this, this);
        return this;
    }

    public normalize() {
        QuaternionFunction.normalize(this, this);
        return this;
    }

    public len() {
        return Math.hypot(this[0], this[1], this[2], this[3]);
    }

    public rotateX(a: number) {
        QuaternionFunction.rotateX(this, this, a);
        return this;
    }

    public rotateY(a: number) {
        QuaternionFunction.rotateY(this, this, a);
        return this;
    }

    public rotateZ(a: number) {
        QuaternionFunction.rotateZ(this, this, a);
        return this;
    }

    public setFromMatrix3(matrix3: number[]) {
        QuaternionFunction.setFromMatrix3(this, matrix3);
        return this;
    }

    public setFromMatrix4(matrix4: number[]) {
        QuaternionFunction.setFromMatrix4(this, matrix4);
        return this;
    }

    public setFromAxisAngle(axis: number[], a: number) {
        QuaternionFunction.setFromAxisAngle(this, axis, a);
        return this;
    }

    public slerp(q: number[], t: number) {
        QuaternionFunction.slerp(this, this, q, t);
        return this;
    }

    public setFromUnitVectors(vFrom: number[], vTo: number[]) {
        return QuaternionFunction.setFromUnitVectors(this, vFrom, vTo);
    }

    public angleTo(q: number[]) {
        return 2 * Math.acos(Math.abs(MathUtils.clamp(this.dot(q), -1, 1)));
    }

    public rotateTowards(q: number[], step: number) {
        const angle = this.angleTo(q);
        if (angle === 0) return this;
        const t = Math.min(1, step / angle);
        this.slerp(q, t);
        return this;
    }

    public equals(q: number[]) {
        return q[0] === this[0] && q[1] === this[1] && q[2] === this[2] && q[3] === this[3];
    }

    public fromArray(array: number[], offset = 0) {
        this[0] = array[offset];
        this[1] = array[offset + 1];
        this[2] = array[offset + 2];
        this[3] = array[offset + 3];
        return this;
    }

    public toArray(array: number[] = [], offset = 0) {
        array[offset] = this[0];
        array[offset + 1] = this[1];
        array[offset + 2] = this[2];
        array[offset + 3] = this[3];
        return array;
    }

    public clone() {
        return new Quaternion(this[0], this[1], this[2], this[3]);
    }
}
