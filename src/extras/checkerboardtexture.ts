import { Texture } from '../core';
import { MathUtil } from '../utils/mathutil';

export class CheckerboardTexture extends Texture {
    constructor(width = 8, height = 8, luminance1 = 0xcc, luminance2 = 0xff) {
        const pixels = new Uint8Array(width * height);
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                pixels[row * width + col] = (row + col) % 2 ? luminance1 : luminance2;
            }
        }

        super(pixels, width, height);

        this.format = 'LUMINANCE';
        this.internalformat = 'LUMINANCE';
        this.magFilter = 'NEAREST';

        if (!MathUtil.isPowerOf2(width) || !MathUtil.isPowerOf2(height)) {
            this.generateMipmaps = false;
        }

        if (width % 8 === 0) {
            this.unpackAlignment = 8;
        } else if (width % 4 === 0) {
            this.unpackAlignment = 4;
        } else if (width % 2 === 0) {
            this.unpackAlignment = 2;
        } else {
            this.unpackAlignment = 1;
        }
    }
}
