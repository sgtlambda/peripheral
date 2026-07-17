import {Vector} from "matter-js";

import Throwable from '../../logic/Throwable';
import applyExplosion from '../../logic/effects/applyExplosion';
import {fire} from "../../gradients";
import {SoundEffectID} from "../soundEffects";

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
  trigger({position, ctx}) {
    applyExplosion({
      ...position,
      stage:        ctx.stage,
      nomRadius:    90,
      effectRadius: 120,
      duration:     1500,
      force:        5e-2,
      rand:         .2,
      gradient:     fire,
      sound:        SoundEffectID.EXPLOSION_SMALL,
    });
  }
});
