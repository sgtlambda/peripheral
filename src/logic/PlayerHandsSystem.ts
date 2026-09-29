import {StepContext, System} from '../types';

/**
 * The player's hands mirror its active inventory slot: whatever is selected
 * (and not used up) is what the player holds, and so what's drawn in hand.
 * Runs after input, so a drop, pickup or slot switch shows the same step.
 */
export class PlayerHandsSystem implements System {
  step({player, playerState}: StepContext) {
    const slot       = playerState.getActiveSlot();
    player.heldItem  = slot.itemType && slot.amount ? slot.itemType : null;
  }
}
