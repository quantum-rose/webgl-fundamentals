precision mediump float;

attribute vec4 a_position;
attribute vec4 a_color;
attribute vec3 a_normal;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;
uniform vec3 u_cameraPosition;
uniform mat4 u_normalMatrix;

varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_pos;
varying vec3 v_cameraPos;

void main() {
    v_color = a_color;
    v_normal = normalize(mat3(u_normalMatrix) * a_normal);
    vec4 modelPos = u_modelViewMatrix * a_position;
    v_pos = modelPos.xyz;
    v_cameraPos = (u_viewMatrix * vec4(u_cameraPosition, 1.0)).xyz;
    gl_Position = u_projectionMatrix * modelPos;
}
