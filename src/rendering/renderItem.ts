import circle from '../common/circle';
import StrayItem from "../logic/StrayItem";

export const renderItem = (context: CanvasRenderingContext2D, item: StrayItem & {
  amount?: number; // To account for improvised structure at `src/rendering/layers/uiLayers.js:27`
}, size: number = 10): void => {
  context.strokeStyle = item.itemType.color;
  circle(context, item.position.x, item.position.y, size, false, true);

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