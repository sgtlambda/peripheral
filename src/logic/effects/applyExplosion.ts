import {Body, Vector, Vertices} from 'matter-js';

import {nom} from './nom';
import Stage from "../Stage";
import {explosion} from './explosion';
import {ColorStop} from '../../common/colorGradient';
import {SoundEffectID} from '../../data/soundEffects';

/**
 * Applies an explosion: terrain destruction, physics force, and the animated
 * visual effect. Presentation side effects (camera shake, audio, slow motion)
 * are not triggered here; an `explosion` event is emitted on the stage bus
 * and handled by subscribers (see `wireStageEffects`).
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
    shakeDelay = 0,
    gradient,
    sound,
    slowMo,
  }: {
    stage: Stage;
    x: number;
    y: number;
    nomRadius: number;
    effectRadius?: number;
    resolution?: number;
    rand?: number;
    force: number;
    duration?: number;
    shakeDelay?: number;
    gradient: ColorStop[];
    sound?: SoundEffectID;
    slowMo?: { multiplier: number; duration: number };
  }) => {
  const origin = {x, y};
  effectRadius ??= nomRadius;

  stage.bus.emit('explosion', {
    x, y,
    radius: effectRadius,
    force,
    shakeDelay,
    sound,
    slowMo,
  });

  // Create explosion visuals using our new animation system
  const explosionEffect = explosion({
    x,
    y,
    stage,
    radius: nomRadius,
    duration,
    colorGradient: gradient,
    resolution,
    radiusRand: rand,
    explosionConfig: {
      // We can configure additional explosion parameters here
      gapCount: Math.floor(nomRadius / 10), // Scale gaps with explosion size
      swirlIntensity: 0.5 * Math.PI * (rand + 0.5), // Add some randomness to swirl
      // The explosion shape determines terrain destruction, so its randomness
      // must be seeded to keep the simulation replayable
      random: stage.rng.next,
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

  // TODO also affect the player, and inflict damage on both the player and NPCs
  const affectedBodies = stage.getDynamicBodies();

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
