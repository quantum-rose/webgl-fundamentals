import { AttributeName } from '../interfaces';
import { BufferAttribute } from './bufferattribute';
import { Program } from './program';

export class BufferGeometry {
    public attributes: Map<AttributeName, BufferAttribute>;

    public first: number;

    public count: number;

    constructor() {
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

    public draw(program: Program) {
        const { attributes, first, count } = this;
        const { gl, attributeSetters } = program;
        attributeSetters.forEach((setter, name) => {
            const attribute = attributes.get(name);
            if (attribute && attribute.needsUpdate) {
                setter(attribute);
                attribute.needsUpdate = false;
            }
        });
        gl.drawArrays(gl.TRIANGLES, first, count);
    }
}
