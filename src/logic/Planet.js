import {Bodies, Vector} from "matter-js";
import getBodyOffset from "../common/getBodyOffset";
import debugRender from "../data/debugRender";
import {cTerrain} from "../data/collisionGroups";

const planetVertices = (radius, points = 64) => {
    const r = [];
    for (let i = 0; i < points; i++) {
        r.push(Vector.rotate({x: radius, y: 0}, i / points * 2 * Math.PI));
    }
    return r;
};

const planetAttractor = (gravity) => ({
    plugin: {
        attractors: [(bodyA, bodyB) => {
            const angle    = Vector.angle(bodyA.position, bodyB.position);
            const distance = Vector.magnitude(Vector.sub(bodyA.position, bodyB.position));

            const force = gravity / Math.pow(distance, 2);

            return Vector.rotate({x: -force, y: 0}, angle);
        }],
    }
});

export default class Planet {

    constructor({name, body, radius, gravity}) {
        this.name   = name;
        this.body   = body;
        this.radius = radius;
    }

    get position() {
        return this.body.position;
    }

    /**
     * Return the distance from the surface for the given point
     * @param {{x, y}} point
     * @returns {number}
     */
    getPointAltitude(point) {
        const distanceFromCore = Vector.magnitude(Vector.sub(point, this.position));
        return distanceFromCore - this.radius;
    }

    static create({name, radius, resolution = 200, density = 9e-4, x = 0, y = 0}) {
        const gravity  = Math.pow(radius, 2) * density;
        const vertices = planetVertices(radius, resolution);
        const offset   = getBodyOffset(vertices);
        const body     = Bodies.fromVertices(offset.x + x, offset.y + y, vertices, {
            isStatic:        true,
            render:          debugRender,
            collisionFilter: {category: cTerrain},
            ...planetAttractor(gravity),
        });
        return new Planet({name, body, radius, gravity});
    }
}