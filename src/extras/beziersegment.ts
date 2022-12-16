import { Vector2 } from '../math';
import { MathUtils } from '../utils/mathutils';

export class BezierSegment {
    public points: Vector2[];

    constructor(points: Vector2[]) {
        this.points = points;
    }

    get start() {
        return this.points[0];
    }

    get end() {
        return this.points[this.points.length - 1];
    }

    public getPointAt(t: number) {
        const invT = 1 - t;
        const p = new Vector2();
        const n = this.points.length - 1;
        for (let i = 0; i <= n; i++) {
            const control = this.points[i];
            p.add(control.clone().scale(MathUtils.combination(n, i) * invT ** (n - i) * t ** i));
        }
        return p;
    }
}
