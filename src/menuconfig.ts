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
import WireframeModel from './14-wireframe-model';
import Textures from './15-textures';
import MultipleViews from './16-multiple-views';
import VisualizingTheCamera from './17-visualizing-the-camera';
import PlanarProjectionMapping from './18-planar-projection-mapping';
import RenderToTexture from './19-render-to-texture';
import Shadows from './20-shadows';
import CubeMaps from './21-cube-maps';
import EnvironmentMaps from './22-environment-maps';
import Skybox from './23-skybox';
import Fog from './24-fog';
import GameOfLife from './25-game-of-life';

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
        name: 'Wireframe Model',
        component: WireframeModel,
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
    {
        id: 17,
        name: 'Planar Projection Mapping',
        component: PlanarProjectionMapping,
    },
    {
        id: 18,
        name: 'Render To Texture',
        component: RenderToTexture,
    },
    {
        id: 19,
        name: 'Shadows',
        component: Shadows,
    },
    {
        id: 20,
        name: 'Cube Maps',
        component: CubeMaps,
    },
    {
        id: 21,
        name: 'Environment Maps',
        component: EnvironmentMaps,
    },
    {
        id: 22,
        name: 'Skybox',
        component: Skybox,
    },
    {
        id: 23,
        name: 'Fog',
        component: Fog,
    },
    {
        id: 24,
        name: 'Game of Life',
        component: GameOfLife,
    },
];
