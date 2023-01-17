v precision mediump float;

uniform sampler2D map;
uniform float stageSize;

varying vec2 v_uv;

void main() {
vec2 st = fract(v_uv * stageSize);

vec3 color = (step(0.0625, st.x) * step(0.0625, st.y) * step(st.x, 0.9375) * step(st.y, 0.9375) + 0.5) * texture2D(map, v_uv).rgb;
gl_FragColor.rgb = color;
gl_FragColor.a = 1.;
}
