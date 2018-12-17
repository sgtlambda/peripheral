import {Vector} from "matter-js";

export default (radius, resolution, rand = 0) => {
    const r = [];
    for (let i = 0; i < resolution; i++) {
        const distort = Math.random() * rand * radius - (rand * radius / 2);
        r.push(Vector.rotate({x: radius + distort, y: 0}, i / resolution * 2 * Math.PI));
    }
    return r;
};