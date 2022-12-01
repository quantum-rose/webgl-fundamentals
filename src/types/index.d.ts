declare module '*.vert' {
    declare const vertex: string;
    export default vertex;
}

declare module '*.frag' {
    declare const fragment: string;
    export default fragment;
}

declare module '*.glsl' {
    declare const glsl: string;
    export default glsl;
}
