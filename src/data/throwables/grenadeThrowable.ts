import {Vector} from "matter-js";

import Throwable from '../../logic/Throwable';
import applyExplosion from '../../logic/effects/applyExplosion';

export default ({x, y, velocity}: {
  x: number;
  y: number;
  velocity?: Vector;
}) => new Throwable({
  x,
  y,
  velocity,
  name:    'grenade',
  radius:  8,
  density: .004,
  ttl:     1500,
  trigger({position, interactionHandler}) {
    applyExplosion({
      ...position,
      stage:  interactionHandler.stage,
      radius: 120,
      force:  5e-2,
      rand:   .2,
    });
  }
});