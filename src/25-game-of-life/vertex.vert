precision mediump float;

attribute vec4 position;
attribute vec2 uv;
attribute vec3 normal;
attribute vec4 color;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPosition;
uniform mat4 normalMatrix;

varying vec3 v_pos;
varying vec2 v_uv;
varying vec3 v_normal;
varying vec4 v_color;
varying vec3 v_cameraPos;
varying vec4 v_worldPos;

void main() {
    v_uv = uv;
    v_color = color;
    v_normal = normalize(mat3(normalMatrix) * normal);
    vec4 modelViewPos = modelViewMatrix * position;
    v_pos = modelViewPos.xyz;
    v_cameraPos = (viewMatrix * vec4(cameraPosition, 1.0)).xyz;
    v_worldPos = modelMatrix * position;
    gl_Position = projectionMatrix * modelViewPos;
}
