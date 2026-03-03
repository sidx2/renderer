export const vertexShaderSource = `#version 300 es
precision mediump float;

in vec3 position;
in vec3 normal;

out vec3 vNormal;
out vec3 oColour;

uniform mat4 uMat;
uniform mat4 uPersp;
uniform mat3 uNormalMatrix;
uniform vec3 uColour;

void main() {
    gl_Position = uPersp * uMat * vec4(position, 1);
    vNormal = normalize(uNormalMatrix * normal);
    oColour = uColour;
}

`;
export const fragmentShaderSource = `#version 300 es
precision mediump float;

out vec4 outColor;

in vec3 vNormal;
in vec3 oColour;

void main() {
    float d = dot(normalize(vNormal), normalize(vec3(0,0,-1)));
    float t = clamp(d/-1.0, 0.0, 1.0);

    float start = 0.5;
    float end = 1.0;
    float intensity = mix(0.5, 1.0, t);
    outColor = vec4(oColour * intensity, 1.0);
}

`;
// M * tM = cM;
export const skyboxVertexShaderSource = `#version 300 es
precision mediump float;

in vec4 a_position;
out vec4 v_position;

void main() {
    v_position = a_position;
    gl_Position = a_position;
    gl_Position.z = 1.0;
}
`;
export const skyboxFragmentShaderSource = `#version 300 es
precision mediump float;

uniform samplerCube u_skybox;
uniform mat4 u_viewDirectionProjectionInverse;
 
in vec4 v_position;
out vec4 outColor;

void main() {
    vec4 t = u_viewDirectionProjectionInverse * v_position;
    outColor = texture(u_skybox, normalize(t.xyz / t.w));
    // outColor = vec4(1., 0.5, 0.25, 1.0);
}
`;
