import { mat4, quat, vec2, vec3 } from "gl-matrix";
export declare class Input {
    mousePos: vec2;
    mouseDelta: vec2;
    mouseDown: boolean;
    keys: Set<string>;
    constructor();
}
type Camera = mat4;
export declare class Geometry {
    positions: Float32Array;
    normals?: Float32Array;
    uvs?: Float32Array;
    indices?: Uint32Array;
    constructor(positions: Float32Array, normals?: Float32Array, uvs?: Float32Array, indices?: Uint32Array);
}
export declare class Mesh {
    geometry: Geometry | null;
    vao: WebGLVertexArrayObject | null;
    indexCount: number | null;
    verticesCount: number | null;
    indexed: boolean | null;
    constructor(geometry?: Geometry);
}
type P = {
    position: vec3;
    rotation: quat;
    scale: vec3;
};
export declare class Transform {
    position: vec3;
    rotation: quat;
    scale: vec3;
    constructor(params?: Partial<P>);
    getMatrix(): mat4;
    clone(): Transform;
}
export declare class Material {
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
export declare class Scene {
    entities: Entity[];
    add(entity: Entity): void;
}
type Collision = {
    a: Entity;
    b: Entity;
    normal?: vec3;
    penetration?: number;
};
export declare class CollisionSystem {
    collisions: Collision[];
    constructor();
    update(entities: Entity[]): void;
}
export declare class Selection {
    entity: Entity | null;
}
export declare class TransformGizmo {
    mode: "translate";
    axis: "x" | "y" | "z" | "free" | null;
    active: boolean;
    startPointWorld: vec3 | null;
}
export declare class Renderer {
    private gl;
    private program;
    private canvas;
    constructor(canvas: HTMLCanvasElement);
    private depth;
    private _initializeProgram;
    render(scene: Scene, camera: Camera): void;
    clearCanvas(color: vec3): void;
    drawMesh(entity: Entity, color: vec3, camera: mat4): void;
    drawLines(entity: Entity, color?: vec3): void;
    createMesh(geometry: Geometry, drawType?: GLenum): Mesh;
}
export {};
//# sourceMappingURL=renderer.d.ts.map