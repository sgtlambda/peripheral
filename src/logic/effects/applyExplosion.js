import {Body, Vector, Vertices} from 'matter-js';

import circleVertices from '../../common/circleVertices';
import {nom} from "./nom";

const applyExplosion = ({stage, x, y, radius, resolution = 12, rand = .7, force}) => {

    const origin = {x, y};

    // Apply outward force from the explosion
    stage.addedBodies.forEach(body => {

        const position = body.position;
        const distance = Vector.magnitude(Vector.sub(position, origin));

        if (distance > radius) return;

        const forceVector        = {x: (1 - (distance / radius)) * force, y: 0};
        const rotatedForceVector = Vector.rotate(forceVector, Vector.angle(origin, position));
        Body.applyForce(body, position, rotatedForceVector);
    });

    const explosionVertices = Vertices.translate(circleVertices(radius, resolution, rand), origin);

    nom(stage, explosionVertices);
};

export default applyExplosion;