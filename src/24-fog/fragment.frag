precision mediump float;

#define LOG2 1.442695

uniform mat4 viewMatrix;
uniform vec3 ambientLightColor;
uniform vec3 reverseLightDirection;
uniform vec3 fogColor;
uniform float fogDensity;
uniform vec3 color;

varying vec3 v_pos;
varying vec3 v_normal;

void main() {
    vec3 normal = normalize(v_normal);

    vec3 dir = (viewMatrix * vec4(reverseLightDirection, 0.0)).xyz;
    dir = normalize(dir);
    float diffuse = max(dot(normal, dir), 0.0);

    float fogDistance = length(v_pos);
    float fogAmount = clamp(1. - exp2(-fogDensity * fogDensity * fogDistance * fogDistance * LOG2), 0.0, 1.0);

    gl_FragColor.rgb = mix(color * (ambientLightColor + diffuse), fogColor, fogAmount);
    gl_FragColor.a = 1.0;
}
