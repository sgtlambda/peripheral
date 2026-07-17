import {Vector} from 'matter-js';

import StrayItem from './StrayItem';
import ItemType from './ItemType';
import {ItemIntent} from './ItemIntent';
import {ActionContext} from '../types';
import {processPrompt} from './language';
import {getNearbyNpc, getNearbyStrayItem} from './proximity';
import {BuildIntentOptions, INTENT_BUILD} from '../data/intents/buildIntent';
import {INTENT_THROW, ThrowIntentOptions} from '../data/intents/throwIntent';
import {ApplyIntentOptions, INTENT_APPLY} from '../data/intents/applyIntent';
import {PLAYER_AIM_OFFSET} from '../data/constants';

export const ITEM_DROP_COOLDOWN_MS = 1000;

export const ITEM_DROP_FORCE = 5;

export const ITEM_THROW_FORCE = 12;

/**
 * A discrete player action that can be queued from input handlers.
 * The values map to methods on `PlayerActions`.
 */
export type InteractionCommand =
  | 'dropItem'
  | 'buildItem'
  | 'takeItem'
  | 'throwItem'
  | 'applyItem'
  | 'interactWithNpc';

/**
 * The things the player can do to the world: pick up, drop, build, throw,
 * fire, talk. Pure action logic; input handling and pacing live in
 * `PlayerInputSystem`.
 * TODO item-specific interactions should be implemented at the corresponding item type
 */
export default class PlayerActions {

  constructor(private readonly ctx: ActionContext) {
  }

  run(command: InteractionCommand) {
    this[command]();
  }

  takeItem() {
    const {stage, player} = this.ctx;
    const pickup          = getNearbyStrayItem(stage, player.position);
    if (!pickup) return;
    this.pickup(pickup);
  }

  interactWithNpc() {
    const {stage, player} = this.ctx;
    const npc             = getNearbyNpc(stage, player.position);
    if (!npc) return;
    const input = window.prompt(`Say something to ${npc.name}...`);
    if (input) {
      processPrompt(npc, input).catch(error => console.error('NPC interaction failed:', error));
    }
  }

  dropItem() {
    const {stage, player, playerState} = this.ctx;
    const itemType                     = this.getActiveItemType();
    if (itemType && itemType.droppable) {
      const dropped  = playerState.removeFromInventory()!;
      const position = {...player.position};
      const cooldown = ITEM_DROP_COOLDOWN_MS;
      const velocity = player.getAimVector(ITEM_DROP_FORCE);
      stage.addStrayItem(new StrayItem({itemType: dropped, ...position, velocity, cooldown}));
    }
  }

  protected getActiveItemType(): ItemType | undefined {
    const slot = this.ctx.playerState.getActiveSlot();
    if (!slot.itemType || !slot.amount) return undefined;
    return slot.itemType;
  }

  getActiveItemIntentOf<IntentOptions>(type: Symbol): ItemIntent<IntentOptions> | undefined {
    const itemType = this.getActiveItemType();
    if (!itemType) return undefined;
    return itemType.getIntentByType(type);
  }

  buildItem() {
    const {stage, player, playerState} = this.ctx;
    const buildIntent                  = this.getActiveItemIntentOf<BuildIntentOptions>(INTENT_BUILD);
    if (!buildIntent) return;
    if (playerState.removeFromInventory(buildIntent.options.requires)) {
      const position = player.getAimPosition(PLAYER_AIM_OFFSET + 16); // TODO this should be in the item definition, or at least not hardcoded
      stage.addBuilding(buildIntent.options.buildable.toBuilding({
        angle: player.aimAngle,
        ...position,
      }));
    }
  }

  applyItem() {
    const applyIntent = this.getActiveItemIntentOf<ApplyIntentOptions>(INTENT_APPLY);
    if (!applyIntent) return;
    applyIntent.options.apply(this.ctx.player, this.ctx.stage);
  }

  throwItem() {
    const {stage, player, playerState} = this.ctx;
    const throwIntent                  = this.getActiveItemIntentOf<ThrowIntentOptions>(INTENT_THROW);
    if (!throwIntent) return;
    if (playerState.removeFromInventory(1)) {

      const {make, throwableSpawnOffset = 0} = throwIntent.options;

      const position = Vector.add(
        {...player.position},
        Vector.rotate({x: throwableSpawnOffset, y: 0}, player.aimAngle)
      );

      const velocity = player.getAimVector(ITEM_THROW_FORCE);

      stage.addThrowable(make({...position, velocity}));
    }
  }

  triggerPrimary() {
    const itemType = this.getActiveItemType();
    if (!itemType) return;
    const primaryIntent = itemType.getPrimaryIntent();

    // TODO below should be handled by the item / item type definition itself
    if (!primaryIntent) return;
    if (primaryIntent.type === INTENT_BUILD) return this.buildItem();
    if (primaryIntent.type === INTENT_THROW) return this.throwItem();
    if (primaryIntent.type === INTENT_APPLY) return this.applyItem();

    else if (primaryIntent.trigger) return primaryIntent.trigger(this.ctx);
  }

  triggerContinuous() {
    const itemType = this.getActiveItemType();
    if (!itemType) return;
    const primaryIntent = itemType.getPrimaryIntent();
    if (primaryIntent?.continuous) this.triggerPrimary();
  }

  pickup(strayItem: StrayItem) {
    const {stage, playerState} = this.ctx;
    const added                = playerState.addToInventory({itemType: strayItem.itemType});
    if (added) stage.removeStrayItem(strayItem);
  }
}
