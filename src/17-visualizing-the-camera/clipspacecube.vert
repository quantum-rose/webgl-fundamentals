precision mediump float;

attribute vec4 position;

uniform mat4 matrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * matrix * position;
}
