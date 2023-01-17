precision mediump float;

uniform sampler2D map;
uniform float pixelSize;

varying vec2 v_uv;

void main() {
    float current = texture2D(map, v_uv).r;
    float round = texture2D(map, v_uv + vec2(-1, -1) * pixelSize).r +
        texture2D(map, v_uv + vec2(-1, 0) * pixelSize).r +
        texture2D(map, v_uv + vec2(-1, 1) * pixelSize).r +
        texture2D(map, v_uv + vec2(0, -1) * pixelSize).r +
        texture2D(map, v_uv + vec2(0, 1) * pixelSize).r +
        texture2D(map, v_uv + vec2(1, -1) * pixelSize).r +
        texture2D(map, v_uv + vec2(1, 0) * pixelSize).r +
        texture2D(map, v_uv + vec2(1, 1) * pixelSize).r;

    vec3 color;
    if (current == 0.) {
        if (round == 5. || round == 6.) {
            color = vec3(0.);
        } else {
            color = vec3(1.);
        }
    } else {
        if (round == 5.) {
            color = vec3(0.);
        } else {
            color = vec3(1.);
        }
    }

    gl_FragColor.rgb = color;
    gl_FragColor.a = 1.;
}
