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
];
