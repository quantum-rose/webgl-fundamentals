precision mediump float;

uniform mat4 viewMatrix;
uniform vec3 ambientLightColor;
uniform vec3 pointLightPosition;
uniform float specularFactor;
uniform float shininess;
uniform sampler2D map;
uniform vec3 colorMult;

uniform mat4 projectedMatrix;
uniform sampler2D projectedMap;
uniform float projectedMapOpacity;

varying vec3 v_pos;
varying vec3 v_normal;
varying vec2 v_uv;
varying vec3 v_cameraPos;
varying vec4 v_model;

float getSpecular(vec3 dir, vec3 normal, vec3 eye) {
    vec3 bisector = normalize(dir + eye);
    float eyeCos = max(dot(bisector, normal), 0.0);
    return specularFactor * pow(eyeCos, shininess);
}

void main() {
    vec3 normal = normalize(v_normal);
    vec3 eyeDir = normalize(v_cameraPos - v_pos);

    vec3 dir = (viewMatrix * vec4(pointLightPosition, 1.0)).xyz - v_pos;
    dir = normalize(dir);
    float diffuse = max(dot(normal, dir), 0.0);
    float specular = getSpecular(dir, normal, eyeDir);

    vec4 projectedPosition = projectedMatrix * v_model;
    projectedPosition /= projectedPosition.w;

    float inRange = step(0.0, projectedPosition.x) * step(projectedPosition.x, 1.0) *
        step(0.0, projectedPosition.y) * step(projectedPosition.y, 1.0) *
        step(0.0, projectedPosition.z) * step(projectedPosition.z, 1.0);

    vec4 texColor = texture2D(map, v_uv);
    vec4 projectedTexColor = texture2D(projectedMap, projectedPosition.xy);
    vec4 color = mix(texColor, projectedTexColor, inRange * projectedMapOpacity);

    gl_FragColor.rgb = color.rgb * colorMult * (ambientLightColor + diffuse) + specular;
    gl_FragColor.a = color.a;
}
