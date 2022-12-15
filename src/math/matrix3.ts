import { Matrix3Function } from './functions/matrix3function';

/**
 * 三阶矩阵
 * ┎ n11 n12 n13 ┓
 * ┃ n21 n22 n23 ┃
 * ┗ n31 n32 n33 ┚
 *
 * 在数组中存储的位置，按列优先存储
 * [n11, n21, n31, n12, n22, n32, n13, n23, n33]
 *
 * 用数组索引表示为
 * ┎ 0 3 6 ┓
 * ┃ 1 4 7 ┃
 * ┗ 2 5 8 ┚
 */
export class Matrix3 extends Array<number> {
    constructor() {
        super(1, 0, 0, 0, 1, 0, 0, 0, 1);
        Object.setPrototypeOf(this, Matrix3.prototype);
    }

    public set(n11: number, n12: number, n13: number, n21: number, n22: number, n23: number, n31: number, n32: number, n33: number) {
        return Matrix3Function.set(this, n11, n12, n13, n21, n22, n23, n31, n32, n33);
    }

    public identity() {
        return Matrix3Function.identity(this);
    }

    public copy(m: number[]) {
        return Matrix3Function.copy(this, m);
    }

    public transpose() {
        return Matrix3Function.transpose(this, this);
    }

    public invert() {
        return Matrix3Function.invert(this, this);
    }

    public determinant() {
        return Matrix3Function.determinant(this);
    }

    public multiply(m: number[]) {
        return Matrix3Function.multiply(this, this, m);
    }

    public premultiply(m: number[]) {
        return Matrix3Function.multiply(this, m, this);
    }

    public setFromMatrix4(m: number[]) {
        return Matrix3Function.setFromMatrix4(this, m);
    }

    public setFromQuaternion(q: number[]) {
        return Matrix3Function.setFromQuaternion(this, q);
    }

    public multiplyScalar(s: number) {
        return Matrix3Function.multiplyScalar(this, this, s);
    }

    /**
     * 等价于左乘矩阵
     * ┎ sx 0  0 ┓
     * ┃ 0  sy 0 ┃
     * ┗ 0  0  1 ┚
     */
    public scale(sx: number, sy: number) {
        this[0] *= sx;
        this[3] *= sx;
        this[6] *= sx;
        this[1] *= sy;
        this[4] *= sy;
        this[7] *= sy;
        return this;
    }

    /**
     * 等价于左乘矩阵
     * ┎ cos(θ) -sin(θ)  0 ┓
     * ┃ sin(θ)  cos(θ)  0 ┃
     * ┗ 0       0       1 ┚
     */
    public rotate(theta: number) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const [a11, a21, , a12, a22, , a13, a23] = this;
        this[0] = c * a11 - s * a21;
        this[3] = c * a12 - s * a22;
        this[6] = c * a13 - s * a23;
        this[1] = s * a11 + c * a21;
        this[4] = s * a12 + c * a22;
        this[7] = s * a13 + c * a23;
        return this;
    }

    /**
     * 等价于左乘矩阵
     * ┎ 1  0  tx ┓
     * ┃ 0  1  ty ┃
     * ┗ 0  0  1  ┚
     */
    public translate(tx: number, ty: number) {
        this[0] += tx * this[2];
        this[3] += tx * this[5];
        this[6] += tx * this[8];
        this[1] += ty * this[2];
        this[4] += ty * this[5];
        this[7] += ty * this[8];
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
            this[8] === m[8]
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
        return array;
    }

    public toTransformArray() {
        return [this[0], this[3], this[1], this[4], this[6], this[7]] as const;
    }

    public toTransformString() {
        return `matrix(${this.toTransformArray().join(',')})`;
    }

    /**
     * 获取第 i 行 第 j 列
     */
    public getItem(i: number, j: number) {
        return this[i - 1 + j * 3 - 3];
    }

    public clone() {
        return new Matrix3().fromArray(this);
    }
}
