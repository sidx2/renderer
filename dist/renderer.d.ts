import { mat4, quat, vec3 } from "gl-matrix";
declare class Geometry {
    positions: Float32Array;
    normals?: Float32Array;
    uvs?: Float32Array;
    indices?: Uint32Array;
    constructor(positions: Float32Array, normals?: Float32Array, uvs?: Float32Array, indices?: Uint32Array);
}
declare class Mesh {
    geometry: Geometry | null;
    vao: WebGLVertexArrayObject | null;
    indexCount: number | null;
    verticesCount: number | null;
    indexed: boolean | null;
}
type P = {
    position: vec3;
    rotation: quat;
    scale: vec3;
};
declare class Transform {
    position: vec3;
    rotation: quat;
    scale: vec3;
    constructor(params?: Partial<P>);
    getMatrix(): mat4;
    clone(): Transform;
}
declare class Material {
    color: vec3;
    constructor(color?: vec3);
}
export declare class Entity {
    id: number;
    transform: Transform;
    mesh: Mesh | null;
    material: Material;
    isColliding: boolean;
    constructor(mesh: Mesh | null, transform: Transform, material?: Material);
    get geometry(): Geometry;
    clone(): Entity;
    cloneLinked(): Entity;
}
export {};
//# sourceMappingURL=renderer.d.ts.map