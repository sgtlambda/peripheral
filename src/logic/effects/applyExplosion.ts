import {Body, Vector, Vertices} from 'matter-js';

import circleVertices from '../../common/circleVertices';
import {nom} from './nom';
import Stage from "../Stage";
import {flash} from "./flash";

/**
 */
const applyExplosion = ({stage, x, y, nomRadius, effectRadius, resolution = 32, rand = 0, force}: {
  stage: Stage;
  x: number;
  y: number;
  nomRadius: number;
  effectRadius?: number;
  resolution?: number;
  rand: number;
  force: number;
}) => {

  const origin = {x, y};

  effectRadius ??= nomRadius;

  const explosionVertices = Vertices.translate(circleVertices(nomRadius, resolution, rand, true), origin, 1);

  flash(stage, {
    duration: 400,
    color:    '#ff4040',
    polygon:  explosionVertices,
  });

  nom(stage, explosionVertices);

  // TODO this can be optimized, don't need to create a new array every time (?)
  // TODO also affect player
  // TODO also inflict damage on both the player and NPCs on the stage?
  // TODO also affect 'planetary' parts under a certain size
  const affectedBodies = [
    ...stage.addedBodies,
    ...stage.strayItems.map(item => item.getCollider()),
    ...stage.npcs.map(npc => npc.body),
    ...stage.planets.filter(planet => !planet.body.isStatic).map(planet => planet.body),
  ];

  // Apply outward force from the explosion
  // Note that one of these bodies is the thing causing the explosion.. is that a problem (?)
  affectedBodies.forEach(body => {

    const position = body.position;
    const distance = Vector.magnitude(Vector.sub(position, origin));

    if (distance > effectRadius!) return;

    const forceVector        = {x: (1 - (distance / effectRadius!)) * force, y: 0};
    const rotatedForceVector = Vector.rotate(forceVector, Vector.angle(origin, position));
    Body.applyForce(body, position, rotatedForceVector);
  });
};

export default applyExplosion;