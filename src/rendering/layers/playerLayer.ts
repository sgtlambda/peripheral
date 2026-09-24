import Layer from '../Layer';

import Player from '../../Player';
import Stage from '../../logic/Stage';
import {PlayerDesign} from '../player/types';

/**
 * Draws the player character with the given design, fed from the live player:
 * collider position and velocity, aim, and the jetpack key as throttle.
 *
 * Animation runs on simulation time, so the character (and anything it leaves
 * behind, like the halftone trail) slows down with slow motion.
 */
export const playerLayer = ({player, stage, design}: {
  player: Player;
  stage: Stage;
  design: PlayerDesign;
}): Layer => {
  let thrust   = 0;
  let lastTime = 0;

  return new Layer({
    render(context) {
      const time = stage.simClock.simTime / 1000;
      const dt   = Math.max(0, time - lastTime);
      lastTime   = time;

      // Ease the throttle so the jet grows and shrinks instead of popping.
      const target = player.keys.up ? 1 : 0;
      thrust += (target - thrust) * Math.min(1, dt * 10);

      design.draw(context, {
        x:        player.position.x,
        y:        player.position.y,
        radius:   player.collider.circleRadius ?? 16,
        aimAngle: player.aimAngle,
        velocity: player.collider.velocity,
        thrust,
        time,
      });
    },
  });
};
