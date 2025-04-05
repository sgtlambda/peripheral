import {Vector} from "matter-js";

export function scaleVertices(v: Vector[], scale: number) {
  return v.map(vertex => ({
    x: vertex.x * scale,
    y: vertex.y * scale,
  }));
}