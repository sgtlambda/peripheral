import {Body, Vector, Vertices} from 'matter-js';

import circleVertices from '../../common/circleVertices';
import {nom} from './nom';
import Stage from "../Stage";
import {flash} from "./flash";

const applyExplosion = ({stage, x, y, radius, resolution = 32, rand = 0, force}: {
  stage: Stage;
  x: number;
  y: number;
  radius: number;
  resolution: number;
  rand: number;
  force: number;
}) => {

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

  // TODO also apply forces to crates, players, etc.

  const explosionVertices = Vertices.translate(circleVertices(radius, resolution, rand), origin, 1);

  flash(stage, {
    duration: 200,
    color:    '#ff7758',
    polygon:  explosionVertices,
  });

  nom(stage, explosionVertices);
};

export default applyExplosion;