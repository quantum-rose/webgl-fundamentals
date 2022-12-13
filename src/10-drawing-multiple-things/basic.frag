precision mediump float;

varying vec2 v_uv;

void main() {
    vec2 uv = v_uv * 2.0;
    vec2 iuv = floor(uv);
    gl_FragColor.rgb = mix(vec3(1.0, 0.0, 1.0), vec3(0.0, 1.0, 1.0), abs(iuv.x - iuv.y));
    gl_FragColor.a = 1.0;
}
