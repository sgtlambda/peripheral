import {Body, Vector, Vertices} from 'matter-js';

import Planet from '../Planet';

import circleVertices from '../../common/circleVertices';

import {subtract} from "../../common/terrainOps";

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

    stage.planets.forEach(planet => {
        const currentVertices = planet.getCurrentVertices();
        stage.removePlanet(planet);
        const paths = subtract(currentVertices, explosionVertices);
        paths.map((path, index) => {
            if (Vertices.area(path) < 40) return;
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

export default applyExplosion;