import {Vector} from 'matter-js';

import circle from '../common/circle';
import ItemType from "../logic/ItemType";

/**
 * Draws an item: its colour ring plus name (and amount) labels. Pass
 * `icon: false` to draw only the labels, e.g. for items in the world, whose
 * body is drawn on the halftone surface.
 */
export const renderItem = (context: CanvasRenderingContext2D, item: {
  position: Vector;
  itemType: ItemType;
  amount?: number;
}, size: number = 10, {icon = true}: {icon?: boolean} = {}): void => {
  if (icon) {
    context.strokeStyle = item.itemType.color;
    circle(context, item.position.x, item.position.y, size, false, true);
  }

  context.font         = '10px monospace';
  context.fillStyle    = 'white';
  context.textAlign    = 'center';
  context.textBaseline = 'top';
  context.fillText(item.itemType.name, item.position.x, item.position.y + size / 2 + 6);

  if (item.amount) {
    context.fillStyle    = 'white';
    context.font         = '11px monospace';
    context.textBaseline = 'middle';
    context.fillText(item.amount.toString(), item.position.x, item.position.y);
  }
}; 