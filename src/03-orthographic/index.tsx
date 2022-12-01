import React, { useEffect, useRef } from 'react';
import { OrthographicCamera } from '../core';
import { MouseButton } from '../interfaces';
import { Matrix4, Vector3 } from '../math';
import { WebGLUtils } from '../utils/webglutils';
import fragment from './fragment.frag';
import vertex from './vertex.vert';

function useWebGL() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const updateRef = useRef<(() => void) | null>(null);
    const cameraRef = useRef<OrthographicCamera | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;

        const gl = canvas.getContext('webgl');
        if (!gl) {
            throw 'failed to get WebGL context';
        }
        const program = WebGLUtils.createProgram(gl, vertex, fragment);

        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
        const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        const matrixUniformLocation = gl.getUniformLocation(program, 'u_matrix');

        WebGLUtils.resizeCanvasToDisplaySize(canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.CULL_FACE); // 默认是剔除背面，同：gl.cullFace(gl.BACK);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0, 0, 0, 0);
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

        // u_resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        // u_matrix
        const halfW = canvas.clientWidth / 4;
        const halfH = canvas.clientHeight / 4;
        const camera = new OrthographicCamera(-halfW, halfW, halfH, -halfH, 0, 800);
        camera.position.set(0, 0, 400);
        const fModelMatrix = new Matrix4();
        fModelMatrix.scale(1, -1, 1);
        fModelMatrix.translate(-50, 75, -15);
        // 翻转奇数个坐标轴后，手系发生变化，正反面会调换
        // 所以需要根据行列式的值，指定哪一面是正面，默认逆时针为正面（因为三角形三个点逆时针两两叉乘结果的和是正数）
        // 行列式的几何意义是线性变换前后单位基对应的面积/体积的变动比率
        // 对于线性变换，变换前后面积/体积不会改变，行列式的绝对值始终为 1，但是有正负之分（翻转后三角形三个点顺逆关系改变）
        gl.frontFace(fModelMatrix.determinant() > 0 ? gl.CCW : gl.CW);
        const setUMatrix = function () {
            camera.updateModelMatrix();
            const { projectionMatrix, modelMatrix } = camera;
            const viewMatrix = modelMatrix.clone().invert();
            // MVP 矩阵，依次左乘，注意相乘顺序，ProjectionMatrix × ViewMatrix × ModelMatrix
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

export default function Orthographic() {
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

        const { position, target, up, modelMatrix } = cameraRef.current;
        const xAxis = new Vector3().setFromMatrixColumn(modelMatrix, 0);
        const yAxis = new Vector3().setFromMatrixColumn(modelMatrix, 1);

        if (buttons & MouseButton.LEFT) {
            position.sub(target);

            const rotateX = -deltaY * 0.01;
            position.applyAxisAngle(xAxis, rotateX);
            up.applyAxisAngle(xAxis, rotateX);

            const rotateY = -deltaX * 0.01;
            position.applyAxisAngle(yAxis, rotateY);
            up.applyAxisAngle(yAxis, rotateY);

            position.add(target);

            updateRef.current();
        } else if (buttons & MouseButton.RIGHT) {
            const vVertical = yAxis.setLength(deltaY);
            position.add(vVertical);
            target.add(vVertical);

            const vHorizontal = xAxis.setLength(-deltaX);
            position.add(vHorizontal);
            target.add(vHorizontal);

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
