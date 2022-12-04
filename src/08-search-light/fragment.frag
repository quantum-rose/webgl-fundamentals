precision mediump float;

uniform mat4 u_viewMatrix;
uniform vec3 u_ambientLightColor;
uniform vec3 u_searchLightPosition;
uniform vec3 u_searchLightDirection;
uniform float u_searchLightInnerLimit;
uniform float u_searchLightOuterLimit;
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

    vec3 dir = (u_viewMatrix * vec4(u_searchLightDirection, 0.0)).xyz; // 类似平行光，入射光方向不受光源位置影响
    dir = normalize(-dir); // 这里顺便反转方向
    float diffuse = max(dot(normal, dir), 0.0);
    float specular = getSpecular(dir, normal, eyeDir);
    vec3 v = (u_viewMatrix * vec4(u_searchLightPosition, 1.0)).xyz - v_pos; // 当前坐标到探照灯圆心的向量
    float dirLen = dot(dir, v); // v 在平行于 dir 方向上的分量的长度
    float r = length(v - dir * dirLen); // 当前坐标到探照灯中轴线的距离（v 垂直与 dir 方向上的分量的长度）
    float isFront = step(0.0, dirLen); // 判断是不是在探照灯前方，后方不会被照亮
    float inLight = smoothstep(u_searchLightOuterLimit, u_searchLightInnerLimit, r) * isFront;
    diffuse *= inLight;
    specular *= inLight;

    gl_FragColor.rgb = v_color.rgb * (u_ambientLightColor + diffuse) + specular;
    gl_FragColor.a = v_color.a;
}
