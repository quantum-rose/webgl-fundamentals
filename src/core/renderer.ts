import { Uniforms } from '../interfaces';
import { WebGLUtils } from '../utils/webglutils';
import { Camera } from './camera';
import { Mesh } from './mesh';
import { Program } from './program';
import { Scene } from './scene';

export class Renderer {
    public canvas: HTMLCanvasElement;

    public gl: WebGLRenderingContext;

    private _currentProgramID?: number;

    private _currentGeometryID?: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const gl = canvas.getContext('webgl');
        if (!gl) {
            throw 'failed to get WebGL rendering context';
        }
        this.gl = gl;
        WebGLUtils.resizeCanvasToDisplaySize(canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    public createProgram(vertex: string, fragment: string, uniforms?: Uniforms) {
        return new Program(this.gl, vertex, fragment, uniforms);
    }

    private _getRenderList(scene: Scene) {
        const programID2Meshs = new Map<number, Mesh[]>();
        scene.traverse(obj => {
            if (!obj.visible) return true;
            if (obj instanceof Mesh) {
                const array = programID2Meshs.get(obj.program.id);
                if (array) {
                    array.push(obj);
                } else {
                    programID2Meshs.set(obj.program.id, [obj]);
                }
            }
            return false;
        });

        const renderList: Mesh[] = [];
        programID2Meshs.forEach(sameProgramMeshs => {
            const geometryID2Meshs = new Map<number, Mesh[]>();
            sameProgramMeshs.forEach(mesh => {
                const array = geometryID2Meshs.get(mesh.geometry.id);
                if (array) {
                    array.push(mesh);
                } else {
                    geometryID2Meshs.set(mesh.geometry.id, [mesh]);
                }
            });
            geometryID2Meshs.forEach(sameGeometryMeshs => {
                renderList.push(...sameGeometryMeshs);
            });
        });

        return renderList;
    }

    public render(scene: Scene, camera: Camera) {
        const { gl } = this;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        scene.updateMatrixWorld();
        camera.updateMatrixWorld();

        this._getRenderList(scene).forEach(mesh => {
            const { geometry, program, matrixWorld: modelMatrix } = mesh;

            // 检查 program 是否相同
            if (this._currentProgramID !== program.id) {
                this._currentProgramID = program.id;
                this.gl.useProgram(program.program);
            }

            // 检查 geometry 是否相同, 如果不同需要重新设置 attribute
            if (this._currentGeometryID !== geometry.id) {
                this._currentGeometryID = geometry.id;
                program.attributeSetters.forEach((setter, name) => {
                    const attribute = geometry.attributes.get(name);
                    if (attribute) setter(attribute);
                });
            }

            // 如果 mesh 的世界矩阵导致三角形顶点的顺逆顺序发生变化，需要调换正面与反面
            gl.frontFace(modelMatrix.determinant() > 0 ? gl.CCW : gl.CW);

            // 设置 uniform
            const viewMatrix = camera.matrixWorldInverse;
            const modelViewMatrix = viewMatrix.clone().multiply(modelMatrix);
            program.uniforms.modelMatrix = modelMatrix;
            program.uniforms.viewMatrix = viewMatrix;
            program.uniforms.modelViewMatrix = modelViewMatrix;
            program.uniforms.projectionMatrix = camera.projectionMatrix;
            program.uniforms.cameraPosition = camera.position;
            program.uniforms.normalMatrix = modelViewMatrix.clone().invert().transpose();
            program.uniformSetters.forEach((setter, name) => {
                if (program.uniforms.hasOwnProperty(name)) {
                    setter(program.uniforms[name]);
                }
            });

            // 判断索引数据 index 是否存在，分别采用对应的绘制方法
            const index = geometry.getAttribute('index');
            if (index) {
                const { array, offset, type, needsUpdate } = index;

                let { buffer } = index;
                if (!buffer) {
                    buffer = gl.createBuffer();
                    index.buffer = buffer;
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, gl.STATIC_DRAW);
                } else if (needsUpdate) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, gl.STATIC_DRAW);
                    index.needsUpdate = false;
                }

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                gl.drawElements(gl.TRIANGLES, geometry.count, gl[type], offset);
            } else {
                gl.drawArrays(gl.TRIANGLES, geometry.first, geometry.count);
            }
        });
    }
}