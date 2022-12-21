import React, { useEffect, useRef } from 'react';
import { MouseButton } from '../constants';
import { PerspectiveCamera } from '../core';
import { Matrix4, Vector3 } from '../math';
import { WebGLUtil } from '../utils/webglutil';
import fragment from './fragment.frag';
import vertex from './vertex.vert';

function useWebGL() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const updateRef = useRef<(() => void) | null>(null);
    const cameraRef = useRef<PerspectiveCamera | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;

        const gl = canvas.getContext('webgl');
        if (!gl) {
            throw 'failed to get WebGL context';
        }
        const program = WebGLUtil.createProgram(gl, vertex, fragment);

        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
        const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        const matrixUniformLocation = gl.getUniformLocation(program, 'u_matrix');

        WebGLUtil.resizeCanvasToDisplaySize(canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        // a_position
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        WebGLUtil.setFGeometry(gl);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

        // a_color
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        WebGLUtil.setFColors(gl);
        gl.enableVertexAttribArray(colorAttributeLocation);
        gl.vertexAttribPointer(colorAttributeLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);

        // u_resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        // u_matrix
        const camera = new PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 0.1, 800);
        camera.position.set(0, 0, 400);
        const fModelMatrix = new Matrix4();
        fModelMatrix.scale(1, -1, 1);
        fModelMatrix.translate(-50, 75, -15);
        gl.frontFace(fModelMatrix.determinant() > 0 ? gl.CCW : gl.CW);
        const setUMatrix = function () {
            camera.updateMatrixWorld();
            const { projectionMatrix, matrixWorld } = camera;
            const viewMatrix = matrixWorld.clone().invert();
            gl.uniformMatrix4fv(matrixUniformLocation, false, viewMatrix.multiply(fModelMatrix).premultiply(projectionMatrix));
        };
        setUMatrix();

        gl.drawArrays(gl.TRIANGLES, 0, 96);

        updateRef.current = function () {
            setUMatrix();
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 96);
        };

        cameraRef.current = camera;
    });

    return [canvasRef, updateRef, cameraRef] as const;
}

export default function Perspective() {
    const [canvasRef, updateRef, cameraRef] = useWebGL();
    const active = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        if (!updateRef.current || !cameraRef.current) return;

        const { deltaY } = e.nativeEvent;
        const { position, target } = cameraRef.current;
        if (deltaY > 0) {
            position.sub(target).scale(1.25).add(target);
        } else {
            position.sub(target).scale(0.8).add(target);
        }
        updateRef.current();
    };

    const onDragStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
        lastMouse.current = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
        active.current = true;
    };

    const onDragMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!active.current || !updateRef.current || !cameraRef.current) return;

        const { offsetX, offsetY, buttons } = e.nativeEvent;
        const deltaX = offsetX - lastMouse.current.x;
        const deltaY = offsetY - lastMouse.current.y;

        const { position, target, up, matrixWorld } = cameraRef.current;
        const xAxis = new Vector3().setFromMatrix4Column(matrixWorld, 0);
        const yAxis = new Vector3().setFromMatrix4Column(matrixWorld, 1);
        const zAxis = new Vector3().setFromMatrix4Column(matrixWorld, 2);

        if (buttons & MouseButton.LEFT) {
            position.sub(target);

            const rotateX = -deltaY * 0.01;
            position.applyAxisAngle(xAxis, rotateX);
            up.applyAxisAngle(xAxis, rotateX);

            const rotateY = -deltaX * 0.01;
            position.applyAxisAngle(yAxis, rotateY);
            up.applyAxisAngle(yAxis, rotateY);

            position.add(target);

            cameraRef.current.lookAt(target);
            updateRef.current();
        } else if (buttons & MouseButton.RIGHT) {
            const vDepth = zAxis.setLength(-deltaY);
            position.add(vDepth);
            target.add(vDepth);

            const vHorizontal = xAxis.setLength(-deltaX);
            position.add(vHorizontal);
            target.add(vHorizontal);

            cameraRef.current.lookAt(target);
            updateRef.current();
        }

        lastMouse.current = { x: offsetX, y: offsetY };
    };

    const onDragEnd = () => {
        active.current = false;
    };

    return (
        <canvas
            ref={canvasRef}
            onWheel={onWheel}
            onMouseDown={onDragStart}
            onMouseMove={onDragMove}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
            onContextMenu={e => e.preventDefault()}
        />
    );
}
