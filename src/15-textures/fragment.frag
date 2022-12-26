precision mediump float;

uniform sampler2D map;
uniform sampler2D luminanceMap;

varying vec2 v_uv;

void main() {
    vec4 color = texture2D(map, v_uv);
    vec4 luminance = texture2D(luminanceMap, v_uv);
    gl_FragColor.rgb = color.rgb * luminance.rgb;
    gl_FragColor.a = color.a;
}
