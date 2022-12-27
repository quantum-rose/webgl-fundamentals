precision mediump float;

uniform mat4 viewMatrix;
uniform vec3 ambientLightColor;
uniform vec3 reverseLightDirection;
uniform vec3 color;

varying vec3 v_normal;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 dir = (viewMatrix * vec4(reverseLightDirection, 0.0)).xyz;
    dir = normalize(dir);
    float diffuse = max(dot(normal, dir), 0.0);

    gl_FragColor.rgb = color * (ambientLightColor + diffuse);
    gl_FragColor.a = 1.0;
}
