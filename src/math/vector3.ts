import { Vector3Function } from './functions/vector3function';

export class Vector3 extends Array<number> {
    public get x() {
        return this[0];
    }

    public get y() {
        return this[1];
    }

    public get z() {
        return this[2];
    }

    public set x(v: number) {
        this[0] = v;
    }

    public set y(v: number) {
        this[1] = v;
    }

    public set z(v: number) {
        this[2] = v;
    }

    constructor(x = 0, y = 0, z = 0) {
        super(x, y, z);
        Object.setPrototypeOf(this, Vector3.prototype);
    }

    public set(x: number, y: number, z: number) {
        return Vector3Function.set(this, x, y, z);
    }

    public setX(x: number) {
        this[0] = x;
        return this;
    }

    public setY(y: number) {
        this[1] = y;
        return this;
    }

    public setZ(z: number) {
        this[2] = z;
        return this;
    }

    public copy(v: number[]) {
        return Vector3Function.copy(this, v);
    }

    public add(v: number[]) {
        return Vector3Function.add(this, this, v);
    }

    public sub(v: number[]) {
        return Vector3Function.sub(this, this, v);
    }

    public dot(v: number[]) {
        return Vector3Function.dot(this, v);
    }

    public cross(v: number[]) {
        return Vector3Function.cross(this, this, v);
    }

    public scale(scalar: number) {
        return Vector3Function.scale(this, this, scalar);
    }

    public multiply(v: number[]) {
        return Vector3Function.multiply(this, this, v);
    }

    public divide(v: number[]) {
        return Vector3Function.divide(this, this, v);
    }

    public negate() {
        return Vector3Function.negate(this, this);
    }

    public invert() {
        return Vector3Function.invert(this, this);
    }

    public normalize() {
        return Vector3Function.normalize(this, this);
    }

    public len() {
        return Vector3Function.len(this);
    }

    public setLength(length: number) {
        return this.normalize().scale(length);
    }

    public distanceTo(v: number[]) {
        return Vector3Function.distance(this, v);
    }

    public angleTo(v: number[]) {
        return Vector3Function.angle(this, v);
    }

    public applyMatrix3(m: number[]) {
        return Vector3Function.transformMatrix3(this, this, m);
    }

    public applyMatrix4(m: number[]) {
        return Vector3Function.transformMatrix4(this, this, m);
    }

    public applyQuaternion(q: number[]) {
        return Vector3Function.transformQuaternion(this, this, q);
    }

    public applyAxisAngle(axis: number[], angle: number) {
        const q: number[] = [];
        const halfAngle = angle / 2;
        const s = Math.sin(halfAngle);
        q[0] = axis[0] * s;
        q[1] = axis[1] * s;
        q[2] = axis[2] * s;
        q[3] = Math.cos(halfAngle);
        return this.applyQuaternion(q);
    }

    public reflect(normal: number[]) {
        const scale = 2 * this.dot(normal);
        return this.sub([normal[0] * scale, normal[1] * scale, normal[2] * scale]);
    }

    public setFromMatrix4Column(m: number[], index: number) {
        return this.fromArray(m, index * 4);
    }

    public equals(v: number[]) {
        return v[0] === this[0] && v[1] === this[1] && v[2] === this[2];
    }

    public nealyEquals(v: number[], tolerance = 1e-6) {
        return Math.abs(this[0] - v[0]) < tolerance && Math.abs(this[1] - v[1]) < tolerance && Math.abs(this[2] - v[2]) < tolerance;
    }

    public fromArray(array: number[], offset = 0) {
        this[0] = array[offset];
        this[1] = array[offset + 1];
        this[2] = array[offset + 2];
        return this;
    }

    public toArray(array: number[] = [], offset = 0) {
        array[offset] = this[0];
        array[offset + 1] = this[1];
        array[offset + 2] = this[2];
        return array;
    }

    public random() {
        this[0] = Math.random();
        this[1] = Math.random();
        this[2] = Math.random();
        return this;
    }

    public clone() {
        return new Vector3(this[0], this[1], this[2]);
    }
}
