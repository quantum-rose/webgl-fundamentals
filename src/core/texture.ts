import { MathUtil } from '../utils/mathutil';

export type TextureTarget =
    | 'TEXTURE_2D'
    | 'TEXTURE_CUBE_MAP_POSITIVE_X'
    | 'TEXTURE_CUBE_MAP_NEGATIVE_X'
    | 'TEXTURE_CUBE_MAP_POSITIVE_Y'
    | 'TEXTURE_CUBE_MAP_NEGATIVE_Y'
    | 'TEXTURE_CUBE_MAP_POSITIVE_Z'
    | 'TEXTURE_CUBE_MAP_NEGATIVE_Z';

export type Textureformat = 'RGB' | 'RGBA' | 'ALPHA' | 'LUMINANCE' | 'LUMINANCE_ALPHA';

export type TextureType =
    | 'UNSIGNED_BYTE'
    | 'UNSIGNED_SHORT_5_6_5'
    | 'UNSIGNED_SHORT_4_4_4_4'
    | 'UNSIGNED_SHORT_5_5_5_1'
    | 'UNSIGNED_SHORT'
    | 'UNSIGNED_INT'
    | 'FLOAT';

export type TextureSource = TexImageSource | string;

export type TexturePixels = Uint8Array | Uint16Array | Uint32Array | Float32Array;

export class Texture {
    public static loadImage(src: string) {
        const image = new Image();
        image.src = src;
        return new Promise<HTMLImageElement>(resolve => {
            image.onload = () => resolve(image);
        });
    }

    public target: TextureTarget = 'TEXTURE_2D';

    public level: number = 0;

    public internalformat: Textureformat = 'RGBA';

    public format: Textureformat = 'RGBA';

    public type: TextureType = 'UNSIGNED_BYTE';

    public source: TexImageSource | null = null;

    public pixels: TexturePixels | null = null;

    public width: number = 0;

    public height: number = 0;

    public border: number = 0;

    private _texture: WebGLTexture | null = null;

    constructor(source: TextureSource);
    constructor(pixels: TexturePixels, width: number, height: number);
    constructor(source: TextureSource | TexturePixels, width?: number, height?: number) {
        if (typeof source === 'string') {
            Texture.loadImage(source).then(image => {
                this.source = image;
                this.width = image.width;
                this.height = image.height;
            });
        } else if (source instanceof Uint8Array || source instanceof Uint16Array || source instanceof Uint32Array || source instanceof Float32Array) {
            this.pixels = source;
            this.width = width!;
            this.height = height!;
        } else if (source) {
            this.source = source;
            this.width = source.width;
            this.height = source.height;
        }
    }

    public getWebGLTexture(gl: WebGLRenderingContext) {
        if (!this.source && !this.pixels) {
            return null;
        }

        if (this._texture) {
            return this._texture;
        }

        this._texture = gl.createTexture();
        if (!this._texture) {
            throw 'unable to create texture';
        }

        const bindTarget = this.target === 'TEXTURE_2D' ? 'TEXTURE_2D' : 'TEXTURE_CUBE_MAP';
        gl.bindTexture(gl[bindTarget], this._texture);

        const { target, level, internalformat, format, type, source, pixels, width, height, border } = this;
        if (source) {
            gl.texImage2D(gl[target], level, gl[internalformat], gl[format], gl[type], source);
        } else {
            gl.texImage2D(gl[target], level, gl[internalformat], width, height, border, gl[format], gl[type], pixels);
        }

        if (MathUtil.isPowerOf2(width) && MathUtil.isPowerOf2(height)) {
            gl.generateMipmap(gl[bindTarget]);
        } else {
            gl.texParameteri(gl[bindTarget], gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl[bindTarget], gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl[bindTarget], gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

        return this._texture;
    }
}
