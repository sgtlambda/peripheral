import {Body, Vector} from 'matter-js';

import {NpcBehavior} from '../NpcBehavior';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export type NervousOptions = {
  /** The NPC starts fidgeting once the player is closer than this, in px */
  triggerDistance?: number;
  /** At or inside this distance the NPC is as jumpy as it gets */
  panicDistance?: number;
  /** How far either side of its spot the NPC may shuffle, in px */
  range?: number;
  /** Top shuffling speed at full nervousness, in px per step */
  maxSpeed?: number;
  /** Push applied while shuffling (compare the player's move force of 0.001) */
  force?: number;
};

/**
 * Shuffle about nervously when the player comes close: the NPC keeps picking
 * new spots near where it stood — biased away from the player, further and
 * more often the closer the player gets — and walks over to them. Once the
 * player backs off it settles back onto its original spot.
 *
 * Movement only: combine with e.g. `aimAtPlayer()` for a jumpy, armed guard.
 */
export const nervous = (
  {triggerDistance = 220, panicDistance = 70, range = 40, maxSpeed = 1.6, force = 0.0008}: NervousOptions = {},
): NpcBehavior => {
  /** The spot the NPC settles on when calm: where it stood when first stepped */
  let home: number | undefined;
  let target = 0;
  /** Sim ms until the next shuffle */
  let nextShuffle = 0;

  return {
    name: 'nervous',
    step(npc, {player, stage, event}) {
      const {x} = npc.position;
      if (home === undefined) target = home = x;

      const distance    = Vector.magnitude(Vector.sub(player.position, npc.position));
      const nervousness = clamp((triggerDistance - distance) / (triggerDistance - panicDistance), 0, 1);

      if (nervousness > 0) {
        nextShuffle -= event.delta;
        if (nextShuffle <= 0) {
          const away = player.position.x < x ? 1 : -1;
          target = home
            + away * range * 0.5 * nervousness
            + stage.rng.range(-1, 1) * range * nervousness;
          // Twitchier when the player is right there.
          nextShuffle = (900 - 650 * nervousness) * stage.rng.range(0.6, 1.4);
        }
      } else {
        target      = home;
        nextShuffle = 0;
      }

      // Walk toward the target: a capped push, with friction eased off while
      // moving (like the player's) so the NPC slides instead of sticking.
      const dx       = target - x;
      const vx       = npc.collider.velocity.x;
      const speedCap = maxSpeed * (nervousness > 0 ? 0.4 + 0.6 * nervousness : 0.4);
      const moving   = Math.abs(dx) > 2;
      if (moving && (Math.abs(vx) < speedCap || Math.sign(vx) !== Math.sign(dx))) {
        Body.applyForce(npc.collider, npc.position, {x: Math.sign(dx) * force * Math.min(1, Math.abs(dx) / 10), y: 0});
      }
      npc.collider.friction = moving ? 0.0015 : npc.friction;
    },
  };
};
