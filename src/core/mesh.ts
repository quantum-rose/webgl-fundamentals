import { Object3DClass } from '../constants';
import { Uniforms } from '../interfaces';
import { BufferGeometry } from './buffergeometry';
import { Object3D } from './object3d';
import { Program } from './program';

export class Mesh extends Object3D {
    public static classId = Object3DClass.Mesh;

    public classId = Mesh.classId;

    public geometry: BufferGeometry;

    public program: Program;

    public uniforms: Uniforms;

    constructor(geometry: BufferGeometry, program: Program, uniforms: Uniforms = {}) {
        super();
        this.geometry = geometry;
        this.program = program;
        this.uniforms = uniforms;
    }
}
