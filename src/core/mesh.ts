import { Object3DClass } from '../constants';
import { Uniforms } from '../interfaces';
import { BufferGeometry } from './buffergeometry';
import { Object3D } from './object3d';
import { Program } from './program';

export type DrawMode = 'POINTS' | 'LINE_STRIP' | 'LINE_LOOP' | 'LINES' | 'TRIANGLE_STRIP' | 'TRIANGLE_FAN' | 'TRIANGLES';

export type DrawSide = 'FRONT' | 'BACK' | 'DOUBLE';

export class Mesh extends Object3D {
    public static classId = Object3DClass.Mesh;

    public classId = Mesh.classId;

    public geometry: BufferGeometry;

    public program: Program;

    public uniforms: Uniforms;

    public mode: DrawMode;

    public side: DrawSide;

    constructor(geometry: BufferGeometry, program: Program, uniforms: Uniforms = {}) {
        super();
        this.geometry = geometry;
        this.program = program;
        this.uniforms = uniforms;
        this.mode = 'TRIANGLES';
        this.side = 'FRONT';
    }
}
