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

    float isCell = color.r;
    float roundIsTwo = float(round == 2.);
    float roundIsThree = float(round == 3.);
    float isCellAndRoundIsTwoOrThree = isCell * (roundIsTwo + roundIsThree);
    float isDeadAndRoundIsThree = (1. - isCell) * roundIsThree;

    /**
     * 1 为真, 0 为假
     * r: 是否是细胞
     * g: 与上一次相比是否发生了变化
     * b: 每次新生成细胞时 +0.01
     * a: 有细胞时置为 1, 否则每次迭代 -0.02 (实现拖影效果)
     */
    color.r = isCellAndRoundIsTwoOrThree + isDeadAndRoundIsThree;
    color.g = float(color.r != isCell);
    color.b = min(1., color.b + .01 * isDeadAndRoundIsThree);
    color.a = max(0., min(1., color.a + color.r) - .02 * (1. - color.r));

    gl_FragColor = color;
}
