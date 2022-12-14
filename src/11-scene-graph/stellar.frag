precision mediump float;

uniform vec3 color;

varying vec3 v_pos;
varying vec3 v_normal;
varying vec3 v_cameraPos;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 eyeDir = normalize(v_cameraPos - v_pos);
    gl_FragColor.rgb = color + pow(dot(normal, eyeDir), 0.5);
    gl_FragColor.a = 1.0;
}
