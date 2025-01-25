import {find} from 'lodash';

import {ItemIntent} from "./ItemIntent";

class ItemType {

  public readonly name: string;
  public readonly color: string;
  public readonly availableIntents: ItemIntent<any>[];
  public readonly droppable: boolean;
  public readonly renderPlayerInteractionPreview?: (context: CanvasRenderingContext2D, x: number, y: number, angle: number) => void;

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
    renderPlayerInteractionPreview?: (context: CanvasRenderingContext2D, x: number, y: number, angle: number) => void;
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