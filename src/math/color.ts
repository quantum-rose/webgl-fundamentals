import { ColorName } from '../interfaces';
import { ColorFunction } from './functions/colorfunction';

export class Color extends Array<number> {
    get r() {
        return this[0];
    }

    get g() {
        return this[1];
    }

    get b() {
        return this[2];
    }

    set r(v: number) {
        this[0] = v;
    }

    set g(v: number) {
        this[1] = v;
    }

    set b(v: number) {
        this[2] = v;
    }

    constructor(color: ColorName);
    constructor(color: number);
    constructor(color: number[]);
    constructor(r: number, g: number, b: number);
    constructor(color: ColorName | number | number[], g?: number, b?: number) {
        super(...ColorFunction.parseColor(color, g, b));
        Object.setPrototypeOf(this, Color.prototype);
    }
}
