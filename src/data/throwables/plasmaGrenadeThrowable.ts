import {Vector} from "matter-js";

import Throwable from '../../logic/Throwable';
import applyExplosion from '../../logic/effects/applyExplosion';
import {plasma} from '../../gradients';
import {SoundEffectID} from "../soundEffects";

export default ({x, y, velocity}: {
  x: number;
  y: number;
  velocity?: Vector;
}) => new Throwable({
  name: 'plasmaGrenade', x, y, radius: 20, velocity, ttl: 3000,
  trigger({position, ctx}) {
    applyExplosion({
      stage:        ctx.stage, ...position,
      nomRadius:    200,
      effectRadius: 300,
      force:        1.5e-1,
      rand:         .1,
      gradient:     plasma,
      duration:     2800,
      shakeDelay:   800,
      sound:        SoundEffectID.EXPLOSION_LARGE,
      slowMo:       {multiplier: .01, duration: 800},
    });
  }
});
