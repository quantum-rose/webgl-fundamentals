import { Vector2 } from '../math';

export class Bound {
    private _min = new Vector2(Infinity, Infinity);

    private _max = new Vector2(-Infinity, -Infinity);

    constructor(min?: Vector2, max?: Vector2) {
        if (min) {
            this._min.set(min.x, min.y);
        }
        if (max) {
            this._max.set(max.x, max.y);
        }
    }

    public get left() {
        return this._min.x;
    }

    public get top() {
        return this._min.y;
    }

    public get right() {
        return this._max.x;
    }

    public get bottom() {
        return this._max.y;
    }

    public get width() {
        return this._max.x - this._min.x;
    }

    public get height() {
        return this._max.y - this._min.y;
    }

    public get min() {
        return this._min;
    }

    public get max() {
        return this._max;
    }

    public get center() {
        return new Vector2(this._min.x + this.width / 2, this._min.y + this.height / 2);
    }

    public addPoint(point: Vector2) {
        this._min.x = Math.min(this._min.x, point.x);
        this._min.y = Math.min(this._min.y, point.y);
        this._max.x = Math.max(this._max.x, point.x);
        this._max.y = Math.max(this._max.y, point.y);
        return this;
    }

    public addBound(bound: Bound) {
        this._min.x = Math.min(this._min.x, bound._min.x);
        this._min.y = Math.min(this._min.y, bound._min.y);
        this._max.x = Math.max(this._max.x, bound._max.x);
        this._max.y = Math.max(this._max.y, bound._max.y);
        return this;
    }

    public expand(ex: number, ey = ex) {
        this._min.x -= ex;
        this._min.y -= ey;
        this._max.x += ex;
        this._max.y += ey;
        return this;
    }

    public clone() {
        return new Bound(this._min, this._max);
    }
}
