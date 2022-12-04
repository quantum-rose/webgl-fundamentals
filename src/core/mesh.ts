import { Object3DClass } from '../constants';
import { BufferGeometry } from './buffergeometry';
import { Camera } from './camera';
import { Object3D } from './object3d';
import { Program } from './program';

export class Mesh extends Object3D {
    public static classId = Object3DClass.Mesh;

    public classId = Mesh.classId;

    public geometry: BufferGeometry;

    public program: Program;

    constructor(geometry: BufferGeometry, program: Program) {
        super();
        this.geometry = geometry;
        this.program = program;
    }

    public draw(camera: Camera) {
        const { geometry, program, matrixWorld: modelMatrix } = this;

        program.frontFace(modelMatrix.determinant() > 0 ? 'CCW' : 'CW');

        const viewMatrix = camera.matrixWorldInverse;
        const modelViewMatrix = viewMatrix.clone().multiply(modelMatrix);

        program.uniforms.modelMatrix = modelMatrix;
        program.uniforms.viewMatrix = viewMatrix;
        program.uniforms.modelViewMatrix = modelViewMatrix;
        program.uniforms.projectionMatrix = camera.projectionMatrix;
        program.uniforms.cameraPosition = camera.position;
        program.uniforms.normalMatrix = modelViewMatrix.clone().invert().transpose();
        program.setUniforms();

        geometry.draw(program);
    }
}
