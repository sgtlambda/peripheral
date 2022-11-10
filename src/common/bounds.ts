import {Bounds, Vector} from "matter-js";

export const boundsWidth  = (bounds: Bounds) => bounds.max.x - bounds.min.x;
export const boundsHeight = (bounds: Bounds) => bounds.max.y - bounds.min.y;

/**
 * Create a new Bounds instance with the same center as the
 * given (current) `bounds` with the specified dimensions
 */
export const resizeBoundsAroundCenter = (bounds: Bounds, width: number, height: number): Bounds => {
  const currentWidth      = boundsWidth(bounds);
  const currentHeight     = boundsHeight(bounds);
  const newOrigin: Vector = {
    x: bounds.min.x + (currentWidth / 2) - (width / 2),
    y: bounds.min.y + (currentHeight / 2) - (height / 2),
  };
  return {
    min: newOrigin,
    max: {
      x: newOrigin.x + width,
      y: newOrigin.y + height,
    },
  };
};