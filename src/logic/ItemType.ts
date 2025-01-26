import {find} from 'lodash';

import {ItemIntent} from "./ItemIntent";
import Stage from "./Stage";

export type RenderPlayerInteractionPreviewFn = (stage: Stage, context: CanvasRenderingContext2D, x: number, y: number, angle: number) => void;

class ItemType {

  public readonly name: string;
  public readonly color: string;
  public readonly availableIntents: ItemIntent<any>[];
  public readonly droppable: boolean;
  public readonly renderPlayerInteractionPreview?: RenderPlayerInteractionPreviewFn;

  constructor({
    name,
    color,
    availableIntents = [],
    droppable = true,
    renderPlayerInteractionPreview
  }: {
    name: string;
    color: string;
    availableIntents?: any[];
    droppable?: boolean;
    renderPlayerInteractionPreview?: RenderPlayerInteractionPreviewFn;
  }) {
    this.name = name;
    this.color = color;
    this.availableIntents = availableIntents;
    this.droppable = droppable;
    this.renderPlayerInteractionPreview = renderPlayerInteractionPreview;
  }

  getIntentByType<IntentOptions>(type: Symbol): ItemIntent<IntentOptions> | undefined {
    return find(this.availableIntents, {type});
  }

  getPrimaryIntent() {
    return find(this.availableIntents, {primary: true});
  }
}

export default ItemType;