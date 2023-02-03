precision mediump float;

uniform sampler2D map;
uniform float pixelSize;

varying vec2 v_uv;

void main() {
    vec4 color = texture2D(map, v_uv);

    float round = texture2D(map, v_uv + vec2(-1, -1) * pixelSize).r +
        texture2D(map, v_uv + vec2(-1, 0) * pixelSize).r +
        texture2D(map, v_uv + vec2(-1, 1) * pixelSize).r +
        texture2D(map, v_uv + vec2(0, -1) * pixelSize).r +
        texture2D(map, v_uv + vec2(0, 1) * pixelSize).r +
        texture2D(map, v_uv + vec2(1, -1) * pixelSize).r +
        texture2D(map, v_uv + vec2(1, 0) * pixelSize).r +
        texture2D(map, v_uv + vec2(1, 1) * pixelSize).r;

    /**
     * 1 为真, 0 为假
     * r: 是否是细胞
     * g: 与上一次相比是否发生了变化
     * b: 每次新生成细胞时 +0.01
     * a: 有细胞时置为 1, 否则每次迭代 -0.02 (实现拖影效果)
     */
    if (color.r == 1.) {
        if (round == 2. || round == 3.) {
            color.g = 0.;
            color.a = 1.;
        } else {
            color.r = 0.;
            color.g = 1.;
            color.a = max(0., color.a - .02);
        }
    } else {
        if (round == 3.) {
            color.r = 1.;
            color.g = 1.;
            color.b = min(1., color.b + .01);
            color.a = 1.;
        } else {
            color.g = 0.;
            color.a = max(0., color.a - .02);
        }
    }

    gl_FragColor = color;
}
