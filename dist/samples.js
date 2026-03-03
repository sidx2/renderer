import { cubeObj, planeObj } from "./data";
import { parseObj } from "./parser";
import { Geometry, Mesh } from "./renderer";
const cubeData = parseObj(cubeObj);
const planeDate = parseObj(planeObj);
const cubeGeometry = new Geometry(cubeData.vertices, cubeData.normals, cubeData.textures);
const planeGeometry = new Geometry(planeDate.vertices, planeDate.normals, planeDate.textures);
const cubeMesh = new Mesh(cubeGeometry);
const planeMesh = new Mesh(planeGeometry);
export const Samples = {
    cubeGeometry,
    cubeMesh,
    planeGeometry,
    planeMesh,
};
