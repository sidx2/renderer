import { cubeObj } from "./data";
import { parseObj } from "./parser";
import { Geometry, Mesh } from "./renderer";

const cubeData = parseObj(cubeObj);

const cubeGeometry = new Geometry(
    cubeData.vertices!, 
    cubeData.normals!, 
    cubeData.textures!
);

const cubeMesh = new Mesh(cubeGeometry);

export const Samples = {
    cubeMesh,
}
