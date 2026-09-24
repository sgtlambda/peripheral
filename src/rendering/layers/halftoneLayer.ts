import {Vector} from 'matter-js';

import Layer from '../Layer';

import Player from '../../Player';
import Stage from '../../logic/Stage';
import {HalftoneSource, HalftoneSurface} from '../halftone/HalftoneSurface';
import {orbField} from '../halftone/field';

/** Ink per kind of entity; each is a single colour, trails included. */
const INK = {
  player: 'rgb(255,86,160)',
  npc:    'rgb(110,200,255)',
  throwable: {
    grenade:       'rgb(255,196,70)',
    plasmaGrenade: 'rgb(176,120,255)',
    drill:         'rgb(214,160,128)',
  } as Record<string, string>,
  fallback: 'rgb(240,240,244)',
};

/** Trail width (gaussian sigma) as a ratio of the collider radius. */
const TRAIL_RATIO = 0.6;

/** Lean into horizontal motion, like a body dragged by its thrust. */
const tiltFor = (velocity: Vector, strength: number, max: number) =>
  Math.min(max, Math.max(-max, velocity.x * strength));

/**
 * Draws the player, NPCs, thrown items and stray items on one shared,
 * world-fixed halftone surface (see `HalftoneSurface`): each is a dot field
 * sampled on the same grid, and anything that moves leaves a dissolving noise
 * trail — which outlives it, so a grenade's trail fades after it explodes.
 *
 * Animation runs on simulation time, so everything slows down with slow motion.
 */
export const halftoneLayer = ({player, stage}: {player: Player; stage: Stage}): Layer => {
  const surface = new HalftoneSurface();
  const maxDot  = surface.maxDot;
  let thrust    = 0;
  let lastTime  = 0;

  return new Layer({
    render(context) {
      const time = stage.simClock.simTime / 1000;
      const dt   = Math.max(0, time - lastTime);
      lastTime   = time;

      // Ease the jetpack throttle so the plume grows and shrinks instead of popping.
      thrust += ((player.keys.up ? 1 : 0) - thrust) * Math.min(1, dt * 10);

      const sources: HalftoneSource[] = [];

      // Player: looks where it aims, hovers, and has a thrust plume.
      {
        const {x, y} = player.position;
        const radius = player.collider.circleRadius ?? 16;
        sources.push({
          key: player, x, y, reach: radius * 3.5, color: INK.player,
          trail: {sigma: radius * TRAIL_RATIO},
          field: orbField({
            x, y, radius, maxDot, time, thrust,
            look: player.aimAngle,
            tilt: tiltFor(player.collider.velocity, 0.05, 0.3),
            bob:  Math.sin(time * 2.2) * (1 - thrust),
          }),
        });
      }

      // NPCs: same orb, a different ink, and they keep an eye on the player.
      stage.npcs.forEach(npc => {
        const {x, y} = npc.position;
        const radius = npc.collider.circleRadius ?? 16;
        sources.push({
          key: npc, x, y, reach: radius * 1.2, color: INK.npc,
          trail: {sigma: radius * TRAIL_RATIO},
          field: orbField({
            x, y, radius, maxDot,
            look: Vector.angle(npc.position, player.position),
            tilt: tiltFor(npc.collider.velocity, 0.05, 0.3),
          }),
        });
      });

      // Thrown items: plain orbs; a fused grenade pulses in time with its blink.
      stage.throwables.forEach(throwable => {
        const {x, y} = throwable.position;
        const radius = throwable.getCollider().circleRadius ?? 8;
        sources.push({
          key: throwable, x, y, reach: radius * 1.2,
          color: INK.throwable[throwable.name] ?? INK.fallback,
          trail: {sigma: radius * TRAIL_RATIO},
          field: orbField({x, y, radius, maxDot, scale: throwable.blinking ? 0.45 : 1}),
        });
      });

      // Stray items: plain orbs in their item colour (labels are drawn by the stage layer).
      stage.strayItems.forEach(item => {
        const {x, y} = item.position;
        const radius = item.getCollider().circleRadius ?? 8;
        sources.push({
          key: item, x, y, reach: radius * 1.2, color: item.itemType.color,
          trail: {sigma: radius * TRAIL_RATIO},
          field: orbField({x, y, radius, maxDot}),
        });
      });

      surface.draw(context, sources, time);
    },
  });
};
