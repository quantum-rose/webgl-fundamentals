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

    public useProgram(program: Program) {
        this._currentProgramID = program.id;
        this.gl.useProgram(program.program);
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
        programID2Meshs.forEach(meshs => {
            renderList.push(...meshs);
        });

        return renderList;
    }

    public render(scene: Scene, camera: Camera) {
        const { gl } = this;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        scene.updateMatrixWorld();
        camera.updateMatrixWorld();

        this._getRenderList(scene).forEach(mesh => {
            if (this._currentProgramID !== mesh.program.id) {
                this.useProgram(mesh.program);
            }
            mesh.draw(camera);
        });
    }
}
