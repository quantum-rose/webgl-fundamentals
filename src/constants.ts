export enum MouseButton {
    NONE = 0,
    LEFT = 1,
    RIGHT = 2,
    MIDDLE = 4,
    BACK = 8,
    FORWARD = 16,
}

export enum Object3DClass {
    Scene = 'Object3D.Scene',
    OrthographicCamera = 'Object3D.Camera.OrthographicCamera',
    PerspectiveCamera = 'Object3D.Camera.PerspectiveCamera',
    Mesh = 'Object3D.Mesh',
    Group = 'Object3D.Group',
}
