import {Body, Vector, Vertices} from 'matter-js';

import circleVertices from '../../common/circleVertices';
import {nom} from './nom';
import Stage from "../Stage";
import {explosion} from './explosion';

/**
 * Applies an explosion effect - visual effect, terrain destruction, and physics force
 */
const applyExplosion = (
  {
    stage,
    x,
    y,
    nomRadius,
    effectRadius,
    resolution = 32,
    rand = 0,
    force,
    duration = 800,
    color = '#ff4040'
  }: {
    stage: Stage;
    x: number;
    y: number;
    nomRadius: number;
    effectRadius?: number;
    resolution?: number;
    rand: number;
    force: number;
    duration?: number;
    color?: string;
  }) => {
  const origin = {x, y};
  effectRadius ??= nomRadius;

  // Create explosion visuals using our new animation system3
  const explosionEffect = explosion({
    x,
    y,
    stage,
    radius:          nomRadius,
    duration,
    color,
    resolution,
    radiusRand:      rand,
    explosionConfig: {
      // We can configure additional explosion parameters here
      swirlIntensity: 0.5 * Math.PI * (rand + 0.5), // Add some randomness to swirl
      gapSpread:      nomRadius * 2, // Spread gaps over a larger area
      minGapSize:     nomRadius / 4, // Minimum gap size
      maxGapSize:     nomRadius, // Maximum gap size
    }
  });

  // Use the original shape for terrain destruction
  const explosionVertices = explosionEffect.originalShape;

  // Translate the vertices to the explosion origin
  const translatedVertices = Vertices.translate(
    [...explosionVertices], // Clone to avoid modifying the original
    origin,
    1
  );

  // Apply terrain destruction
  nom(stage, translatedVertices);

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