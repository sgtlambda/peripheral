import {Body, Vector, Vertices} from 'matter-js';

import Planet from '../Planet';

import circleVertices from '../../common/circleVertices';

import {subtract} from "../../common/terrainOps";

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

        const currentVertices = planet.getCurrentVertices();

        stage.removePlanet(planet);

        const paths = subtract(currentVertices, explosionVertices);

        console.log(paths);

        paths.map((path, index) => {
            console.log(index);
            const name      = `${planet.name}.${index}`;
            const newPlanet = new Planet({
                vertices: path,
                name:     name,
                density:  planet.density,
                radius:   planet.radius,
            });
            stage.addPlanet(newPlanet);
        });
    });
};