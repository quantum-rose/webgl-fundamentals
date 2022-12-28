import HelloWebGL from './01-hello-webgl';
import ImageProcess from './02-image-process';
import Orthographic from './03-orthographic';
import Perspective from './04-perspective';
import DirectionalLight from './05-directional-light';
import PointLight from './06-point-light';
import SpotLight from './07-spot-light';
import SearchLight from './08-search-light';
import LessCodeMoreFun from './09-less-code-more-fun';
import DrawingMultipleThings from './10-drawing-multiple-things';
import SceneGraph from './11-scene-graph';
import ThreeDGeometryLathe from './12-3d-geometry-lathe';
import LoadOBJ from './13-load-obj';
import MeshModel from './14-mesh-model';
import Textures from './15-textures';
import MultipleViews from './16-multiple-views';
import VisualizingTheCamera from './17-visualizing-the-camera';

export interface Menu {
    id: number;
    name: string;
    component: () => JSX.Element;
}

export const MenuConfig: Menu[] = [
    {
        id: 0,
        name: 'Hello WebGL',
        component: HelloWebGL,
    },
    {
        id: 1,
        name: 'Image Process',
        component: ImageProcess,
    },
    {
        id: 2,
        name: 'Orthographic',
        component: Orthographic,
    },
    {
        id: 3,
        name: 'Perspective',
        component: Perspective,
    },
    {
        id: 4,
        name: 'Directional Light',
        component: DirectionalLight,
    },
    {
        id: 5,
        name: 'Point Light',
        component: PointLight,
    },
    {
        id: 6,
        name: 'Spot Light',
        component: SpotLight,
    },
    {
        id: 7,
        name: 'Search Light',
        component: SearchLight,
    },
    {
        id: 8,
        name: 'Less Code More Fun',
        component: LessCodeMoreFun,
    },
    {
        id: 9,
        name: 'Drawing Multiple Things',
        component: DrawingMultipleThings,
    },
    {
        id: 10,
        name: 'Scene Graph',
        component: SceneGraph,
    },
    {
        id: 11,
        name: '3D Geometry Lathe',
        component: ThreeDGeometryLathe,
    },
    {
        id: 12,
        name: 'Load OBJ',
        component: LoadOBJ,
    },
    {
        id: 13,
        name: 'Mesh Model',
        component: MeshModel,
    },
    {
        id: 14,
        name: 'Textures',
        component: Textures,
    },
    {
        id: 15,
        name: 'Multiple Views',
        component: MultipleViews,
    },
    {
        id: 16,
        name: 'Visualizing The Camera',
        component: VisualizingTheCamera,
    },
];
