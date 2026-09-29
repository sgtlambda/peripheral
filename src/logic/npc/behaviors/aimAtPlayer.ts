import {Vector} from 'matter-js';

import {NpcBehavior} from '../NpcBehavior';

/** Signed smallest angle from `a` to `b`, in (-π, π]. */
const angleDelta = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

/**
 * Keep the NPC's aim (and so its held item and gaze) on the player, turning
 * at most `turnSpeed` radians per second so it tracks rather than snaps.
 * Aiming only: it never fires.
 */
export const aimAtPlayer = ({turnSpeed = 5}: {turnSpeed?: number} = {}): NpcBehavior => ({
  name: 'aimAtPlayer',
  step(npc, {player, event}) {
    const target = Vector.angle(npc.position, player.position);
    const maxTurn = turnSpeed * (event.delta / 1000);
    const delta   = angleDelta(npc.aimAngle, target);
    const turned  = npc.aimAngle + Math.max(-maxTurn, Math.min(maxTurn, delta));
    npc.aimAngle  = Math.atan2(Math.sin(turned), Math.cos(turned)); // keep it in (-π, π]
  },
});
