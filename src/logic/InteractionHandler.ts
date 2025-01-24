import {Engine, Events, Vector} from 'matter-js';
import StrayItem from './StrayItem';

import {BuildIntentOptions, INTENT_BUILD} from '../data/intents/buildIntent';
import {INTENT_THROW, ThrowIntentOptions} from '../data/intents/throwIntent';
import {ApplyIntentOptions, INTENT_APPLY} from '../data/intents/applyIntent';
import Player from "../Player";
import Stage from "./Stage";
import PlayerState from "./PlayerState";
import {NPC} from "../NPC";
import {processPrompt} from "./language";
import {EngineStep} from "../engineStep";

import {EngineComponent} from "../types";
import {ItemIntent} from "./ItemIntent";
import ItemType from "./ItemType";
import {PLAYER_AIM_OFFSET} from "../data/constants";

export const ITEM_DROP_COOLDOWN_MS = 1000;

export const ITEM_PICKUP_DISTANCE = 30;

export const ITEM_DROP_FORCE = 5;

export const ITEM_THROW_FORCE = 12;

export const NPC_INTERACTION_DISTANCE = 50;

/**
 * Takes care of interactions between the player and the world
 * TODO item-specific interactions should be implemented at the corresponding item type
 */
class InteractionHandler implements EngineComponent {

  readonly stage: Stage;
  readonly player: Player;
  readonly playerState: PlayerState;

  _beforeUpdate: any; // TODO

  constructor(
    {
      stage,
      player,
      playerState,
    }: {
      stage: Stage,
      player: Player,
      playerState: PlayerState,
    },
  ) {
    this.stage       = stage;
    this.player      = player;
    this.playerState = playerState;
  }

  getNearbyThing<T extends { position: Vector }>(
    candidates: T[],
    distance: number,
    isEligible?: (candidate: T) => boolean,
  ) {
    const playerPos = this.player.position;
    let result      = null;
    let minDist     = -1;
    candidates.forEach(candidate => {
      if (isEligible && !isEligible(candidate)) return;
      const position = candidate.position;
      const dist     = Vector.magnitude({
        x: Math.abs(position.x - playerPos.x),
        y: Math.abs(position.y - playerPos.y)
      });
      if (dist < distance) {
        if (dist < minDist || minDist === -1) {
          result  = candidate;
          minDist = dist;
        }
      }
    });
    return result;
  }

  getNearbyStrayItem(): StrayItem | null {
    return this.getNearbyThing(this.stage.strayItems, ITEM_PICKUP_DISTANCE, strayItem => strayItem.isReady());
  }

  getNearbyNpc(): NPC | null {
    return this.getNearbyThing(this.stage.npcs, NPC_INTERACTION_DISTANCE);
  }

  updatePlayerInteractionPotentials() {
    this.playerState.potentialPickup         = this.getNearbyStrayItem();
    this.playerState.potentialInteractiveNpc = this.getNearbyNpc();
  }

  beforeUpdate(event: EngineStep) {
    this.stage.throwables.forEach(throwable => throwable.step(event, this));
    this.stage.strayItems.forEach(strayItem => strayItem.step(event, this));
    this.stage.flashEffects.forEach(strayItem => strayItem.step(event, this));
    this.updatePlayerInteractionPotentials();
  }

  takeItem() {
    const pickup = this.getNearbyStrayItem();
    if (!pickup) return;
    this.pickup(pickup);
    this.updatePlayerInteractionPotentials();
  }

  interactWithNpc() {
    const npc = this.getNearbyNpc();
    if (!npc) return;
    const input = window.prompt(`Say something to ${npc.name}...`);
    if (input) {
      const result = processPrompt(npc, input);
    }
  }

  dropItem() {
    const itemType = this.getActiveItemType();
    if (itemType && itemType.droppable) {
      const dropped  = this.playerState.removeFromInventory()!;
      const position = {...this.player.position};
      const cooldown = ITEM_DROP_COOLDOWN_MS;
      const velocity = this.player.getAimVector(ITEM_DROP_FORCE);
      this.stage.addStrayItem(new StrayItem({itemType: dropped, ...position, velocity, cooldown}));
    }
  }

  protected getActiveItemType(): ItemType | undefined {
    const slot = this.playerState.getActiveSlot();
    if (!slot.itemType || !slot.amount) return undefined;
    return slot.itemType;
  }

  getActiveItemIntentOf<IntentOptions>(type: Symbol): ItemIntent<IntentOptions> | undefined {
    const itemType = this.getActiveItemType();
    if (!itemType) return undefined;
    return itemType.getIntentByType(type);
  }

  buildItem() {
    const buildIntent = this.getActiveItemIntentOf<BuildIntentOptions>(INTENT_BUILD);
    if (!buildIntent) return;
    if (this.playerState.removeFromInventory(buildIntent.options.requires)) {
      const position = this.player.getAimPosition(PLAYER_AIM_OFFSET + 16); // TODO this should be in the item definition, or at least not hardcoded
      this.stage.addBuilding(buildIntent.options.buildable.toBuilding({
        angle: this.player.aimAngle,
        ...position,
      }));
    }
  }

  applyItem() {
    const applyIntent = this.getActiveItemIntentOf<ApplyIntentOptions>(INTENT_APPLY);
    applyIntent!.options.apply(this.player, this.stage);
  }

  throwItem() {
    const throwIntent = this.getActiveItemIntentOf<ThrowIntentOptions>(INTENT_THROW);
    if (!throwIntent) return;
    if (this.playerState.removeFromInventory(1)) {

      const {make, throwableSpawnOffset = 0} = throwIntent.options;

      const position = Vector.add(
        {...this.player.position},
        Vector.rotate({x: throwableSpawnOffset, y: 0}, this.player.aimAngle)
      );

      const velocity = this.player.getAimVector(ITEM_THROW_FORCE);

      this.stage.addThrowable(make({...position, velocity}));
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

    else if (primaryIntent.trigger) return primaryIntent.trigger(this);
  }

  triggerContinuous() {
    const itemType = this.getActiveItemType();
    if (!itemType) return;
    const primaryIntent = itemType.getPrimaryIntent();
    if (primaryIntent?.continuous) this.triggerPrimary();
  }

  pickup(strayItem: StrayItem) {
    const added = this.playerState.addToInventory({itemType: strayItem.itemType});
    if (added) this.stage.removeStrayItem(strayItem);
  }

  attach(engine: Engine) {
    this._beforeUpdate = (event: EngineStep) => this.beforeUpdate(event);
    Events.on(engine, 'beforeUpdate', this._beforeUpdate);
    return this;
  }

  detach(engine: Engine) {
    if (this._beforeUpdate) Events.off(engine, 'beforeUpdate', this._beforeUpdate);
    this._beforeUpdate = null;
  }
}

export default InteractionHandler;