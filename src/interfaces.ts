export type AttributeName = 'position' | 'normal' | 'color' | 'uv' | 'index' | (string & {});

export type UniformName = 'modelMatrix' | 'viewMatrix' | 'modelViewMatrix' | 'projectionMatrix' | 'normalMatrix' | 'cameraPosition' | (string & {});

export type Uniforms = {
    [K in UniformName]?: any;
};
