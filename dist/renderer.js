import { mat3, mat4, quat, vec2, vec3 } from "gl-matrix";
import { vertexShaderSource, fragmentShaderSource } from "./shaders";
import { transformVertices } from "./utils";
import { gjk3d } from "./gjk";
class Input {
    constructor() {
        this.mousePos = vec2.create();
        this.mouseDelta = vec2.create();
        this.mouseDown = false;
        this.keys = new Set();
    }
}
class Geometry {
    constructor(positions, normals, uvs, indices) {
        this.positions = positions;
        this.normals = normals;
        this.uvs = uvs;
        this.indices = indices;
    }
}
class Mesh {
    constructor() {
        this.geometry = null;
        this.vao = null;
        this.indexCount = null;
        this.verticesCount = null;
        this.indexed = null;
    }
}
class Transform {
    constructor(params = {
        position: vec3.create(),
        rotation: quat.create(),
        scale: vec3.fromValues(1, 1, 1),
    }) {
        this.position = vec3.create();
        this.rotation = quat.create();
        this.scale = vec3.fromValues(1, 1, 1);
        if (params.position)
            this.position = params.position;
        if (params.rotation)
            this.rotation = params.rotation;
        if (params.scale)
            this.scale = params.scale;
    }
    getMatrix() {
        return mat4.fromRotationTranslationScale(mat4.create(), this.rotation, this.position, this.scale);
    }
    clone() {
        const t = new Transform();
        vec3.copy(t.position, this.position);
        quat.copy(t.rotation, this.rotation);
        vec3.copy(t.scale, this.scale);
        return t;
    }
}
class Material {
    constructor(color = vec3.fromValues(1, 1, 1)) {
        this.color = color;
    }
}
export class Entity {
    constructor(mesh, transform, material = new Material()) {
        this.isColliding = false;
        this.id = parseInt(Math.random().toString().split(".")[1]);
        this.mesh = mesh;
        this.transform = transform;
        this.material = material;
    }
    get geometry() {
        if (this.mesh === null || this.mesh.geometry === null) {
            throw `No mesh or mesh.geometry in this entity: ${this.id}`;
        }
        return this.mesh.geometry;
    }
    clone() {
        return new Entity(this.mesh, // shared GPU mesh
        this.transform.clone() // deep copy transform
        );
    }
    cloneLinked() {
        const e = new Entity(this.mesh, this.transform.clone());
        e.material = this.material; // same reference
        return e;
    }
}
class Scene {
    constructor() {
        this.entities = [];
    }
    add(entity) {
        this.entities.push(entity);
    }
}
class CollisionSystem {
    constructor() {
        this.collisions = [];
    }
    update(entities) {
        this.collisions.length = 0;
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entity1 = entities[i];
                const entity2 = entities[j];
                const a = transformVertices(Array.from(entity1.geometry.positions), entity1.transform.getMatrix());
                const b = transformVertices(Array.from(entity2.geometry.positions), entity2.transform.getMatrix());
                if (gjk3d(a, b)) {
                    this.collisions.push({
                        a: entity1, b: entity2,
                    });
                }
            }
        }
    }
}
class Selection {
    constructor() {
        this.entity = null;
    }
}
class TransformGizmo {
    constructor() {
        this.mode = "translate";
        this.axis = null;
        this.active = false;
        this.startPointWorld = null;
    }
}
class Renderer {
    constructor(gl, w, h) {
        this.gl = gl;
        this.program = this._initializeProgram();
        gl.enable(gl.DEPTH_TEST);
        // gl.enable(gl.BLEND);
        // gl.depthMask(false);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.viewport(0, 0, w, h);
    }
    depth(d) {
        const gl = this.gl;
        if (d) {
            gl.enable(gl.DEPTH_TEST);
            gl.depthMask(true);
        }
        else {
            gl.disable(gl.DEPTH_TEST);
            gl.depthMask(false);
        }
    }
    _initializeProgram() {
        const program = this.gl.createProgram();
        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        if (vertexShader) {
            this.gl.shaderSource(vertexShader, vertexShaderSource);
            this.gl.compileShader(vertexShader);
            this.gl.attachShader(program, vertexShader);
        }
        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        if (fragmentShader) {
            this.gl.shaderSource(fragmentShader, fragmentShaderSource);
            this.gl.compileShader(fragmentShader);
            this.gl.attachShader(program, fragmentShader);
        }
        this.gl.linkProgram(program);
        this.gl.useProgram(program);
        return program;
    }
    render(scene, camera) {
        this.depth(true);
        for (const entity of scene.entities) {
            this.drawMesh(entity, entity.material.color, camera);
        }
    }
    drawMesh(entity, color, camera) {
        this.gl.bindVertexArray(entity.mesh.vao);
        if (!entity.mesh.indexCount) {
            this.gl.bindVertexArray(entity.mesh.vao);
            const model = entity.transform.getMatrix();
            const uMat = this.gl.getUniformLocation(this.program, "uMat");
            this.gl.uniformMatrix4fv(uMat, false, new Float32Array(model));
            const uPersp = this.gl.getUniformLocation(this.program, "uPersp");
            this.gl.uniformMatrix4fv(uPersp, false, new Float32Array(camera));
            const uColour = this.gl.getUniformLocation(this.program, "uColour");
            const [r, g, b] = color;
            this.gl.uniform3f(uColour, r, g, b);
            const normalMatrix = mat3.create();
            mat3.normalFromMat4(normalMatrix, model);
            const uNormalMatrix = this.gl.getUniformLocation(this.program, "uNormalMatrix");
            this.gl.uniformMatrix3fv(uNormalMatrix, false, new Float32Array(normalMatrix));
            // switch(entity.mesh.drawMode) {
            //     case DrawMode.Arrays:
            this.gl.drawArrays(this.gl.TRIANGLES, 0, entity.mesh.verticesCount);
            //         break;
            //     case DrawMode.Elements:
            //         this.gl.drawElements(this.gl.TRIANGLES, entity.mesh.indexCount, this.gl.UNSIGNED_INT, 0)
            //         break;
            // }                
        }
    }
    drawLines(entity, color = vec3.fromValues(1, 0, 0)) {
        const gl = this.gl;
        const uColour = this.gl.getUniformLocation(this.program, "uColour");
        this.gl.uniform3f(uColour, color[0], color[1], color[2]);
        gl.drawArrays(gl.LINE_LOOP, 0, entity.mesh.verticesCount);
    }
    createMesh(geometry, drawType = this.gl.STATIC_DRAW) {
        const { gl } = this;
        const vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);
        const vertexCount = geometry.positions.length / 3;
        const defaultNormalBuffer = new Float32Array([...Array(vertexCount * 3).fill(0).map((_itm, idx) => (idx + 1) % 3 == 0 ? -1 : 0)]);
        const normalsArray = geometry.normals?.length ? geometry.normals : defaultNormalBuffer;
        {
            const buffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, normalsArray, drawType);
            const normalLocation = this.gl.getAttribLocation(this.program, "normal");
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.enableVertexAttribArray(normalLocation);
            this.gl.vertexAttribPointer(normalLocation, 3, this.gl.FLOAT, false, 0, 0);
        }
        if ((geometry.indices?.length ?? 0) > 0) {
            const buffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, geometry.indices, drawType);
        }
        const positionLocation = this.gl.getAttribLocation(this.program, "position");
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.bindVertexArray(null);
        const mesh = new Mesh();
        mesh.vao = vao;
        mesh.indexCount = 0;
        mesh.verticesCount = geometry.positions.length / 3;
        mesh.indexed = false;
        mesh.geometry = geometry;
        gl.bindVertexArray(null);
        return mesh;
    }
}
