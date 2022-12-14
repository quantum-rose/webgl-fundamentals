export class WebGLUtil {
    public static compileShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number) {
        const shader = gl.createShader(shaderType);
        if (!shader) {
            throw `unable to create shader: ${shaderType}`;
        }
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            throw `could not compile shader: ${gl.getShaderInfoLog(shader)}`;
        }
        return shader;
    }

    public static createProgram(gl: WebGLRenderingContext, vertex: string, fragment: string) {
        const vertexShader = WebGLUtil.compileShader(gl, vertex, gl.VERTEX_SHADER);
        const fragmentShader = WebGLUtil.compileShader(gl, fragment, gl.FRAGMENT_SHADER);
        const program = gl.createProgram();
        if (!program) {
            throw 'unable to create WebGLProgram';
        }
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            throw `program failed to link: ${gl.getProgramInfoLog(program)}`;
        }
        return program;
    }

    public static resizeCanvasToDisplaySize(canvas: HTMLCanvasElement, multiplier: number = 1) {
        const width = (canvas.clientWidth * multiplier) | 0;
        const height = (canvas.clientHeight * multiplier) | 0;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            return true;
        }
        return false;
    }

    public static randomInt(range: number) {
        return Math.floor(Math.random() * range);
    }

    public static loadImage(src: string) {
        const image = new Image();
        image.src = src;
        return new Promise<HTMLImageElement>(resolve => {
            image.onload = () => resolve(image);
        });
    }

    public static setRectangle(gl: WebGLRenderingContext, x: number, y: number, width: number, height: number) {
        const left = x;
        const right = x + width;
        const top = y;
        const bottom = y + height;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([left, top, right, top, left, bottom, left, bottom, right, top, right, bottom]), gl.STATIC_DRAW);
    }

    public static getFGeometry() {
        return [
            // left column front
            0, 0, 0, 0, 150, 0, 30, 0, 0, 0, 150, 0, 30, 150, 0, 30, 0, 0,

            // top rung front
            30, 0, 0, 30, 30, 0, 100, 0, 0, 30, 30, 0, 100, 30, 0, 100, 0, 0,

            // middle rung front
            30, 60, 0, 30, 90, 0, 67, 60, 0, 30, 90, 0, 67, 90, 0, 67, 60, 0,

            // left column back
            0, 0, 30, 30, 0, 30, 0, 150, 30, 0, 150, 30, 30, 0, 30, 30, 150, 30,

            // top rung back
            30, 0, 30, 100, 0, 30, 30, 30, 30, 30, 30, 30, 100, 0, 30, 100, 30, 30,

            // middle rung back
            30, 60, 30, 67, 60, 30, 30, 90, 30, 30, 90, 30, 67, 60, 30, 67, 90, 30,

            // top
            0, 0, 0, 100, 0, 0, 100, 0, 30, 0, 0, 0, 100, 0, 30, 0, 0, 30,

            // top rung right
            100, 0, 0, 100, 30, 0, 100, 30, 30, 100, 0, 0, 100, 30, 30, 100, 0, 30,

            // under top rung
            30, 30, 0, 30, 30, 30, 100, 30, 30, 30, 30, 0, 100, 30, 30, 100, 30, 0,

            // between top rung and middle
            30, 30, 0, 30, 60, 30, 30, 30, 30, 30, 30, 0, 30, 60, 0, 30, 60, 30,

            // top of middle rung
            30, 60, 0, 67, 60, 30, 30, 60, 30, 30, 60, 0, 67, 60, 0, 67, 60, 30,

            // right of middle rung
            67, 60, 0, 67, 90, 30, 67, 60, 30, 67, 60, 0, 67, 90, 0, 67, 90, 30,

            // bottom of middle rung.
            30, 90, 0, 30, 90, 30, 67, 90, 30, 30, 90, 0, 67, 90, 30, 67, 90, 0,

            // right of bottom
            30, 90, 0, 30, 150, 30, 30, 90, 30, 30, 90, 0, 30, 150, 0, 30, 150, 30,

            // bottom
            0, 150, 0, 0, 150, 30, 30, 150, 30, 0, 150, 0, 30, 150, 30, 30, 150, 0,

            // left side
            0, 0, 0, 0, 0, 30, 0, 150, 30, 0, 0, 0, 0, 150, 30, 0, 150, 0,
        ];
    }

    public static setFGeometry(gl: WebGLRenderingContext) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(WebGLUtil.getFGeometry()), gl.STATIC_DRAW);
    }

    public static getFColors() {
        return [
            // left column front
            200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120,

            // top rung front
            200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120,

            // middle rung front
            200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120,

            // left column back
            80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200,

            // top rung back
            80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200,

            // middle rung back
            80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200,

            // top
            70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200, 210,

            // top rung right
            200, 200, 70, 200, 200, 70, 200, 200, 70, 200, 200, 70, 200, 200, 70, 200, 200, 70,

            // under top rung
            210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70,

            // between top rung and middle
            210, 160, 70, 210, 160, 70, 210, 160, 70, 210, 160, 70, 210, 160, 70, 210, 160, 70,

            // top of middle rung
            70, 180, 210, 70, 180, 210, 70, 180, 210, 70, 180, 210, 70, 180, 210, 70, 180, 210,

            // right of middle rung
            100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210,

            // bottom of middle rung.
            76, 210, 100, 76, 210, 100, 76, 210, 100, 76, 210, 100, 76, 210, 100, 76, 210, 100,

            // right of bottom
            140, 210, 80, 140, 210, 80, 140, 210, 80, 140, 210, 80, 140, 210, 80, 140, 210, 80,

            // bottom
            90, 130, 110, 90, 130, 110, 90, 130, 110, 90, 130, 110, 90, 130, 110, 90, 130, 110,

            // left side
            160, 160, 220, 160, 160, 220, 160, 160, 220, 160, 160, 220, 160, 160, 220, 160, 160, 220,
        ];
    }

    public static setFColors(gl: WebGLRenderingContext) {
        gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(WebGLUtil.getFColors()), gl.STATIC_DRAW);
    }

    /**
     *  ?????????????????? normal ??? https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-lighting-directional.html ?????????????????????
     *  ????????? y ?????????????????? z ???????????????
     *  ?????????????????? geometry??????????????????????????? F?????????????????????????????? F ???????????????????????????????????????
     */
    public static getFNormals() {
        return [
            // ????????????
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

            // ????????????
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

            // ????????????
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

            // ????????????
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

            // ????????????
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

            // ????????????
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

            // ??????
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,

            // ????????????
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

            // ????????????
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

            // ?????????????????????
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

            // ????????????
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,

            // ????????????
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

            // ????????????
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

            // ????????????
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

            // ??????
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

            // ??????
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
        ];
    }

    public static setFNormals(gl: WebGLRenderingContext) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(WebGLUtil.getFNormals()), gl.STATIC_DRAW);
    }

    public static getFTexcoords() {
        return [
            // left column front
            0.149, 0.172, 0.149, 0.874, 0.443, 0.172, 0.149, 0.874, 0.443, 0.874, 0.443, 0.172,

            // top rung front
            0.443, 0.172, 0.443, 0.333, 0.854, 0.172, 0.443, 0.333, 0.854, 0.333, 0.854, 0.172,

            // middle rung front
            0.443, 0.439, 0.443, 0.592, 0.796, 0.439, 0.443, 0.592, 0.796, 0.592, 0.796, 0.439,

            // left column back
            0.149, 0.172, 0.443, 0.172, 0.149, 0.874, 0.149, 0.874, 0.443, 0.172, 0.443, 0.874,

            // top rung back
            0.443, 0.172, 0.854, 0.172, 0.443, 0.333, 0.443, 0.333, 0.854, 0.172, 0.854, 0.333,

            // middle rung back
            0.443, 0.439, 0.796, 0.439, 0.443, 0.592, 0.443, 0.592, 0.796, 0.439, 0.796, 0.592,

            // top
            0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

            // top rung right
            0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

            // under top rung
            0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

            // between top rung and middle
            0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

            // top of middle rung
            0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

            // right of middle rung
            0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

            // bottom of middle rung.
            0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

            // right of bottom
            0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

            // bottom
            0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

            // left side
            0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
        ];
    }

    public static setFTexcoords(gl: WebGLRenderingContext) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(WebGLUtil.getFTexcoords()), gl.STATIC_DRAW);
    }

    public static arrayNeedsUint32(array: number[]) {
        // ??????????????????????????????????????????
        for (let i = array.length - 1; i >= 0; --i) {
            if (array[i] > 65535) return true;
        }
        return false;
    }
}
