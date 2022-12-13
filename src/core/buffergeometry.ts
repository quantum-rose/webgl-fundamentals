import { AttributeName } from '../interfaces';
import { BufferAttribute } from './bufferattribute';

export class BufferGeometry {
    private static _currentId = 0;

    public id: number;

    public attributes: Map<AttributeName, BufferAttribute>;

    public first: number;

    public count: number;

    constructor() {
        this.id = BufferGeometry._currentId++;
        this.attributes = new Map();
        this.first = 0;
        this.count = 0;
    }

    public setAttribute(name: AttributeName, value: BufferAttribute) {
        this.attributes.set(name, value);
        if (name === 'index') {
            this.count = value.count;
        } else {
            this.count = Math.max(this.count, value.count);
        }
    }

    public getAttribute(name: AttributeName) {
        return this.attributes.get(name);
    }
}