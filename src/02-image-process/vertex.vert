attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;
uniform float u_flipY;

varying vec2 v_texCoord;

void main() {
    v_texCoord = a_texCoord;
    vec2 position = a_position / u_resolution;
    position *= 2.0;
    position -= 1.0;
    position.y *= u_flipY;
    gl_Position = vec4(position, 1.0, 1.0);
}
