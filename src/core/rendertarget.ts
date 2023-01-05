import { Texture } from './texture';

export class RenderTarget {
    public width: number;

    public height: number;

    public texture: Texture;

    public depth: boolean = true;

    private _framebuffer: WebGLFramebuffer | null = null;

    private _depthBuffer: WebGLRenderbuffer | null = null;

    public needsUpdate: boolean;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.texture = new Texture(null, width, height);
        this.texture.generateMipmaps = false;
        this.texture.flipY = false;
        this.texture.isRenderTargetTexture = true;

        this.needsUpdate = false;
    }

    public getWebGLFramebuffer(gl: WebGLRenderingContext) {
        if (this._framebuffer && !this.needsUpdate) {
            return this._framebuffer;
        }

        if (!this._framebuffer) {
            this._framebuffer = gl.createFramebuffer();
            if (!this._framebuffer) {
                throw 'unable to create frame buffer';
            }
        }

        this.needsUpdate = false;

        const { width, height, texture, depth } = this;

        texture.width = width;
        texture.height = height;
        texture.needsUpdate = true;
        const webglTexture = texture.getWebGLTexture(gl);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl[texture.target], webglTexture, 0);

        if (depth) {
            if (!this._depthBuffer) {
                this._depthBuffer = gl.createRenderbuffer();
                if (!this._depthBuffer) {
                    throw 'unable to create depth buffer';
                }
            }
            gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, texture.width, texture.height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthBuffer);
        }

        return this._framebuffer;
    }
}
