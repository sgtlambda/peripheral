import {Vector} from "matter-js";

export default (radius, resolution, rand = 0): Vector[] => {
  const r = [];
  for (let i = 0; i < resolution; i++) {
    const distort    = Math.random() * rand * radius - (rand * radius / 2);
    const baseVector = {x: radius + distort, y: 0};
    const angle      = i / resolution * 2 * Math.PI;
    r.push(Vector.rotate(baseVector, angle));
  }
  return r;
};