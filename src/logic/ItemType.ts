import {find} from 'lodash';

import {ItemIntent} from "./ItemIntent";
import Stage from "./Stage";

export type RenderPlayerInteractionPreviewFn = (stage: Stage, context: CanvasRenderingContext2D, x: number, y: number, angle: number) => void;

/**
 * Flat vector art for an item that is drawn as itself (not on the halftone
 * surface): in a holder's hand, aimed, and lying loose in the world.
 */
export type ItemSprite = {
  /**
   * Draw in item space: origin at the grip, +x along the aim, y down. When the
   * holder aims left the caller mirrors y, so the item never hangs upside down.
   */
  draw(context: CanvasRenderingContext2D): void;
  /** Point in item space to centre on when the item lies loose in the world */
  center: {x: number; y: number};
  /** Point in item space where shots leave the item, if it fires any */
  muzzle?: {x: number; y: number};
};

class ItemType {

  public readonly name: string;
  public readonly color: string;
  public readonly availableIntents: ItemIntent<any>[];
  public readonly droppable: boolean;
  public readonly renderPlayerInteractionPreview?: RenderPlayerInteractionPreviewFn;
  /** Art for items drawn as themselves (e.g. a gun), instead of as a halftone orb */
  public readonly sprite?: ItemSprite;

  constructor({
    name,
    color,
    availableIntents = [],
    droppable = true,
    renderPlayerInteractionPreview,
    sprite,
  }: {
    name: string;
    color: string;
    availableIntents?: any[];
    droppable?: boolean;
    renderPlayerInteractionPreview?: RenderPlayerInteractionPreviewFn;
    sprite?: ItemSprite;
  }) {
    this.name = name;
    this.color = color;
    this.availableIntents = availableIntents;
    this.droppable = droppable;
    this.renderPlayerInteractionPreview = renderPlayerInteractionPreview;
    this.sprite = sprite;
  }

  getIntentByType<IntentOptions>(type: Symbol): ItemIntent<IntentOptions> | undefined {
    return find(this.availableIntents, {type});
  }

  getPrimaryIntent() {
    return find(this.availableIntents, {primary: true});
  }
}

export default ItemType;