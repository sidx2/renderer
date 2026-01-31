# Simple WebGL Renderer

## Don't use in production. Not stable

## Installation

```bash
npm install https://github.com/sidx2/renderer
```

## Usage
```ts
import { Entity, Material, Renderer, Samples, Scene, Transform } from "renderer";
import { mat4, quat, vec3 } from "gl-matrix";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = 16 * 80;
canvas.height = 9 * 80;

const render = new Renderer(canvas);

const cubeMesh = render.createMesh(Samples.cubeGeometry);
const cube = new Entity(
    cubeMesh, 
    new Transform({position: vec3.fromValues(0, 0, -3)}),
    new Material(vec3.fromValues(0.2, 0.3, 0.9)),
);

const scene = new Scene();
scene.add(cube);

const camera = mat4.perspective(mat4.create(), Math.PI/2, 16/9, 1e-3, 1e3);
const angle = Math.PI/180;

const loop = () => {
    quat.rotateY(cube.transform.rotation, cube.transform.rotation, angle);
    render.clearCanvas(vec3.fromValues(0x18/255, 0x18/255, 0x18/255));
    render.render(scene, camera);

    window.requestAnimationFrame(loop);
}

loop();
```

## Output

<video controls type="video/mp4" src="./output.mp4" autoplay>
