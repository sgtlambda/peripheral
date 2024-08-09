import {Vector} from "matter-js";

export function renderVertices(c: CanvasRenderingContext2D, vertices: Vector[]) {
  c.beginPath();
  c.moveTo(vertices[0].x, vertices[0].y);
  for (let j = 1; j < vertices.length; j++) {
    c.lineTo(vertices[j].x, vertices[j].y);
  }
  c.closePath();
}