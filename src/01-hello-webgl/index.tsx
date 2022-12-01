import { useEffect, useRef } from 'react';
import { WebGLUtils } from '../utils/webglutils';
import fragment from './fragment.frag';
import vertex from './vertex.vert';

function useWebGL() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;

        const gl = canvas.getContext('webgl');
        if (!gl) {
            throw 'failed to get WebGL context';
        }
        const program = WebGLUtils.createProgram(gl, vertex, fragment);

        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        const colorUniformLocation = gl.getUniformLocation(program, 'u_color');

        WebGLUtils.resizeCanvasToDisplaySize(canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        for (let i = 0; i < 50; i++) {
            WebGLUtils.setRectangle(
                gl,
                WebGLUtils.randomInt(gl.canvas.width),
                WebGLUtils.randomInt(gl.canvas.height),
                WebGLUtils.randomInt(500),
                WebGLUtils.randomInt(300)
            );
            gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
    });

    return [canvasRef] as const;
}

export default function HelloWebGL() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
