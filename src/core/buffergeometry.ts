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
            if (attribute) {
                setter(attribute);
            }
        });

        const index = this.getAttribute('index');
        if (index) {
            const { array, offset, type, needsUpdate } = index;

            let { buffer } = index;
            if (!buffer) {
                buffer = gl.createBuffer();
                index.buffer = buffer;
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, gl.STATIC_DRAW);
            } else if (needsUpdate) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, gl.STATIC_DRAW);
                index.needsUpdate = false;
            }

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
            gl.drawElements(gl.TRIANGLES, count, gl[type], offset);
        } else {
            gl.drawArrays(gl.TRIANGLES, first, count);
        }
    }
}
