import { Texture } from './texture';

export class RenderTarget {
    public width: number;

    public height: number;

    public depthTexture: boolean;

    public texture: Texture;

    private _unusedTexture: Texture | null = null;

    public depth: boolean = true;

    public stencil: boolean = false;

    private _framebuffer: WebGLFramebuffer | null = null;

    private _depthBuffer: WebGLRenderbuffer | null = null;

    public needsUpdate: boolean;

    constructor(width: number, height: number, depthTexture = false) {
        this.width = width;
        this.height = height;
        this.depthTexture = depthTexture;
        this.texture = new Texture(null, width, height);
        this.texture.generateMipmaps = false;
        this.texture.flipY = false;
        this.texture.isRenderTargetTexture = true;

        if (depthTexture) {
            this.texture.internalformat = 'DEPTH_COMPONENT';
            this.texture.format = 'DEPTH_COMPONENT';
            this.texture.type = 'UNSIGNED_INT';
            this.texture.minFilter = 'NEAREST';
            this.texture.magFilter = 'NEAREST';
        }

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

        const { width, height, depthTexture, texture, depth } = this;

        texture.width = width;
        texture.height = height;
        texture.needsUpdate = true;
        const webglTexture = texture.getWebGLTexture(gl);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);

        if (depthTexture) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl[texture.target], webglTexture, 0);

            if (!this._unusedTexture) {
                this._unusedTexture = new Texture(null, texture.width, texture.height);
                this._unusedTexture.isRenderTargetTexture = true;
            }
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl[this._unusedTexture.target], this._unusedTexture.getWebGLTexture(gl), 0);
        } else {
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
        }

        return this._framebuffer;
    }
}
