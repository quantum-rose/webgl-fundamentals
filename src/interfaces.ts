export type AttributeName = 'position' | 'normal' | 'color' | 'uv' | 'index' | (string & {});

export type UniformName = 'modelMatrix' | 'viewMatrix' | 'modelViewMatrix' | 'projectionMatrix' | 'normalMatrix' | 'cameraPosition' | (string & {});

export type Uniforms = {
    [K in UniformName]?: any;
};

export type ColorName =
    | 'black'
    | 'white'
    | 'red'
    | 'green'
    | 'blue'
    | 'fuchsia'
    | 'cyan'
    | 'yellow'
    | 'orange'
    | 'gray'
    | 'purple'
    | 'pink'
    | 'skyblue'
    | (string & {});
