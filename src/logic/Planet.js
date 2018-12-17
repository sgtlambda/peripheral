import {Bodies, Body, Vector, Vertices} from "matter-js";
import getBodyOffset from "../common/getBodyOffset";
import circleVertices from '../common/circleVertices';
import debugRender, {planetDebugRender} from "../data/debugRender";
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

    constructor({name, body, originalVertices, radius, density, parent = null, rps = 0}) {
        this.name             = name;
        this.body             = body;
        this.originalVertices = originalVertices;
        this.radius           = radius;
        this.density          = density;
        this.parent           = parent;
        this.rps              = rps;

        // For static bodies, the mass is set to "Infinity" which breaks the gravitational
        // formula so we have to manually define the mass of the planet
        this.computeMass();

        this.originalBodyOffset = {x: 0, y: 0};
        this.planetaryParts     = [];
        // setTimeout(() => console.log(thi))
    }

    computeMass() {
        this.computedMass = Vertices.area(this.originalVertices) * this.density;
    }

    get position() {
        return Vector.sub(this.body.position, this.originalBodyOffset);
    }

    getGravityForce(body) {
        return getPlanetaryGravity({
            position: this.position,
            mass:     this.computedMass,
        }, body, this.radius);
    }

    step() {
        if (this.parent) {
            Body.setPosition(this.body, Vector.rotateAbout(this.position, this.rps, this.parent.position));
        }
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

    static create({name, radius, parent = null, rps = 0, density = .001, resolution = 124, rand = 0, x = 0, y = 0}) {
        const vertices = circleVertices(radius, resolution, rand);
        const offset   = getBodyOffset(vertices);

        const body = Bodies.fromVertices(offset.x + x, offset.y + y, vertices, {
            isStatic:        true,
            render:          planetDebugRender,
            collisionFilter: {category: cTerrain},
        });

        const planet = new Planet({
            name, body, density,
            originalVertices: vertices,
            radius, parent, rps
        });

        planet.originalBodyOffset = offset;

        return planet;
    }

    replace({main: vertices, parts = []}) {
        const originalPosition = {...this.position};
        const offset           = getBodyOffset(vertices);
        const newPos           = Vector.add(originalPosition, offset);

        const main              = Bodies.fromVertices(newPos.x, newPos.y, vertices, {
            isStatic:        true,
            render:          planetDebugRender,
            collisionFilter: {category: cTerrain},
            // ...this.attractor,
        });
        this.body               = main;
        this.originalVertices   = vertices;
        this.originalBodyOffset = offset;
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