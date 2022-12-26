import { AttributeName } from '../interfaces';
import { WebGLUtil } from '../utils/webglutil';
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

    public setIndex(indices: number[] | Uint16Array | Uint32Array) {
        let array: Uint16Array | Uint32Array;
        if (Array.isArray(indices)) {
            if (WebGLUtil.arrayNeedsUint32(indices)) {
                array = new Uint32Array(indices);
            } else {
                array = new Uint16Array(indices);
            }
        } else {
            array = indices;
        }
        this.setAttribute('index', new BufferAttribute(array, 1));
    }

    public toLinesGeometry() {
        const newBufferGeometry = new BufferGeometry();
        if (this.attributes.has('index')) {
            this.attributes.forEach((attribute, name) => {
                if (name === 'index') {
                    const newAttribute = attribute.toLinesData();
                    newBufferGeometry.setAttribute(name, newAttribute);
                } else {
                    newBufferGeometry.setAttribute(name, attribute.clone());
                }
            });
        } else {
            this.attributes.forEach((attribute, name) => {
                const newAttribute = attribute.toLinesData();
                newBufferGeometry.setAttribute(name, newAttribute);
            });
        }
        return newBufferGeometry;
    }
}
