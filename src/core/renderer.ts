import { Uniforms } from '../interfaces';
import { WebGLUtil } from '../utils/webglutil';
import { Camera } from './camera';
import { Mesh } from './mesh';
import { Program } from './program';
import { RenderTarget } from './rendertarget';
import { Scene } from './scene';

export class Renderer {
    public canvas: HTMLCanvasElement;

    public gl: WebGLRenderingContext;

    private _currentProgramID?: number;

    private _currentGeometryID?: number;

    public get drawingBufferWidth() {
        return this.gl.drawingBufferWidth;
    }

    public get drawingBufferHeight() {
        return this.gl.drawingBufferHeight;
    }

    public autoClear = true;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const gl = canvas.getContext('webgl');
        if (!gl) {
            throw 'failed to get WebGL rendering context';
        }
        this.gl = gl;
        WebGLUtil.resizeCanvasToDisplaySize(canvas);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.getExtension('OES_element_index_uint');
        gl.getExtension('WEBGL_depth_texture');
    }

    public createProgram(vertex: string, fragment: string, uniforms?: Uniforms) {
        return new Program(this.gl, vertex, fragment, uniforms);
    }

    public setViewPort(x: number, y: number, width: number, height: number) {
        this.gl.viewport(x, y, width, height);
    }

    public setScissor(x: number, y: number, width: number, height: number) {
        this.gl.scissor(x, y, width, height);
    }

    public setScissorTest(scissorTest: boolean) {
        const { gl } = this;
        if (scissorTest) {
            gl.enable(gl.SCISSOR_TEST);
        } else {
            gl.disable(gl.SCISSOR_TEST);
        }
    }

    public clear() {
        const { gl } = this;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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

    public render(scene: Scene, camera: Camera, renderTarget?: RenderTarget) {
        const { gl } = this;

        if (renderTarget) {
            const framebuffer = renderTarget.getWebGLFramebuffer(gl);
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

        const { background } = scene;
        if (background) {
            gl.clearColor(background.r, background.g, background.b, 1);
        } else {
            gl.clearColor(0, 0, 0, 1);
        }

        if (this.autoClear) this.clear();

        scene.updateMatrixWorld();
        camera.updateMatrixWorld();

        this._getRenderList(scene).forEach(mesh => {
            this._draw(scene, camera, mesh);
        });
    }

    private _draw(scene: Scene, camera: Camera, mesh: Mesh) {
        const { gl } = this;
        const { geometry, matrixWorld: modelMatrix } = mesh;
        const program = scene.overrideProgram ?? mesh.program;

        // 检查 program 是否相同
        const isDifferentProgram = this._currentProgramID !== program.id;
        if (isDifferentProgram) {
            this._currentProgramID = program.id;
            this.gl.useProgram(program.program);
        }

        // 如果 program 不同或者 geometry 不同，都需要重新设置 attribute
        if (isDifferentProgram || this._currentGeometryID !== geometry.id) {
            this._currentGeometryID = geometry.id;
            program.attributeSetters.forEach((setter, name) => setter(geometry.attributes.get(name)));

            const index = geometry.getAttribute('index');
            if (index) {
                const { array, needsUpdate } = index;
                if (!index.buffer || needsUpdate) {
                    if (!index.buffer) {
                        index.buffer = gl.createBuffer();
                    }
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index.buffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, gl.STATIC_DRAW);
                    index.needsUpdate = false;
                } else {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index.buffer);
                }
            }
        }

        // 设置剔除面
        if (mesh.side === 'DOUBLE') {
            gl.disable(gl.CULL_FACE);
        } else {
            gl.enable(gl.CULL_FACE);
            gl.cullFace(mesh.side === 'FRONT' ? gl.BACK : gl.FRONT);
        }

        // 设置深度比较函数
        gl.depthFunc(gl[mesh.depthFunc]);

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
            if (mesh.uniforms.hasOwnProperty(name)) {
                setter(mesh.uniforms[name]);
            } else if (program.uniforms.hasOwnProperty(name)) {
                setter(program.uniforms[name]);
            }
        });

        // 判断索引数据 index 是否存在，分别采用对应的绘制方法
        const index = geometry.getAttribute('index');
        if (index) {
            const { offset, type } = index;
            gl.drawElements(gl[mesh.mode], geometry.count, gl[type], offset);
        } else {
            gl.drawArrays(gl[mesh.mode], geometry.first, geometry.count);
        }
    }
}
