import {Vector, Body, Vertex} from "matter-js";

import {raycast} from '../common/ray';

export type RayCollision = {
  body: Body;
  point: Vector;
  normal: Vector;
  verts: [Vertex, Vertex];
}

export function scanRay(origin: Vector, angle: number, startDist: number, endDist: number, stepDist: number, bodies: Body[]): RayCollision | null {

  const startPos = Vector.add(origin, Vector.rotate({x: startDist, y: 0}, angle));

  for (let i = startDist + stepDist; i < endDist; i += stepDist) {
    const endPos     = Vector.add(origin, Vector.rotate({x: i, y: 0}, angle));
    const collisions = raycast(bodies, startPos, endPos);
    if (collisions.length) {
      return collisions[0];
    }
  }

  return null;
}