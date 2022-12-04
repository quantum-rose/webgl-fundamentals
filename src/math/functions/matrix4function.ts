import { QuaternionFunction } from './quaternionfunction';

export class Matrix4Function {
    public static set<T extends Array<number>>(
        out: T,
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
        out[0] = n11;
        out[1] = n21;
        out[2] = n31;
        out[3] = n41;
        out[4] = n12;
        out[5] = n22;
        out[6] = n32;
        out[7] = n42;
        out[8] = n13;
        out[9] = n23;
        out[10] = n33;
        out[11] = n43;
        out[12] = n14;
        out[13] = n24;
        out[14] = n34;
        out[15] = n44;
        return out;
    }

    public static identity<T extends Array<number>>(out: T) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
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
        out[9] = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
        return out;
    }

    public static transpose<T extends Array<number>>(out: T, a: number[]) {
        if (out === a) {
            let tmp;
            tmp = out[1];
            out[1] = out[4];
            out[4] = tmp;
            tmp = out[2];
            out[2] = out[8];
            out[8] = tmp;
            tmp = out[6];
            out[6] = out[9];
            out[9] = tmp;
            tmp = out[3];
            out[3] = out[12];
            out[12] = tmp;
            tmp = out[7];
            out[7] = out[13];
            out[13] = tmp;
            tmp = out[11];
            out[11] = out[14];
            out[14] = tmp;
        } else {
            out[0] = a[0];
            out[1] = a[4];
            out[2] = a[8];
            out[3] = a[12];
            out[4] = a[1];
            out[5] = a[5];
            out[6] = a[9];
            out[7] = a[13];
            out[8] = a[2];
            out[9] = a[6];
            out[10] = a[10];
            out[11] = a[14];
            out[12] = a[3];
            out[13] = a[7];
            out[14] = a[11];
            out[15] = a[15];
        }

        return out;
    }

    public static invert<T extends Array<number>>(out: T, a: number[]) {
        const [n11, n21, n31, n41, n12, n22, n32, n42, n13, n23, n33, n43, n14, n24, n34, n44] = a;
        const t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
        const t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
        const t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
        const t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
        const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
        if (det === 0) return Matrix4Function.set(out, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        const detInv = 1 / det;
        out[0] = t11 * detInv;
        out[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
        out[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
        out[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
        out[4] = t12 * detInv;
        out[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
        out[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
        out[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
        out[8] = t13 * detInv;
        out[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
        out[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
        out[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
        out[12] = t14 * detInv;
        out[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
        out[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
        out[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
        return out;
    }

    public static determinant(a: number[]) {
        const [n11, n21, n31, n41, n12, n22, n32, n42, n13, n23, n33, n43, n14, n24, n34, n44] = a;
        return (
            n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) +
            n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) +
            n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) +
            n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31)
        );
    }

    public static multiply<T extends Array<number>>(out: T, a: number[], b: number[]) {
        const [a11, a21, a31, a41, a12, a22, a32, a42, a13, a23, a33, a43, a14, a24, a34, a44] = a;
        const [b11, b21, b31, b41, b12, b22, b32, b42, b13, b23, b33, b43, b14, b24, b34, b44] = b;
        out[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        out[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        out[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        out[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
        out[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        out[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        out[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        out[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
        out[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        out[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        out[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        out[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
        out[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        out[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        out[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        out[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
        return out;
    }

    public static getPosition<T extends Array<number>>(out: T, m: number[]) {
        out[0] = m[12];
        out[1] = m[13];
        out[2] = m[14];
        return out;
    }

    public static getScaling<T extends Array<number>>(out: T, m: number[]) {
        let m11 = m[0];
        let m12 = m[1];
        let m13 = m[2];
        let m21 = m[4];
        let m22 = m[5];
        let m23 = m[6];
        let m31 = m[8];
        let m32 = m[9];
        let m33 = m[10];
        out[0] = Math.hypot(m11, m12, m13);
        out[1] = Math.hypot(m21, m22, m23);
        out[2] = Math.hypot(m31, m32, m33);
        return out;
    }

    public static setFromBasis<T extends Array<number>>(out: T, xAxis: number[], yAxis: number[], zAxis: number[]) {
        out[0] = xAxis[0];
        out[1] = xAxis[1];
        out[2] = xAxis[2];
        out[3] = 0;
        out[4] = yAxis[0];
        out[5] = yAxis[1];
        out[6] = yAxis[2];
        out[7] = 0;
        out[8] = zAxis[0];
        out[9] = zAxis[1];
        out[10] = zAxis[2];
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }

    public static setFromMatrix3<T extends Array<number>>(out: T, m3: number[]) {
        out[0] = m3[0];
        out[1] = m3[1];
        out[2] = m3[2];
        out[3] = 0;
        out[4] = m3[3];
        out[5] = m3[4];
        out[6] = m3[5];
        out[7] = 0;
        out[8] = m3[6];
        out[9] = m3[7];
        out[10] = m3[8];
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }

    public static setFromQuaternion<T extends Array<number>>(out: T, q: number[]) {
        const [x, y, z, w] = q;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;

        const xx = x * x2;
        const yx = y * x2;
        const yy = y * y2;
        const zx = z * x2;
        const zy = z * y2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;

        out[0] = 1 - yy - zz;
        out[1] = yx + wz;
        out[2] = zx - wy;
        out[3] = 0;

        out[4] = yx - wz;
        out[5] = 1 - xx - zz;
        out[6] = zy + wx;
        out[7] = 0;

        out[8] = zx + wy;
        out[9] = zy - wx;
        out[10] = 1 - xx - yy;
        out[11] = 0;

        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;

        return out;
    }

    public static compose<T extends Array<number>>(out: T, p: number[], q: number[], s: number[]) {
        const [x, y, z, w] = q;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;

        const [sx, sy, sz] = s;

        out[0] = (1 - (yy + zz)) * sx;
        out[1] = (xy + wz) * sx;
        out[2] = (xz - wy) * sx;
        out[3] = 0;

        out[4] = (xy - wz) * sy;
        out[5] = (1 - (xx + zz)) * sy;
        out[6] = (yz + wx) * sy;
        out[7] = 0;

        out[8] = (xz + wy) * sz;
        out[9] = (yz - wx) * sz;
        out[10] = (1 - (xx + yy)) * sz;
        out[11] = 0;

        out[12] = p[0];
        out[13] = p[1];
        out[14] = p[2];
        out[15] = 1;

        return out;
    }

    public static decompose<T extends Array<number>>(out: T, position: number[], quaternion: number[], scale: number[]) {
        let sx = Math.hypot(out[0], out[1], out[2]);
        const sy = Math.hypot(out[4], out[5], out[6]);
        const sz = Math.hypot(out[8], out[9], out[10]);

        // if determine is negative, we need to invert one scale
        const det = Matrix4Function.determinant(out);
        if (det < 0) sx = -sx;

        position[0] = out[12];
        position[1] = out[13];
        position[2] = out[14];

        // scale the rotation part

        const invSX = 1 / sx;
        const invSY = 1 / sy;
        const invSZ = 1 / sz;

        QuaternionFunction.setFromMatrix3(quaternion, [
            out[0] * invSX,
            out[1] * invSX,
            out[2] * invSX,
            out[4] * invSY,
            out[5] * invSY,
            out[6] * invSY,
            out[8] * invSZ,
            out[9] * invSZ,
            out[10] * invSZ,
        ]);

        scale[0] = sx;
        scale[1] = sy;
        scale[2] = sz;

        return out;
    }

    public static makePerspective<T extends Array<number>>(out: T, fov: number, aspect: number, near: number, far: number) {
        var f = 1 / Math.tan(fov / 2);
        var rangeInv = 1 / (near - far);
        out[0] = f / aspect;
        out[4] = 0;
        out[8] = 0;
        out[12] = 0;
        out[1] = 0;
        out[5] = f;
        out[9] = 0;
        out[13] = 0;
        out[2] = 0;
        out[6] = 0;
        out[10] = (near + far) * rangeInv;
        out[14] = near * far * rangeInv * 2;
        out[3] = 0;
        out[7] = 0;
        out[11] = -1;
        out[15] = 0;
        return out;
    }

    public static makeOrthographic<T extends Array<number>>(out: T, left: number, right: number, top: number, bottom: number, near: number, far: number) {
        const wInv = 1 / (right - left);
        const hInv = 1 / (top - bottom);
        const depthInv = 1 / (far - near);
        out[0] = 2 * wInv;
        out[4] = 0;
        out[8] = 0;
        out[12] = -(right + left) * wInv;
        out[1] = 0;
        out[5] = 2 * hInv;
        out[9] = 0;
        out[13] = -(top + bottom) * hInv;
        out[2] = 0;
        out[6] = 0;
        out[10] = -2 * depthInv;
        out[14] = -(far + near) * depthInv;
        out[3] = 0;
        out[7] = 0;
        out[11] = 0;
        out[15] = 1;
        return out;
    }

    public static lookAt<T extends Array<number>>(out: T, eye: number[], target: number[], up: number[]) {
        let eyex = eye[0],
            eyey = eye[1],
            eyez = eye[2],
            upx = up[0],
            upy = up[1],
            upz = up[2];

        let z0 = eyex - target[0],
            z1 = eyey - target[1],
            z2 = eyez - target[2];

        let len = z0 * z0 + z1 * z1 + z2 * z2;
        if (len === 0) {
            // eye and target are in the same position
            z2 = 1;
        } else {
            len = 1 / Math.sqrt(len);
            z0 *= len;
            z1 *= len;
            z2 *= len;
        }

        let x0 = upy * z2 - upz * z1,
            x1 = upz * z0 - upx * z2,
            x2 = upx * z1 - upy * z0;

        len = x0 * x0 + x1 * x1 + x2 * x2;
        if (len === 0) {
            // up and z are parallel
            if (upz) {
                upx += 1e-6;
            } else if (upy) {
                upz += 1e-6;
            } else {
                upy += 1e-6;
            }
            x0 = upy * z2 - upz * z1;
            x1 = upz * z0 - upx * z2;
            x2 = upx * z1 - upy * z0;

            len = x0 * x0 + x1 * x1 + x2 * x2;
        }

        len = 1 / Math.sqrt(len);
        x0 *= len;
        x1 *= len;
        x2 *= len;

        out[0] = x0;
        out[1] = x1;
        out[2] = x2;
        out[3] = 0;
        out[4] = z1 * x2 - z2 * x1;
        out[5] = z2 * x0 - z0 * x2;
        out[6] = z0 * x1 - z1 * x0;
        out[7] = 0;
        out[8] = z0;
        out[9] = z1;
        out[10] = z2;
        out[11] = 0;
        out[12] = eyex;
        out[13] = eyey;
        out[14] = eyez;
        out[15] = 1;
        return out;
    }

    public static add<T extends Array<number>>(out: T, a: number[], b: number[]) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        out[3] = a[3] + b[3];
        out[4] = a[4] + b[4];
        out[5] = a[5] + b[5];
        out[6] = a[6] + b[6];
        out[7] = a[7] + b[7];
        out[8] = a[8] + b[8];
        out[9] = a[9] + b[9];
        out[10] = a[10] + b[10];
        out[11] = a[11] + b[11];
        out[12] = a[12] + b[12];
        out[13] = a[13] + b[13];
        out[14] = a[14] + b[14];
        out[15] = a[15] + b[15];
        return out;
    }

    public static sub<T extends Array<number>>(out: T, a: number[], b: number[]) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        out[3] = a[3] - b[3];
        out[4] = a[4] - b[4];
        out[5] = a[5] - b[5];
        out[6] = a[6] - b[6];
        out[7] = a[7] - b[7];
        out[8] = a[8] - b[8];
        out[9] = a[9] - b[9];
        out[10] = a[10] - b[10];
        out[11] = a[11] - b[11];
        out[12] = a[12] - b[12];
        out[13] = a[13] - b[13];
        out[14] = a[14] - b[14];
        out[15] = a[15] - b[15];
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
        out[9] = a[9] * s;
        out[10] = a[10] * s;
        out[11] = a[11] * s;
        out[12] = a[12] * s;
        out[13] = a[13] * s;
        out[14] = a[14] * s;
        out[15] = a[15] * s;
        return out;
    }
}
