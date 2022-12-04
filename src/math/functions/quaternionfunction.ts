import { Vector3Function } from './vector3function';

export class QuaternionFunction {
    public static set<T extends Array<number>>(out: T, x: number, y: number, z: number, w: number) {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    }

    public static identity<T extends Array<number>>(out: T) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        return out;
    }

    public static copy<T extends Array<number>>(out: T, a: number[]) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        return out;
    }

    public static dot(a: number[], b: number[]) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    }

    public static multiply<T extends Array<number>>(out: T, a: number[], b: number[]) {
        const [ax, ay, az, aw] = a;
        const [bx, by, bz, bw] = b;
        out[0] = ax * bw + aw * bx + ay * bz - az * by;
        out[1] = ay * bw + aw * by + az * bx - ax * bz;
        out[2] = az * bw + aw * bz + ax * by - ay * bx;
        out[3] = aw * bw - ax * bx - ay * by - az * bz;
        return out;
    }

    public static conjugate<T extends Array<number>>(out: T, a: number[]) {
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        out[3] = a[3];
        return out;
    }

    public static invert<T extends Array<number>>(out: T, a: number[]) {
        const [a0, a1, a2, a3] = a;
        const dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
        if (dot) {
            const invDot = 1.0 / dot;
            out[0] = -a0 * invDot;
            out[1] = -a1 * invDot;
            out[2] = -a2 * invDot;
            out[3] = a3 * invDot;
        } else {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
        }
        return out;
    }

    public static normalize<T extends Array<number>>(out: T, a: number[]) {
        const [x, y, z, w] = a;
        let len = x * x + y * y + z * z + w * w;
        if (len) {
            len = 1 / Math.sqrt(len);
            out[0] = x * len;
            out[1] = y * len;
            out[2] = z * len;
            out[3] = w * len;
        } else {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
        }
        return out;
    }

    public static len(a: number[]) {
        const [x, y, z, w] = a;
        return Math.sqrt(x * x + y * y + z * z + w * w);
    }

    public static rotateX<T extends Array<number>>(out: T, a: number[], rad: number) {
        rad *= 0.5;
        const [ax, ay, az, aw] = a;
        const bx = Math.sin(rad);
        const bw = Math.cos(rad);
        out[0] = ax * bw + aw * bx;
        out[1] = ay * bw + az * bx;
        out[2] = az * bw - ay * bx;
        out[3] = aw * bw - ax * bx;
        return out;
    }

    public static rotateY<T extends Array<number>>(out: T, a: number[], rad: number) {
        rad *= 0.5;
        const [ax, ay, az, aw] = a;
        const by = Math.sin(rad);
        const bw = Math.cos(rad);
        out[0] = ax * bw - az * by;
        out[1] = ay * bw + aw * by;
        out[2] = az * bw + ax * by;
        out[3] = aw * bw - ay * by;
        return out;
    }

    public static rotateZ<T extends Array<number>>(out: T, a: number[], rad: number) {
        rad *= 0.5;
        const [ax, ay, az, aw] = a;
        const bz = Math.sin(rad);
        const bw = Math.cos(rad);
        out[0] = ax * bw + ay * bz;
        out[1] = ay * bw - ax * bz;
        out[2] = az * bw + aw * bz;
        out[3] = aw * bw - az * bz;
        return out;
    }

    public static setFromMatrix3<T extends Array<number>>(out: T, m: number[]) {
        const [m11, m21, m31, m12, m22, m32, m13, m23, m33] = m;
        const trace = m11 + m22 + m33;
        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1.0);
            out[3] = 0.25 / s;
            out[0] = (m32 - m23) * s;
            out[1] = (m13 - m31) * s;
            out[2] = (m21 - m12) * s;
        } else if (m11 > m22 && m11 > m33) {
            const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
            out[3] = (m32 - m23) / s;
            out[0] = 0.25 * s;
            out[1] = (m12 + m21) / s;
            out[2] = (m13 + m31) / s;
        } else if (m22 > m33) {
            const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
            out[3] = (m13 - m31) / s;
            out[0] = (m12 + m21) / s;
            out[1] = 0.25 * s;
            out[2] = (m23 + m32) / s;
        } else {
            const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
            out[3] = (m21 - m12) / s;
            out[0] = (m13 + m31) / s;
            out[1] = (m23 + m32) / s;
            out[2] = 0.25 * s;
        }
        return out;
    }

    public static setFromMatrix4<T extends Array<number>>(out: T, m: number[]) {
        const is1 = 1 / Math.hypot(m[0], m[1], m[2]);
        const is2 = 1 / Math.hypot(m[4], m[5], m[6]);
        const is3 = 1 / Math.hypot(m[8], m[9], m[10]);
        const sm = [m[0] * is1, m[1] * is2, m[2] * is3, m[4] * is1, m[5] * is2, m[6] * is3, m[8] * is1, m[9] * is2, m[10] * is3];
        return QuaternionFunction.setFromMatrix3(out, sm);
    }

    public static setFromAxisAngle<T extends Array<number>>(out: T, axis: number[], rad: number) {
        rad = rad * 0.5;
        const s = Math.sin(rad);
        out[0] = s * axis[0];
        out[1] = s * axis[1];
        out[2] = s * axis[2];
        out[3] = Math.cos(rad);
        return out;
    }

    public static slerp<T extends Array<number>>(out: T, a: number[], b: number[], t: number) {
        // benchmarks:
        //    http://jsperf.com/quaternion-slerp-implementations
        let ax = a[0],
            ay = a[1],
            az = a[2],
            aw = a[3];
        let bx = b[0],
            by = b[1],
            bz = b[2],
            bw = b[3];

        let omega, cosom, sinom, scale0, scale1;

        // calc cosine
        cosom = ax * bx + ay * by + az * bz + aw * bw;
        // adjust signs (if necessary)
        if (cosom < 0.0) {
            cosom = -cosom;
            bx = -bx;
            by = -by;
            bz = -bz;
            bw = -bw;
        }
        // calculate coefficients
        if (1.0 - cosom > 0.000001) {
            // standard case (slerp)
            omega = Math.acos(cosom);
            sinom = Math.sin(omega);
            scale0 = Math.sin((1.0 - t) * omega) / sinom;
            scale1 = Math.sin(t * omega) / sinom;
        } else {
            // "from" and "to" quaternions are very close
            //  ... so we can do a linear interpolation
            scale0 = 1.0 - t;
            scale1 = t;
        }
        // calculate final values
        out[0] = scale0 * ax + scale1 * bx;
        out[1] = scale0 * ay + scale1 * by;
        out[2] = scale0 * az + scale1 * bz;
        out[3] = scale0 * aw + scale1 * bw;

        return out;
    }

    public static setFromUnitVectors<T extends Array<number>>(out: T, vFrom: number[], vTo: number[]) {
        // assumes direction vectors vFrom and vTo are normalized

        let r = Vector3Function.dot(vFrom, vTo) + 1;

        if (r < Number.EPSILON) {
            // vFrom and vTo point in opposite directions

            r = 0;

            if (Math.abs(vFrom[0]) > Math.abs(vFrom[2])) {
                out[0] = -vFrom[1];
                out[1] = vFrom[0];
                out[2] = 0;
                out[3] = r;
            } else {
                out[0] = 0;
                out[1] = -vFrom[2];
                out[2] = vFrom[1];
                out[3] = r;
            }
        } else {
            // crossVectors( vFrom, vTo ); // inlined to avoid cyclic dependency on Vector3

            out[0] = vFrom[1] * vTo[2] - vFrom[2] * vTo[1];
            out[1] = vFrom[2] * vTo[0] - vFrom[0] * vTo[2];
            out[2] = vFrom[0] * vTo[1] - vFrom[1] * vTo[0];
            out[3] = r;
        }

        return QuaternionFunction.normalize(out, out);
    }
}
