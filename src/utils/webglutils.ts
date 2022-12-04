export class WebGLUtils {
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
        const vertexShader = WebGLUtils.compileShader(gl, vertex, gl.VERTEX_SHADER);
        const fragmentShader = WebGLUtils.compileShader(gl, fragment, gl.FRAGMENT_SHADER);
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
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(WebGLUtils.getFGeometry()), gl.STATIC_DRAW);
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
        gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(WebGLUtils.getFColors()), gl.STATIC_DRAW);
    }

    /**
     *  注意，这里的 normal 和 https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-lighting-directional.html 的示例有所不同
     *  翻转了 y 轴（上下）和 z 轴（前后）
     *  原示例翻转了 geometry，顶点数据是正常的 F，我没有这么做，我的 F 是倒立的，所以这里需要改掉
     */
    public static getFNormals() {
        return [
            // 正面左竖
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

            // 正面上横
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

            // 正面中横
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

            // 背面左竖
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

            // 背面上横
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

            // 背面中横
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

            // 顶部
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,

            // 上横右面
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

            // 上横下面
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

            // 上横和中横之间
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

            // 中横上面
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,

            // 中横右面
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

            // 中横底面
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

            // 底部右侧
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

            // 底面
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

            // 左面
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
        ];
    }

    public static setFNormals(gl: WebGLRenderingContext) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(WebGLUtils.getFNormals()), gl.STATIC_DRAW);
    }
}
