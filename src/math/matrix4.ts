import { Matrix4Function } from './functions/matrix4function';

/**
 * 四阶矩阵
 * ┎ n11 n12 n13 n14 ┓
 * ┃ n21 n22 n23 n24 ┃
 * ┃ n31 n32 n33 n34 ┃
 * ┗ n41 n42 n43 n44 ┚
 *
 * 在数组中存储的位置，按列优先存储
 * [n11, n21, n31, n41, n12, n22, n32, n42, n13, n23, n33, n43, n14, n24, n34, n44]
 *
 * 用数组索引表示为
 * ┎ 0 4  8 12 ┓
 * ┃ 1 5  9 13 ┃
 * ┃ 2 6 10 14 ┃
 * ┗ 3 7 11 15 ┚
 */
export class Matrix4 extends Array<number> {
    constructor() {
        super(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        Object.setPrototypeOf(this, Matrix4.prototype);
    }

    public set(
        n11: number,
        n12: number,
        n13: number,
        n14: number,
        n21: number,
        n22: number,
        n23: number,
        n24: number,
        n31: number,
        n32: number,
        n33: number,
        n34: number,
        n41: number,
        n42: number,
        n43: number,
        n44: number
    ) {
        return Matrix4Function.set(this, n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44);
    }

    public identity() {
        return Matrix4Function.identity(this);
    }

    public copy(m: number[]) {
        return Matrix4Function.copy(this, m);
    }

    public transpose() {
        return Matrix4Function.transpose(this, this);
    }

    public invert() {
        return Matrix4Function.invert(this, this);
    }

    public determinant() {
        return Matrix4Function.determinant(this);
    }

    public multiply(m: number[]) {
        return Matrix4Function.multiply(this, this, m);
    }

    public premultiply(m: number[]) {
        return Matrix4Function.multiply(this, m, this);
    }

    public getPosition() {
        return Matrix4Function.getPosition(new Array<number>(3), this);
    }

    public setFromBasis(xAxis: number[], yAxis: number[], zAxis: number[]) {
        return Matrix4Function.setFromBasis(this, xAxis, yAxis, zAxis);
    }

    public setFromMatrix3(m3: number[]) {
        return Matrix4Function.setFromMatrix3(this, m3);
    }

    public setFromQuaternion(q: number[]) {
        return Matrix4Function.setFromQuaternion(this, q);
    }

    public compose(position: number[], quaternion: number[], scale: number[]) {
        return Matrix4Function.compose(this, position, quaternion, scale);
    }

    public decompose(position: number[], quaternion: number[], scale: number[]) {
        return Matrix4Function.decompose(this, position, quaternion, scale);
    }

    public makePerspective(fov: number, aspect: number, near: number, far: number) {
        return Matrix4Function.makePerspective(this, fov, aspect, near, far);
    }

    public makeOrthographic(left: number, right: number, top: number, bottom: number, near: number, far: number) {
        return Matrix4Function.makeOrthographic(this, left, right, top, bottom, near, far);
    }

    public lookAt(eye: number[], target: number[], up: number[]) {
        return Matrix4Function.lookAt(this, eye, target, up);
    }

    public multiplyScalar(s: number) {
        return Matrix4Function.multiplyScalar(this, this, s);
    }

    /**
     * 等价于左乘矩阵
     * ┎ sx 0  0  0 ┓
     * ┃ 0  sy 0  0 ┃
     * ┃ 0  0  sz 0 ┃
     * ┗ 0  0  0  1 ┚
     */
    public scale(sx: number, sy: number, sz: number) {
        this[0] *= sx;
        this[4] *= sx;
        this[8] *= sx;
        this[12] *= sx;
        this[1] *= sy;
        this[5] *= sy;
        this[9] *= sy;
        this[13] *= sy;
        this[2] *= sz;
        this[6] *= sz;
        this[10] *= sz;
        this[14] *= sz;
        return this;
    }

    /**
     * 等价于左乘矩阵
     * ┎ 1 0       0      0 ┓
     * ┃ 0 cos(θ) -sin(θ) 0 ┃
     * ┃ 0 sin(θ)  cos(θ) 0 ┃
     * ┗ 0 0       0      1 ┚
     */
    public rotateX(theta: number) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const [, n21, n31, , , n22, n32, , , n23, n33, , , n24, n34] = this;
        this[1] = c * n21 - s * n31;
        this[5] = c * n22 - s * n32;
        this[9] = c * n23 - s * n33;
        this[13] = c * n24 - s * n34;
        this[2] = s * n21 + c * n31;
        this[6] = s * n22 + c * n32;
        this[10] = s * n23 + c * n33;
        this[14] = s * n24 + c * n34;
        return this;
    }

