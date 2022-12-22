export type IAttributeSource = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array;

export type IWebGLDataType = 'BYTE' | 'UNSIGNED_BYTE' | 'SHORT' | 'UNSIGNED_SHORT' | 'INT' | 'UNSIGNED_INT' | 'FLOAT';

export class BufferAttribute {
    public array: IAttributeSource;

    public buffer: WebGLBuffer | null;

    public size: number;

    public normalized: boolean;

    public stride: number;

    public offset: number;

    public count: number;

    public type: IWebGLDataType;

    public needsUpdate: boolean;

    constructor(array: IAttributeSource, size: number, normalized = false, stride = 0, offset = 0) {
        this.array = array;
        this.buffer = null;
        this.size = size;
        this.normalized = normalized;
        this.stride = stride;
        this.offset = offset;
        this.count = array.length / size;

        if (array instanceof Int8Array) {
            this.type = 'BYTE';
        } else if (array instanceof Uint8Array || array instanceof Uint8ClampedArray) {
            this.type = 'UNSIGNED_BYTE';
        } else if (array instanceof Int16Array) {
            this.type = 'SHORT';
        } else if (array instanceof Uint16Array) {
            this.type = 'UNSIGNED_SHORT';
        } else if (array instanceof Int32Array) {
            this.type = 'INT';
        } else if (array instanceof Uint32Array) {
            this.type = 'UNSIGNED_INT';
        } else if (array instanceof Float32Array) {
            this.type = 'FLOAT';
        } else {
            const neverType: never = array;
            this.type = neverType;
        }

        this.needsUpdate = false;
    }

    public toLinesData() {
        const newArray: number[] = [];
        for (let i = 0; i < this.count; i += 3) {
            const a = this.getDataAt(i + 0);
            const b = this.getDataAt(i + 1);
            const c = this.getDataAt(i + 2);
            newArray.push(...a, ...b, ...b, ...c, ...c, ...a);
        }
        const typedArrayConstructor = Object.getPrototypeOf(this.array).constructor;
        return new BufferAttribute(new typedArrayConstructor(newArray), this.size);
    }

    public getDataAt(index: number) {
        const data: number[] = [];
        const offset = index * this.size;
        for (let i = 0; i < this.size; i++) {
            data.push(this.array[offset + i]);
        }
        return data;
    }

    public clone() {
        return new BufferAttribute(this.array, this.size, this.normalized, this.stride, this.offset);
    }
}
