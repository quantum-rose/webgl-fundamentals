precision mediump float;

attribute vec4 position;
attribute vec4 color;
attribute vec3 normal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPosition;
uniform mat4 normalMatrix;

varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_pos;
varying vec3 v_cameraPos;

void main() {
    v_color = color;
    v_normal = normalize(mat3(normalMatrix) * normal);
    vec4 modelPos = modelViewMatrix * position;
    v_pos = modelPos.xyz;
    v_cameraPos = (viewMatrix * vec4(cameraPosition, 1.0)).xyz;
    gl_Position = projectionMatrix * modelPos;
}
