import { mat3, mat4, quat, vec2, vec3 } from "gl-matrix";
import { vertexShaderSource, fragmentShaderSource } from "./shaders";
import { screenPointToRay, rayTriangleIntersection, makeGizmo, transformVertices, orientZAxisGizmo, transformRay } from "./utils"
import { gjk3d } from "./gjk";

export class Input {
    mousePos: vec2;
    mouseDelta: vec2;
    mouseDown: boolean;
    keys: Set<string>

    constructor() {
        this.mousePos = vec2.create();
        this.mouseDelta = vec2.create();
        this.mouseDown = false;
        this.keys = new Set();
    }
}

type Camera = mat4;

export class Geometry {
    positions: Float32Array;
    normals?: Float32Array;
    uvs?: Float32Array;
    indices?: Uint32Array;

    constructor(
        positions: Float32Array,
        normals?: Float32Array,
        uvs?: Float32Array,
        indices?: Uint32Array,
    ) {
        this.positions = positions;
        this.normals = normals;
        this.uvs = uvs;
        this.indices = indices;
    }
}

export class Mesh {
    geometry: Geometry | null = null;
    vao: WebGLVertexArrayObject | null = null;
    indexCount: number | null = null;
    verticesCount: number | null = null;
    indexed: boolean | null = null;

    constructor(geometry?: Geometry) {
        if (geometry) this.geometry = geometry;
    }
}

type P = {
    position: vec3
    rotation: quat
    scale: vec3
};

export class Transform {
    position: vec3 = vec3.create();
    rotation: quat = quat.create();
    scale: vec3 = vec3.fromValues(1, 1, 1);

    constructor(
        params: Partial<P> = {
            position: vec3.create(), 
            rotation: quat.create(), 
            scale: vec3.fromValues(1, 1, 1),
        }
    ) {
        if (params.position) this.position = params.position;
        if (params.rotation) this.rotation = params.rotation;
        if (params.scale) this.scale = params.scale;
    }

    getMatrix(): mat4 {
        return mat4.fromRotationTranslationScale(
            mat4.create(),
            this.rotation,
            this.position,
            this.scale,
        )
    }

    clone(): Transform {
        const t = new Transform();
        vec3.copy(t.position, this.position);
        quat.copy(t.rotation, this.rotation);
        vec3.copy(t.scale, this.scale);
        return t;
    }
}

export class Material {
    color: vec3;

    constructor(color: vec3 = vec3.fromValues(1, 1, 1)) {
        this.color = color;
    }
}

export class Entity {
    id: number;

    transform: Transform;
    mesh: Mesh | null;
    material: Material;
    isColliding: boolean = false;

    constructor(mesh: Mesh | null, transform: Transform, material = new Material()) {
        this.id = parseInt(Math.random().toString().split(".")[1]);

        this.mesh = mesh;
        this.transform = transform;
        this.material = material;
    }

    get geometry(): Geometry {
        if (this.mesh === null || this.mesh.geometry === null) {
            throw `No mesh or mesh.geometry in this entity: ${this.id}`;
        }

        return this.mesh.geometry;
    }

    clone(): Entity {
        return new Entity(
            this.mesh,               // shared GPU mesh
            this.transform.clone()   // deep copy transform
        );
    }

    cloneLinked(): Entity {
        const e = new Entity(this.mesh, this.transform.clone());
        e.material = this.material; // same reference
        return e;
    }

    // cloneDeep(renderer: Renderer): Entity {
    //     const newMesh = renderer.cloneMesh(this.mesh);
    //     return new Entity(
    //         newMesh,
    //         this.transform.clone()
    //     );
    // }
    
    
}

export class Scene {
    entities: Entity[] = [];

    add(entity: Entity) {
        this.entities.push(entity);
    }
}

type Collision = {
    a: Entity;
    b: Entity;
    normal?: vec3;
    penetration?: number;
}

export class CollisionSystem {
    collisions: Collision[] = [];

    constructor() {
    }

    update(entities: Entity[]) {
        this.collisions.length = 0;

        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entity1 = entities[i];
                const entity2 = entities[j];
                const a = transformVertices(Array.from(entity1.geometry.positions), entity1.transform.getMatrix())
                const b = transformVertices(Array.from(entity2.geometry.positions), entity2.transform.getMatrix())

                if (gjk3d(a, b)) {
                    this.collisions.push({
                        a: entity1, b: entity2, 
                    });
                }
            }
        }
    }
}

export class Selection {
    entity: Entity | null = null;
}

export class TransformGizmo {
    mode: "translate" = "translate";
    axis: "x" | "y" | "z" | "free" | null = null;

    active: boolean = false;
    startPointWorld: vec3 | null = null;
}

export class Renderer {
    private gl: WebGL2RenderingContext
    private program: WebGLProgram;
    private canvas: HTMLCanvasElement;
    

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const gl = this.canvas.getContext("webgl2");
        const w = canvas.width;
        const h = canvas.height;

        if (gl === null) {
            throw "WebGL 2 is not supported";
        }

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

    private depth(d: boolean) {
        const gl = this.gl;
        if (d) {
            gl.enable(gl.DEPTH_TEST);
            gl.depthMask(true); 
        } else {
            gl.disable(gl.DEPTH_TEST);
            gl.depthMask(false);
        }
    }

    private _initializeProgram() {
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

    render(scene: Scene, camera: Camera) {
        this.depth(true);
        for (const entity of scene.entities) {
            this.drawMesh(entity, entity.material.color, camera);
        }
    }

    drawMesh(entity: Entity, color: vec3, camera: mat4) {
        this.gl.bindVertexArray(entity.mesh!.vao);
        if (!entity.mesh!.indexCount) {
            this.gl.bindVertexArray(entity.mesh!.vao);

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
            this.gl.drawArrays(this.gl.TRIANGLES, 0, entity.mesh!.verticesCount!);
            //         break;

            //     case DrawMode.Elements:
            //         this.gl.drawElements(this.gl.TRIANGLES, entity.mesh.indexCount, this.gl.UNSIGNED_INT, 0)
            //         break;

            // }                
        }
    }

    drawLines(entity: Entity, color: vec3 = vec3.fromValues(1,0,0)) {
        const gl = this.gl
        const uColour = this.gl.getUniformLocation(this.program, "uColour");

        this.gl.uniform3f(uColour, color[0], color[1], color[2]);

        gl.drawArrays(gl.LINE_LOOP, 0, entity.mesh!.verticesCount!);
    }

    createMesh(geometry: Geometry, drawType: GLenum = this.gl.STATIC_DRAW): Mesh {
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
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, geometry.indices!, drawType);
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
