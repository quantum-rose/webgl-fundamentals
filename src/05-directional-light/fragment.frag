precision mediump float;

uniform mat4 u_viewMatrix;
uniform vec3 u_ambientLightColor;
uniform vec3 u_reverseLightDirection;

varying vec4 v_color;
varying vec3 v_normal;

void main() {
    vec3 normal = normalize(v_normal);

    // 光照方向逻辑上是个向量而不是点，不受平移变换的影响，因此 w 设置为 0.0
    vec3 dir = (u_viewMatrix * vec4(u_reverseLightDirection, 0.0)).xyz;
    dir = normalize(dir);
    float light = max(dot(normal, dir), 0.0);

    gl_FragColor.rgb = v_color.rgb * (u_ambientLightColor + light);
    gl_FragColor.a = v_color.a;
}
