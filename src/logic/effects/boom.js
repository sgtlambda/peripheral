import {Body, Vector, Vertices} from 'matter-js';

import circleVertices from '../../common/circleVertices';

import {subtract} from "../../common/booleanPathOps";

export default ({stage, x, y, radius, force}) => {
    const pos = {x, y};
    stage.addedBodies.forEach(body => {
        const bpos     = body.position;
        const distance = Vector.magnitude(Vector.sub(bpos, pos));
        if (distance > radius) return;
        const forceVector        = {x: (1 - (distance / radius)) * force, y: 0};
        const rotatedForceVector = Vector.rotate(forceVector, Vector.angle(pos, bpos));
        Body.applyForce(body, bpos, rotatedForceVector);
    });
    const explosionVertices = Vertices.translate(circleVertices(radius, 12, .7), pos);
    stage.planets.forEach(planet => {
        const newTerrain = subtract(planet.originalVertices, explosionVertices);
        stage.removeBody(planet.body);
        const {main, parts = []} = planet.replace(newTerrain);
        stage.addTerrainBody(main);
        parts.forEach(part => stage.addTerrainBody(part));
    });
};