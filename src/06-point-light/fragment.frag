precision mediump float;

uniform mat4 u_viewMatrix;
uniform vec3 u_ambientLightColor;
uniform vec3 u_pointLightPosition;
uniform float u_specularFactor;
uniform float u_shininess;

varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_pos;
varying vec3 v_cameraPos;

float getSpecular(vec3 dir, vec3 normal, vec3 eye) {
    // Phong 反射模型
    // vec3 reflectionLight = reflect(-dir, normal);
    // float eyeCos = max(dot(reflectionLight, eye), 0.0);

    // blinn-Phong 反射模型
    vec3 bisector = normalize(dir + eye);
    float eyeCos = max(dot(bisector, normal), 0.0);

    return u_specularFactor * pow(eyeCos, u_shininess);
}

void main() {
    vec3 normal = normalize(v_normal);
    vec3 eyeDir = normalize(v_cameraPos - v_pos);

    vec3 dir = (u_viewMatrix * vec4(u_pointLightPosition, 1.0)).xyz - v_pos;
    dir = normalize(dir);
    float diffuse = max(dot(normal, dir), 0.0);
    float specular = getSpecular(dir, normal, eyeDir);

    gl_FragColor.rgb = v_color.rgb * (u_ambientLightColor + diffuse) + specular;
    gl_FragColor.a = v_color.a;
}
