precision mediump float;

uniform sampler2D map;
uniform sampler2D background;

varying vec2 v_uv;

void main() {
    vec4 cell = texture2D(map, v_uv);
    vec3 cellColor = mix(vec3(0., .75, 0.), mix(vec3(0., .2, 0.), vec3(0., .4, 0.), cell.g), cell.r);
    vec3 background = mix(vec3(texture2D(background, v_uv).r), vec3(.5, 1., .5), cell.b);

    gl_FragColor.rgb = mix(background, cellColor, cell.a);
    gl_FragColor.a = 1.;
}
