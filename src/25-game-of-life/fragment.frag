precision mediump float;

uniform sampler2D map;
uniform sampler2D background;

varying vec2 v_uv;

void main() {
    gl_FragColor = texture2D(map, v_uv) * texture2D(background, v_uv);
}
