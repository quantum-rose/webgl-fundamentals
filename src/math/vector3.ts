import { MathUtils } from '../utils/mathutils';

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
        this[0] = x;
        this[1] = y;
        this[2] = z;
        return this;
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

    public clone() {
        return new Vector3(this[0], this[1], this[2]);
    }

    public copy(v: number[]) {
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
        return this;
    }

    public add(v: number[]) {
        this[0] += v[0];
        this[1] += v[1];
        this[2] += v[2];
        return this;
    }

    public sub(v: number[]) {
        this[0] -= v[0];
        this[1] -= v[1];
        this[2] -= v[2];
        return this;
    }

    public dot(v: number[]) {
        return this[0] * v[0] + this[1] * v[1] + this[2] * v[2];
    }

    public cross(v: number[]) {
        const [x, y, z] = this;
        this[0] = y * v[2] - z * v[1];
        this[1] = z * v[0] - x * v[2];
        this[2] = x * v[1] - y * v[0];
        return this;
    }

    public scale(scalar: number) {
        this[0] *= scalar;
        this[1] *= scalar;
        this[2] *= scalar;
        return this;
    }

    public negate() {
        return this.scale(-1);
    }

    public applyMatrix3(m: number[]) {
        const [x, y, z] = this;
        this[0] = m[0] * x + m[3] * y + m[6] * z;
        this[1] = m[1] * x + m[4] * y + m[7] * z;
        this[2] = m[2] * x + m[5] * y + m[8] * z;
        return this;
    }

    public applyMatrix4(m: number[]) {
        const [x, y, z] = this;
        const w = 1 / (m[3] * x + m[7] * y + m[11] * z + m[15]);
        this[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) * w;
        this[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) * w;
        this[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) * w;
        return this;
    }

    public len() {
        return Math.hypot(this[0], this[1], this[2]);
    }

    public setLength(length: number) {
        return this.normalize().scale(length);
    }

    public normalize() {
        return this.scale(1 / this.len() || 1);
    }

    public reflect(normal: number[]) {
        const scale = 2 * this.dot(normal);
        return this.sub([normal[0] * scale, normal[1] * scale, normal[2] * scale]);
    }

    public angleTo(v: number[]) {
        const denominator = this.len() * Math.hypot(v[0], v[1], v[2]);
        if (denominator === 0) return Math.PI / 2;
        const theta = MathUtils.clamp(this.dot(v) / denominator, -1, 1);
        return Math.acos(theta);
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

    public applyQuaternion(q: number[]) {
        const [x, y, z] = this;
        const [qx, qy, qz, qw] = q;

        // calculate quat * vector

        const ix = qw * x + qy * z - qz * y;
        const iy = qw * y + qz * x - qx * z;
        const iz = qw * z + qx * y - qy * x;
        const iw = -qx * x - qy * y - qz * z;

        // calculate result * inverse quat

        this[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        this[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        this[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

        return this;
    }

    public distanceTo(v: number[]) {
        return Math.hypot(this[0] - v[0], this[1] - v[1], (this[2] = v[2]));
    }

    public setFromMatrixColumn(m: number[], index: number) {
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
}