    /**
     * 等价于左乘矩阵
     * ┎  cos(θ) 0 sin(θ) 0 ┓
     * ┃  0      1 0      0 ┃
     * ┃ -sin(θ) 0 cos(θ) 0 ┃
     * ┗  0      0 0      1 ┚
     */
    public rotateY(theta: number) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const [n11, , n31, , n12, , n32, , n13, , n33, , n14, , n34] = this;
        this[0] = c * n11 + s * n31;
        this[4] = c * n12 + s * n32;
        this[8] = c * n13 + s * n33;
        this[12] = c * n14 + s * n34;
        this[2] = c * n31 - s * n11;
        this[6] = c * n32 - s * n12;
        this[10] = c * n33 - s * n13;
        this[14] = c * n34 - s * n14;
        return this;
    }

    /**
     * 等价于左乘矩阵
     * ┎ cos(θ) -sin(θ)  0 0 ┓
     * ┃ sin(θ)  cos(θ)  0 0 ┃
     * ┃ 0       0       1 0 ┃
     * ┗ 0       0       0 1 ┚
     */
    public rotateZ(theta: number) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const [n11, n21, , , n12, n22, , , n13, n23, , , n14, n24, ,] = this;
        this[0] = c * n11 - s * n21;
        this[4] = c * n12 - s * n22;
        this[8] = c * n13 - s * n23;
        this[12] = c * n14 - s * n24;
        this[1] = s * n11 + c * n21;
        this[5] = s * n12 + c * n22;
        this[9] = s * n13 + c * n23;
        this[13] = s * n14 + c * n24;
        return this;
    }

    /**
     * 等价于左乘矩阵
     * ┎ 1  0  0  tx ┓
     * ┃ 0  1  0  ty ┃
     * ┃ 0  0  1  tz ┃
     * ┗ 0  0  0  1  ┚
     */
    public translate(tx: number, ty: number, tz: number) {
        this[0] += tx * this[3];
        this[4] += tx * this[7];
        this[8] += tx * this[11];
        this[12] += tx * this[15];
        this[1] += ty * this[3];
        this[5] += ty * this[7];
        this[9] += ty * this[11];
        this[13] += ty * this[15];
        this[2] += tz * this[3];
        this[6] += tz * this[7];
        this[10] += tz * this[11];
        this[14] += tz * this[15];
        return this;
    }

    public equals(m: number[]) {
        return (
            this[0] === m[0] &&
            this[1] === m[1] &&
            this[2] === m[2] &&
            this[3] === m[3] &&
            this[4] === m[4] &&
            this[5] === m[5] &&
            this[6] === m[6] &&
            this[7] === m[7] &&
            this[8] === m[8] &&
            this[9] === m[9] &&
            this[10] === m[10] &&
            this[11] === m[11] &&
            this[12] === m[12] &&
            this[13] === m[13] &&
            this[14] === m[14] &&
            this[15] === m[15]
        );
    }

    public fromArray(array: number[], offset = 0) {
        this[0] = array[offset];
        this[1] = array[offset + 1];
        this[2] = array[offset + 2];
        this[3] = array[offset + 3];
        this[4] = array[offset + 4];
        this[5] = array[offset + 5];
        this[6] = array[offset + 6];
        this[7] = array[offset + 7];
        this[8] = array[offset + 8];
        this[9] = array[offset + 9];
        this[10] = array[offset + 10];
        this[11] = array[offset + 11];
        this[12] = array[offset + 12];
        this[13] = array[offset + 13];
        this[14] = array[offset + 14];
        this[15] = array[offset + 15];
        return this;
    }

    public toArray(array: number[] = [], offset = 0) {
        array[offset] = this[0];
        array[offset + 1] = this[1];
        array[offset + 2] = this[2];
        array[offset + 3] = this[3];
        array[offset + 4] = this[4];
        array[offset + 5] = this[5];
        array[offset + 6] = this[6];
        array[offset + 7] = this[7];
        array[offset + 8] = this[8];
        array[offset + 9] = this[9];
        array[offset + 10] = this[10];
        array[offset + 11] = this[11];
        array[offset + 12] = this[12];
        array[offset + 13] = this[13];
        array[offset + 14] = this[14];
        array[offset + 15] = this[15];
        return array;
    }

    /**
     * 获取第 i 行 第 j 列
     */
    public getItem(i: number, j: number) {
        return this[i - 1 + j * 4 - 4];
    }

    public clone() {
        return new Matrix4().fromArray(this);
    }
}
