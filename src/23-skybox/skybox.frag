precision mediump float;

uniform samplerCube cubeMap;
uniform mat4 matrix;

varying vec4 v_position;

void main() {
    vec4 t = matrix * v_position;
    gl_FragColor = textureCube(cubeMap, normalize(t.xyz / t.w));
}
