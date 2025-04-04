import {Vector, Vertices} from "matter-js";

export default (
  radius: number,
  resolution: number,
  radiusRand          = 0,
  rotateRand: boolean = false,
): Vector[] => {
  const r = [];
  for (let i = 0; i < resolution; i++) {
    const distort    = Math.random() * radiusRand * radius - (radiusRand * radius / 2);
    const baseVector = {x: radius + distort, y: 0};
    const angle      = i / resolution * 2 * Math.PI;
    r.push(Vector.rotate(baseVector, angle));
  }
  return rotateRand
    ? Vertices.rotate(r, Math.random() * Math.PI * 2, {x: 0, y: 0})
    : r;
};