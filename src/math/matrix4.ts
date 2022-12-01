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
        this[0] = n11;
        this[1] = n21;
        this[2] = n31;
        this[3] = n41;
        this[4] = n12;
        this[5] = n22;
        this[6] = n32;
        this[7] = n42;
        this[8] = n13;
        this[9] = n23;
        this[10] = n33;
        this[11] = n43;
        this[12] = n14;
        this[13] = n24;
        this[14] = n34;
        this[15] = n44;
        return this;
    }

    public identity() {
        this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        return this;
    }

    public clone() {
        return new Matrix4().fromArray(this);
    }

    public copy(m: number[]) {
        this[0] = m[0];
        this[1] = m[1];
        this[2] = m[2];
        this[3] = m[3];
        this[4] = m[4];
        this[5] = m[5];
        this[6] = m[6];
        this[7] = m[7];
        this[8] = m[8];
        this[9] = m[9];
        this[10] = m[10];
        this[11] = m[11];
        this[12] = m[12];
        this[13] = m[13];
        this[14] = m[14];
        this[15] = m[15];
        return this;
    }

    public setFromMatrix3(m: number[]) {
        this.set(m[0], m[3], m[6], 0, m[1], m[4], m[7], 0, m[2], m[5], m[8], 0, 0, 0, 0, 1);
        return this;
    }

    public makeBasis(xAxis: number[], yAxis: number[], zAxis: number[]) {
        this.set(xAxis[0], yAxis[0], zAxis[0], 0, xAxis[1], yAxis[1], zAxis[1], 0, xAxis[2], yAxis[2], zAxis[2], 0, 0, 0, 0, 1);
        return this;
    }

    public multiply(m: number[]) {
        return this.multiplyMatrices(this, m);
    }

    public premultiply(m: number[]) {
        return this.multiplyMatrices(m, this);
    }

    public multiplyMatrices(a: number[], b: number[]) {
        const [a11, a21, a31, a41, a12, a22, a32, a42, a13, a23, a33, a43, a14, a24, a34, a44] = a;
        const [b11, b21, b31, b41, b12, b22, b32, b42, b13, b23, b33, b43, b14, b24, b34, b44] = b;
        this[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        this[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        this[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        this[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
        this[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        this[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        this[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        this[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
        this[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        this[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        this[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        this[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
        this[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        this[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        this[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        this[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
        return this;
    }

    public multiplyScalar(s: number) {
        this[0] *= s;
        this[4] *= s;
        this[8] *= s;
        this[12] *= s;
        this[1] *= s;
        this[5] *= s;
        this[9] *= s;
        this[13] *= s;
        this[2] *= s;
        this[6] *= s;
        this[10] *= s;
        this[14] *= s;
        this[3] *= s;
        this[7] *= s;
        this[11] *= s;
        this[15] *= s;
        return this;
    }

    public determinant() {
        const [n11, n21, n31, n41, n12, n22, n32, n42, n13, n23, n33, n43, n14, n24, n34, n44] = this;
        return (
            n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) +
            n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) +
            n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) +
            n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31)
        );
    }

    public transpose() {
        let tmp;
        tmp = this[1];
        this[1] = this[4];
        this[4] = tmp;
        tmp = this[2];
        this[2] = this[8];
        this[8] = tmp;
        tmp = this[6];
        this[6] = this[9];
        this[9] = tmp;
        tmp = this[3];
        this[3] = this[12];
        this[12] = tmp;
        tmp = this[7];
        this[7] = this[13];
        this[13] = tmp;
        tmp = this[11];
        this[11] = this[14];
        this[14] = tmp;
        return this;
    }

    public setPosition(v: number[]): this;
    public setPosition(x: number, y: number, z: number): this;
    public setPosition(x: number | number[], y?: number, z?: number) {
        if (typeof x === 'number') {
            this[12] = x;
            this[13] = y!;
            this[14] = z!;
        } else {
            this[12] = x[0];
            this[13] = x[1];
            this[14] = x[2];
        }
        return this;
    }

    public invert() {
        const [n11, n21, n31, n41, n12, n22, n32, n42, n13, n23, n33, n43, n14, n24, n34, n44] = this;
        const t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
        const t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
        const t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
        const t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
        const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
        if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        const detInv = 1 / det;
        this[0] = t11 * detInv;
        this[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
        this[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
        this[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
        this[4] = t12 * detInv;
        this[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
        this[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
        this[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
        this[8] = t13 * detInv;
        this[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
        this[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
        this[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
        this[12] = t14 * detInv;
        this[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
        this[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
        this[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
        return this;
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

    public makePerspective(fov: number, aspect: number, near: number, far: number) {
        var f = Math.tan(((180 - fov) * Math.PI) / 360);
        var rangeInv = 1.0 / (near - far);
        this[0] = f / aspect;
        this[4] = 0;
        this[8] = 0;
        this[12] = 0;
        this[1] = 0;
        this[5] = f;
        this[9] = 0;
        this[13] = 0;
        this[2] = 0;
        this[6] = 0;
        this[10] = (near + far) * rangeInv;
        this[14] = near * far * rangeInv * 2;
        this[3] = 0;
        this[7] = 0;
        this[11] = -1;
        this[15] = 0;
        return this;
    }

    public makeOrthographic(left: number, right: number, top: number, bottom: number, near: number, far: number) {
        const w = right - left;
        const h = top - bottom;
        const depth = far - near;
        this[0] = 2 / w;
        this[4] = 0;
        this[8] = 0;
        this[12] = -(right + left) / w;
        this[1] = 0;
        this[5] = 2 / h;
        this[9] = 0;
        this[13] = -(top + bottom) / h;
        this[2] = 0;
        this[6] = 0;
        this[10] = -2 / depth;
        this[14] = -(far + near) / depth;
        this[3] = 0;
        this[7] = 0;
        this[11] = 0;
        this[15] = 1;
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
}
