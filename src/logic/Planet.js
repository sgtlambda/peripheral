import {Bodies, Vector, Vertices} from "matter-js";
import getBodyOffset from "../common/getBodyOffset";
import circleVertices from '../common/circleVertices';
import {planetDebugRender} from "../data/debugRender";
import {cTerrain} from "../data/collisionGroups";

export const gravityConstant = 6e-1;

export const getPlanetaryGravity = (bodyA, bodyB, epicenter) => {
    const angle  = Vector.angle(bodyA.position, bodyB.position);
    let distance = Vector.magnitude(Vector.sub(bodyA.position, bodyB.position));
    if (distance < epicenter) distance = epicenter + (epicenter - distance);
    const massProduct = bodyA.mass * bodyB.mass;
    const force       = gravityConstant * massProduct / Math.pow(distance, 2);
    return Vector.rotate({x: -force, y: 0}, angle);
};

export default class Planet {

    constructor({name, body, sourceVertices, sourceVerticesOffset = null, radius, density}) {

        this.name = name;
        this.body = body;

        this.sourceVertices       = sourceVertices;
        this.sourceVerticesOffset = sourceVerticesOffset ? sourceVerticesOffset : getBodyOffset(sourceVertices);

        this.radius  = radius;
        this.density = density;

        // For static bodies, the mass is set to "Infinity" which breaks the gravitational
        // formula so we have to manually define the mass of the planet
        this.computeMass();

        this.planetaryParts = [];
    }

    computeMass() {
        this.computedMass = Vertices.area(this.sourceVertices) * this.density;
    }

    get position() {
        return Vector.sub(this.body.position, this.sourceVerticesOffset);
    }

    getGravityForce(body) {
        return getPlanetaryGravity({
            position: this.position,
            mass:     this.computedMass,
        }, body, this.radius);
    }

    step() {
        // do something
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

    static create({name, radius, density = .001, resolution = 124, rand = 0, x = 0, y = 0}) {
        const vertices = circleVertices(radius, resolution, rand);
        const offset   = getBodyOffset(vertices);

        const body    = Bodies.fromVertices(offset.x + x, offset.y + y, vertices, {
            isStatic:        true,
            render:          planetDebugRender,
            collisionFilter: {category: cTerrain},
        });
        body.isPlanet = true;

        return new Planet({
            name, body, density, radius,
            sourceVertices:       vertices,
            sourceVerticesOffset: offset,
        });
    }

    replace({main: vertices, parts = []}) {
        const originalPosition = {...this.position};
        const offset           = getBodyOffset(vertices);
        const newPos           = Vector.add(originalPosition, offset);

        const main                = Bodies.fromVertices(newPos.x, newPos.y, vertices, {
            isStatic:        true,
            render:          planetDebugRender,
            collisionFilter: {category: cTerrain},
        });
        this.body                 = main;
        this.sourceVertices       = vertices;
        this.sourceVerticesOffset = offset;
        this.computeMass();

        const planetaryParts = parts.map(partVertices => {
            const offset  = getBodyOffset(partVertices);
            const partPos = Vector.add(originalPosition, offset);
            return Bodies.fromVertices(partPos.x, partPos.y, partVertices, {
                render:          planetDebugRender,
                collisionFilter: {category: cTerrain},
            });
        });

        this.planetaryParts = this.planetaryParts.concat(planetaryParts);

        return {
            main,
            parts: planetaryParts,
        };
    }
}