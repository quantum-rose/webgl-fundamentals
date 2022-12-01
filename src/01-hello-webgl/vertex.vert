attribute vec2 a_position;

uniform vec2 u_resolution;

void main() {
    vec2 position = a_position / u_resolution;
    position *= 2.0;
    position -= 1.0;
    position.y *= -1.0;
    gl_Position = vec4(position, 1.0, 1.0);
}
