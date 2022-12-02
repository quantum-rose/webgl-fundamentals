import { useEffect, useRef } from 'react';
import { PerspectiveCamera } from '../core';
import { OrbitControls } from '../core/orbitcontrols';
import { Matrix4 } from '../math';
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
        const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
        const normalAttributeLocation = gl.getAttribLocation(program, 'a_normal');
        const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        const modelMatrixUniformLocation = gl.getUniformLocation(program, 'u_modelMatrix');
        const viewMatrixUniformLocation = gl.getUniformLocation(program, 'u_viewMatrix');
        const projectionMatrixUniformLocation = gl.getUniformLocation(program, 'u_projectionMatrix');
        const normalMatrixUniformLocation = gl.getUniformLocation(program, 'u_normalMatrix');
        const ambientLightColorUniformLocation = gl.getUniformLocation(program, 'u_ambientLightColor');
        const reverseLightDirectionUniformLocation = gl.getUniformLocation(program, 'u_reverseLightDirection');

        WebGLUtils.resizeCanvasToDisplaySize(canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        // a_position
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        WebGLUtils.setFGeometry(gl);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

        // a_color
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        WebGLUtils.setFColors(gl);
        gl.enableVertexAttribArray(colorAttributeLocation);
        gl.vertexAttribPointer(colorAttributeLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);

        // a_normal
        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        WebGLUtils.setFNormals(gl);
        gl.enableVertexAttribArray(normalAttributeLocation);
        gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

        // like mesh
        const modelMatrix = new Matrix4();
        modelMatrix.scale(1, -1, 1);
        modelMatrix.translate(-50, 75, -15);

        // camera
        const camera = new PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 1, 800);
        camera.position.set(0, 0, 400);
        camera.position.applyAxisAngle([0, 1, 0], Math.PI / 6);
        camera.position.applyAxisAngle([1, 0, 0], -Math.PI / 6);
        camera.updateMatrixWorld();

        // controls
        const controls = new OrbitControls(camera, canvas);

        function setUniforms(gl: WebGLRenderingContext) {
            // u_resolution
            gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

            // u_modelMatrix
            gl.uniformMatrix4fv(modelMatrixUniformLocation, false, modelMatrix);
            gl.frontFace(modelMatrix.determinant() > 0 ? gl.CCW : gl.CW);

            // u_viewMatrix
            gl.uniformMatrix4fv(viewMatrixUniformLocation, false, camera.matrixWorld.clone().invert());

            // u_ProjectionMatrix;
            gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, camera.projectionMatrix);

            // u_normalMatrix
            gl.uniformMatrix4fv(normalMatrixUniformLocation, false, modelMatrix.clone().invert().transpose());

            // u_ambientLightColor
            gl.uniform3f(ambientLightColorUniformLocation, 0.1, 0.1, 0.1);

            // u_reverseLightDirection
            gl.uniform3f(reverseLightDirectionUniformLocation, 0, 0, 1);
        }

        const render = () => {
            modelMatrix.rotateY(0.01);

            setUniforms(gl);

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 96);

            requestAnimationFrame(render);
        };

        render();
    });

    return [canvasRef] as const;
}

export default function DirectionalLight() {
    const [canvasRef] = useWebGL();

    return <canvas ref={canvasRef} />;
}
