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

        this.needsUpdate = true;
    }
}
