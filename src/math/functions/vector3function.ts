import { MathUtil } from '../../utils/mathutil';

export class Vector3Function {
    public static set<T extends Array<number>>(out: T, x: number, y: number, z: number) {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    }

    public static copy<T extends Array<number>>(out: T, a: number[]) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        return out;
    }

    public static add<T extends Array<number>>(out: T, a: number[], b: number[]) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        return out;
    }

    public static sub<T extends Array<number>>(out: T, a: number[], b: number[]) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        return out;
    }

    public static dot(a: number[], b: number[]) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    public static cross<T extends Array<number>>(out: T, a: number[], b: number[]) {
        const [ax, ay, az] = a;
        const [bx, by, bz] = b;
        out[0] = ay * bz - az * by;
        out[1] = az * bx - ax * bz;
        out[2] = ax * by - ay * bx;
        return out;
    }

    public static scale<T extends Array<number>>(out: T, a: number[], s: number) {
        out[0] = a[0] * s;
        out[1] = a[1] * s;
        out[2] = a[2] * s;
        return out;
    }

    public static multiply<T extends Array<number>>(out: T, a: number[], b: number[]) {
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        out[2] = a[2] * b[2];
        return out;
    }

    public static divide<T extends Array<number>>(out: T, a: number[], b: number[]) {
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        out[2] = a[2] / b[2];
        return out;
    }

    public static negate<T extends Array<number>>(out: T, a: number[]) {
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        return out;
    }

    public static invert<T extends Array<number>>(out: T, a: number[]) {
        out[0] = 1.0 / a[0];
        out[1] = 1.0 / a[1];
        out[2] = 1.0 / a[2];
        return out;
    }

    public static normalize<T extends Array<number>>(out: T, a: number[]) {
        const [x, y, z] = a;
        let len = x * x + y * y + z * z;
        if (len) {
            len = 1 / Math.sqrt(len);
            out[0] = a[0] * len;
            out[1] = a[1] * len;
            out[2] = a[2] * len;
        } else {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
        }
        return out;
    }

    public static len(a: number[]) {
        return Math.hypot(a[0], a[1], a[2]);
    }

    public static squaredLength(a: number[]) {
        const [x, y, z] = a;
        return x * x + y * y + z * z;
    }

    public static distance(a: number[], b: number[]) {
        return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    }

    public static squaredDistance(a: number[], b: number[]) {
        const x = b[0] - a[0];
        const y = b[1] - a[1];
        const z = b[2] - a[2];
        return x * x + y * y + z * z;
    }

    public static angle(a: number[], b: number[]) {
        const denominator = Math.sqrt(Vector3Function.squaredLength(a) * Vector3Function.squaredLength(b));
        if (denominator === 0) return Math.PI / 2;
        const theta = MathUtil.clamp(Vector3Function.dot(a, b) / denominator, -1, 1);
        return Math.acos(theta);
    }

    public static transformMatrix3<T extends Array<number>>(out: T, a: number[], m: number[]) {
        const [x, y, z] = a;
        out[0] = x * m[0] + y * m[3] + z * m[6];
        out[1] = x * m[1] + y * m[4] + z * m[7];
        out[2] = x * m[2] + y * m[5] + z * m[8];
        return out;
    }

    public static transformMatrix4<T extends Array<number>>(out: T, a: number[], m: number[]) {
        const [x, y, z] = a;
        let w = m[3] * x + m[7] * y + m[11] * z + m[15];
        w = w || 1.0;
        out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
        out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
        out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
        return out;
    }

    public static transformQuaternion<T extends Array<number>>(out: T, a: number[], q: number[]) {
        const [x, y, z] = a;
        const [qx, qy, qz, qw] = q;

        // calculate quat * vector
        const ix = qw * x + qy * z - qz * y;
        const iy = qw * y + qz * x - qx * z;
        const iz = qw * z + qx * y - qy * x;
        const iw = -qx * x - qy * y - qz * z;

        // calculate result * inverse quat
        out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

        return out;
    }

    public static lerp<T extends Array<number>>(out: T, a: number[], b: number[], t: number) {
        const [ax, ay, az] = a;
        out[0] = ax + t * (b[0] - ax);
        out[1] = ay + t * (b[1] - ay);
        out[2] = az + t * (b[2] - az);
        return out;
    }
}
