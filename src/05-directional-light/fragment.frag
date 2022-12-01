precision mediump float;

uniform vec3 u_ambientLightColor;
uniform vec3 u_reverseLightDirection;

varying vec4 v_color;
varying vec3 v_normal;

void main() {
    vec3 normal = normalize(v_normal);
    float light = max(dot(normal, u_reverseLightDirection), 0.0);
    gl_FragColor.rgb = v_color.rgb * (u_ambientLightColor + light);
    gl_FragColor.a = v_color.a;
}
