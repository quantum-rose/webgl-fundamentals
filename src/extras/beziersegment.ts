import { Vector2 } from '../math';
import { MathUtil } from '../utils/mathutil';

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
            p.add(control.clone().scale(MathUtil.combination(n, i) * invT ** (n - i) * t ** i));
        }
        return p;
    }

    /**
     * 获取该点的法向量，位于线段右侧
     */
    public getNormalAt(t: number) {
        const tangent = this.getTangentAt(t);
        return tangent.rotate(-Math.PI / 2);
    }

    /**
     * 获取该点的切线方向，从靠近起点的一端指向靠近终点的一端
     */
    public getTangentAt(t: number) {
        const n = this.points.length - 1;
        const pts = this.points.slice();
        for (let i = n; i > 1; i--) {
            for (let j = 0; j < n; j++) {
                const p1 = pts[j];
                const p2 = pts[j + 1];
                pts[j] = p1.clone().lerp(p2, t);
            }
        }
        return pts[1].sub(pts[0]).normalize();
    }
}
