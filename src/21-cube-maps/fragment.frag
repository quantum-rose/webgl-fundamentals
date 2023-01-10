precision mediump float;

uniform mat4 viewMatrix;
uniform vec3 ambientLightColor;
uniform vec3 spotLightColor;
uniform vec3 spotLightPosition;
uniform vec3 spotLightDirection;
uniform float spotLightInnerLimit;
uniform float spotLightOuterLimit;
uniform float specularFactor;
uniform float shininess;
uniform samplerCube cubeMap;

varying vec3 v_pos;
varying vec3 v_normal;
varying vec3 v_cameraPos;
varying vec3 v_direction;

float getSpecular(vec3 dir, vec3 normal, vec3 eye) {
    vec3 bisector = normalize(dir + eye);
    float eyeCos = max(dot(bisector, normal), 0.0);
    return specularFactor * pow(eyeCos, shininess);
}

void main() {
    vec3 normal = normalize(v_normal);
    vec3 eyeDir = normalize(v_cameraPos - v_pos);

    vec3 dir = (viewMatrix * vec4(spotLightPosition, 1.0)).xyz - v_pos;
    dir = normalize(dir);
    float diffuse = max(dot(normal, dir), 0.0);
    vec3 spotDir = (viewMatrix * vec4(spotLightDirection, 0.0)).xyz;
    float specular = getSpecular(dir, normal, eyeDir);
    float inLight = smoothstep(spotLightOuterLimit, spotLightInnerLimit, dot(dir, normalize(-spotDir)));
    diffuse *= inLight;
    specular *= inLight;

    vec4 color = textureCube(cubeMap, normalize(v_direction));

    gl_FragColor.rgb = color.rgb * (ambientLightColor + spotLightColor * diffuse) + spotLightColor * specular;
    gl_FragColor.a = color.a;
}
