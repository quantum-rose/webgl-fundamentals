precision mediump float;

uniform mat4 viewMatrix;
uniform samplerCube cubeMap;

varying vec3 v_pos;
varying vec3 v_normal;
varying vec3 v_cameraPos;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 eyeDir = normalize(v_pos - v_cameraPos);

    vec4 color = textureCube(cubeMap, reflect(eyeDir, normal) * mat3(viewMatrix));

    gl_FragColor.rgb = color.rgb;
    gl_FragColor.a = color.a;
}
