import { MathUtil } from '../utils/mathutil';

export type TextureTarget =
    | 'TEXTURE_2D'
    | 'TEXTURE_CUBE_MAP_POSITIVE_X'
    | 'TEXTURE_CUBE_MAP_NEGATIVE_X'
    | 'TEXTURE_CUBE_MAP_POSITIVE_Y'
    | 'TEXTURE_CUBE_MAP_NEGATIVE_Y'
    | 'TEXTURE_CUBE_MAP_POSITIVE_Z'
    | 'TEXTURE_CUBE_MAP_NEGATIVE_Z';

export type Textureformat = 'RGB' | 'RGBA' | 'ALPHA' | 'LUMINANCE' | 'LUMINANCE_ALPHA' | 'DEPTH_COMPONENT';

export type TextureType =
    | 'UNSIGNED_BYTE'
    | 'UNSIGNED_SHORT_5_6_5'
    | 'UNSIGNED_SHORT_4_4_4_4'
    | 'UNSIGNED_SHORT_5_5_5_1'
    | 'UNSIGNED_SHORT'
    | 'UNSIGNED_INT'
    | 'FLOAT';

export type TextureSource = ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | OffscreenCanvas;

export type TexturePixels = Uint8Array | Uint16Array | Uint32Array | Float32Array;

export type TextureWrap = 'REPEAT' | 'CLAMP_TO_EDGE' | 'MIRRORED_REPEAT';

export type TextureMagFilter = 'LINEAR' | 'NEAREST';

export type TextureMinFilter = 'LINEAR' | 'NEAREST' | 'NEAREST_MIPMAP_NEAREST' | 'LINEAR_MIPMAP_NEAREST' | 'NEAREST_MIPMAP_LINEAR' | 'LINEAR_MIPMAP_LINEAR';

export type TextureAlignment = 1 | 2 | 4 | 8;

export class Texture {
    public static loadImage(url: string) {
        const image = new Image();
        if (new URL(url, window.location.href).origin !== window.location.origin) {
            image.crossOrigin = '';
        }
        image.src = url;
        return new Promise<HTMLImageElement>(resolve => {
            image.onload = () => resolve(image);
        });
    }

    private static _defaultPixels = new Uint8Array([255, 255, 255, 255]);

    public target: TextureTarget = 'TEXTURE_2D';

    public level: number = 0;

    public internalformat: Textureformat = 'RGBA';

    public format: Textureformat = 'RGBA';

    public type: TextureType = 'UNSIGNED_BYTE';

    public source: TexImageSource | null = null;

    public pixels: TexturePixels | null = null;

    public width: number = 1;

    public height: number = 1;

    public border: number = 0;

    public wrapS: TextureWrap = 'CLAMP_TO_EDGE';

    public wrapT: TextureWrap = 'CLAMP_TO_EDGE';

    private _generateMipmaps: boolean = true;

    public get generateMipmaps() {
        return this._generateMipmaps;
    }

    public set generateMipmaps(value: boolean) {
        this._generateMipmaps = value;
        this._minFilter = value ? 'NEAREST_MIPMAP_LINEAR' : 'LINEAR';
    }

    private _minFilter: TextureMinFilter = 'NEAREST_MIPMAP_LINEAR';

    public get minFilter() {
        return this._minFilter;
    }

    /**
     * 当 generateMipmaps 的值为 false 时，仅能接受 'LINEAR' 和 'NEAREST'
     */
    public set minFilter(value: TextureMinFilter) {
        if (this._generateMipmaps || value === 'LINEAR' || value === 'NEAREST') {
            this._minFilter = value;
        } else {
            this._minFilter = 'LINEAR';
            console.warn('generateMipmaps is false, minFilter is reset to "LINEAR".');
        }
    }

    public magFilter: TextureMagFilter = 'LINEAR';

    public unpackAlignment: TextureAlignment = 4;

    public premultiplyAlpha: boolean = false;

    public flipY: boolean = true;

    private _texture: WebGLTexture | null = null;

    public needsUpdate: boolean;

    public isRenderTargetTexture: boolean;

    constructor(url: string);
    constructor(source: TextureSource);
    constructor(pixels: TexturePixels | null, width: number, height: number);
    constructor(source: string | TextureSource | TexturePixels | null, width?: number, height?: number) {
        if (typeof source === 'string') {
            Texture.loadImage(source).then(image => {
                this.source = image;
                this.width = image.width;
                this.height = image.height;
                this.needsUpdate = true;
            });
        } else if (
            source instanceof ImageBitmap ||
            source instanceof ImageData ||
            source instanceof HTMLImageElement ||
            source instanceof HTMLCanvasElement ||
            source instanceof HTMLVideoElement ||
            source instanceof OffscreenCanvas
        ) {
            this.source = source;
            this.width = source.width;
            this.height = source.height;
        } else {
            this.pixels = source;
            this.width = width!;
            this.height = height!;

            if (source instanceof Uint8Array) {
                this.type = 'UNSIGNED_BYTE';
            } else if (source instanceof Uint16Array) {
                this.type = 'UNSIGNED_SHORT';
            } else if (source instanceof Uint32Array) {
                this.type = 'UNSIGNED_INT';
            } else if (source instanceof Float32Array) {
                this.type = 'FLOAT';
            }
        }

        this.needsUpdate = false;
        this.isRenderTargetTexture = false;
    }

    public getWebGLTexture(gl: WebGLRenderingContext) {
        if (this._texture && !this.needsUpdate) {
            return this._texture;
        }

        if (!this._texture) {
            this._texture = gl.createTexture();
            if (!this._texture) {
                throw 'unable to create texture';
            }
        }

        this.needsUpdate = false;

        const bindTarget = this.target === 'TEXTURE_2D' ? 'TEXTURE_2D' : 'TEXTURE_CUBE_MAP';
        gl.bindTexture(gl[bindTarget], this._texture);

        const {
            target,
            level,
            internalformat,
            format,
            type,
            source,
            pixels,
            width,
            height,
            border,
            wrapS,
            wrapT,
            generateMipmaps,
            minFilter,
            magFilter,
            unpackAlignment,
            premultiplyAlpha,
            flipY,
        } = this;

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiplyAlpha);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, unpackAlignment);

        gl.texParameteri(gl[bindTarget], gl.TEXTURE_WRAP_S, gl[wrapS]);
        gl.texParameteri(gl[bindTarget], gl.TEXTURE_WRAP_T, gl[wrapT]);
        gl.texParameteri(gl[bindTarget], gl.TEXTURE_MIN_FILTER, gl[minFilter]);
        gl.texParameteri(gl[bindTarget], gl.TEXTURE_MAG_FILTER, gl[magFilter]);

        if (source) {
            gl.texImage2D(gl[target], level, gl[internalformat], gl[format], gl[type], source);
        } else if (pixels || this.isRenderTargetTexture) {
            gl.texImage2D(gl[target], level, gl[internalformat], width, height, border, gl[format], gl[type], pixels);
        } else {
            gl.texImage2D(gl[target], 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, Texture._defaultPixels);
        }

        if (generateMipmaps && MathUtil.isPowerOf2(width) && MathUtil.isPowerOf2(height)) {
            gl.generateMipmap(gl[bindTarget]);
        }

        return this._texture;
    }
}
