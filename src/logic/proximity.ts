import {Vector} from 'matter-js';

import Stage from './Stage';
import StrayItem from './StrayItem';
import {NPC} from '../NPC';
import {StepContext, System} from '../types';

export const ITEM_PICKUP_DISTANCE = 30;

export const NPC_INTERACTION_DISTANCE = 80;

/**
 * Find the closest candidate within `distance` of `origin`, if any.
 */
export function getNearbyThing<T extends { position: Vector }>(
  origin: Vector,
  candidates: T[],
  distance: number,
  isEligible?: (candidate: T) => boolean,
): T | null {
  let result: T | null = null;
  let minDist          = -1;
  candidates.forEach(candidate => {
    if (isEligible && !isEligible(candidate)) return;
    const dist = Vector.magnitude(Vector.sub(candidate.position, origin));
    if (dist < distance) {
      if (dist < minDist || minDist === -1) {
        result  = candidate;
        minDist = dist;
      }
    }
  });
  return result;
}

export const getNearbyStrayItem = (stage: Stage, origin: Vector): StrayItem | null =>
  getNearbyThing(origin, stage.strayItems, ITEM_PICKUP_DISTANCE, strayItem => strayItem.isReady());

export const getNearbyNpc = (stage: Stage, origin: Vector): NPC | null =>
  getNearbyThing(origin, stage.npcs, NPC_INTERACTION_DISTANCE);

/**
 * Keeps `playerState.potentialPickup` / `potentialInteractiveNpc` up to date.
 * Runs after the stage has stepped so the potentials reflect this frame.
 */
export class InteractionPotentialsSystem implements System {
  step({stage, player, playerState}: StepContext) {
    playerState.potentialPickup         = getNearbyStrayItem(stage, player.position);
    playerState.potentialInteractiveNpc = getNearbyNpc(stage, player.position);
  }
}
