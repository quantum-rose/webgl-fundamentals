precision mediump float;

attribute vec4 a_position;
attribute vec4 a_color;
attribute vec3 a_normal;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_normalMatrix;

varying vec4 v_color;
varying vec3 v_normal;

void main() {
    v_color = a_color;
    v_normal = mat3(u_normalMatrix) * a_normal;
    gl_Position = u_projectionMatrix * u_modelViewMatrix * a_position;
}
