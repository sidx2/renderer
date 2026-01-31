import { vec3, mat4 } from "gl-matrix";
import { Entity } from "./renderer";
import { GPUObj } from "./parser";
export declare const transformVertices: (vertices: number[], model: mat4) => number[];
export declare function screenPointToRay(screenX: number, screenY: number, screenWidth: number, screenHeight: number, projection: mat4): {
    O: vec3;
    D: vec3;
};
export declare const rayTriangleIntersection: (ray: {
    O: vec3;
    D: vec3;
}, triangle: number[], transform: mat4, t?: number) => false | {
    N: vec3;
    t: number;
};
export declare const makeGizmo: () => GPUObj;
interface Ray {
    O: vec3;
    D: vec3;
}
export declare function transformRay(ray: Ray, m: mat4): Ray;
export declare function orientZAxisGizmo(gizmo: Entity, view: mat4, projection: mat4): void;
export declare function saveFrame(pixels: Uint8Array, w: number, h: number, frame: number): void;
export {};
//# sourceMappingURL=utils.d.ts.map