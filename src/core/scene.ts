import { Object3DClass } from '../constants';
import { Color } from '../math';
import { Object3D } from './object3d';

export class Scene extends Object3D {
    public static classId = Object3DClass.Scene;

    public classId = Scene.classId;

    public background?: Color;
}
