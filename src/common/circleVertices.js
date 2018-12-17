import {Vector} from "matter-js";

export default (radius, resolution) => {
    const r = [];
    for (let i = 0; i < resolution; i++) {
        r.push(Vector.rotate({x: radius, y: 0}, i / resolution * 2 * Math.PI));
    }
    return r;
};