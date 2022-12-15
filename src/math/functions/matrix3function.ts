export class Matrix3Function {
    public static set<T extends Array<number>>(
        out: T,
        n11: number,
        n12: number,
        n13: number,
        n21: number,
        n22: number,
        n23: number,
        n31: number,
        n32: number,
        n33: number
    ) {
        out[0] = n11;
        out[1] = n21;
        out[2] = n31;
        out[3] = n12;
        out[4] = n22;
        out[5] = n32;
        out[6] = n13;
        out[7] = n23;
        out[8] = n33;
        return out;
    }

    public static identity<T extends Array<number>>(out: T) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 1;
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    }

    public static copy<T extends Array<number>>(out: T, a: number[]) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[8] = a[8];
        return out;
    }

    public static transpose<T extends Array<number>>(out: T, a: number[]) {
        if (out === a) {
            const a1 = a[1];
            const a2 = a[2];
            const a5 = a[5];
            out[1] = a[3];
            out[2] = a[6];
            out[3] = a1;
            out[5] = a[7];
            out[6] = a2;
            out[7] = a5;
        } else {
            out[0] = a[0];
            out[1] = a[3];
            out[2] = a[6];
            out[3] = a[1];
            out[4] = a[4];
            out[5] = a[7];
            out[6] = a[2];
            out[7] = a[5];
            out[8] = a[8];
        }

        return out;
    }

    public static invert<T extends Array<number>>(out: T, a: number[]) {
        const [n11, n21, n31, n12, n22, n32, n13, n23, n33] = a;
        const t11 = n33 * n22 - n32 * n23;
        const t12 = n32 * n13 - n33 * n12;
        const t13 = n23 * n12 - n22 * n13;
        const det = n11 * t11 + n21 * t12 + n31 * t13;
        if (det === 0) return Matrix3Function.set(out, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        const detInv = 1 / det;
        out[0] = t11 * detInv;
        out[1] = (n31 * n23 - n33 * n21) * detInv;
        out[2] = (n32 * n21 - n31 * n22) * detInv;
        out[3] = t12 * detInv;
        out[4] = (n33 * n11 - n31 * n13) * detInv;
        out[5] = (n31 * n12 - n32 * n11) * detInv;
        out[6] = t13 * detInv;
        out[7] = (n21 * n13 - n23 * n11) * detInv;
        out[8] = (n22 * n11 - n21 * n12) * detInv;
        return out;
    }

    public static determinant(m: number[]) {
        const [a, b, c, d, e, f, g, h, i] = m;
        return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
    }

    public static multiply<T extends Array<number>>(out: T, a: number[], b: number[]) {
        const [a11, a21, a31, a12, a22, a32, a13, a23, a33] = a;
        const [b11, b21, b31, b12, b22, b32, b13, b23, b33] = b;
        out[0] = a11 * b11 + a12 * b21 + a13 * b31;
        out[3] = a11 * b12 + a12 * b22 + a13 * b32;
        out[6] = a11 * b13 + a12 * b23 + a13 * b33;
        out[1] = a21 * b11 + a22 * b21 + a23 * b31;
        out[4] = a21 * b12 + a22 * b22 + a23 * b32;
        out[7] = a21 * b13 + a22 * b23 + a23 * b33;
        out[2] = a31 * b11 + a32 * b21 + a33 * b31;
        out[5] = a31 * b12 + a32 * b22 + a33 * b32;
        out[8] = a31 * b13 + a32 * b23 + a33 * b33;
        return out;
    }

    public static setFromMatrix4<T extends Array<number>>(out: T, a: number[]) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[4];
        out[4] = a[5];
        out[5] = a[6];
        out[6] = a[8];
        out[7] = a[9];
        out[8] = a[10];
        return out;
    }

    public static setFromQuaternion<T extends Array<number>>(out: T, q: number[]) {
        const [x, y, z, w] = q;
        let x2 = x + x;
        let y2 = y + y;
        let z2 = z + z;

        let xx = x * x2;
        let yx = y * x2;
        let yy = y * y2;
        let zx = z * x2;
        let zy = z * y2;
        let zz = z * z2;
        let wx = w * x2;
        let wy = w * y2;
        let wz = w * z2;

        out[0] = 1 - yy - zz;
        out[3] = yx - wz;
        out[6] = zx + wy;

        out[1] = yx + wz;
        out[4] = 1 - xx - zz;
        out[7] = zy - wx;

        out[2] = zx - wy;
        out[5] = zy + wx;
        out[8] = 1 - xx - yy;

        return out;
    }

    public static multiplyScalar<T extends Array<number>>(out: T, a: number[], s: number) {
        out[0] = a[0] * s;
        out[1] = a[1] * s;
        out[2] = a[2] * s;
        out[3] = a[3] * s;
        out[4] = a[4] * s;
        out[5] = a[5] * s;
        out[6] = a[6] * s;
        out[7] = a[7] * s;
        out[8] = a[8] * s;
        return out;
    }
}
