import { Object3DClass } from '../constants';
import { Color } from '../math';
import { Object3D } from './object3d';
import { Program } from './program';

export class Scene extends Object3D {
    public static classId = Object3DClass.Scene;

    public classId = Scene.classId;

    public background: Color | null = null;

    public overrideProgram: Program | null = null;
}
