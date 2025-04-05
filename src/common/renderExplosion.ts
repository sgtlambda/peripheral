import {Vector} from "matter-js";

/**
 * Renders explosion paths to a canvas context
 */
export function renderExplosion(
  ctx: CanvasRenderingContext2D,
  explosionPaths: Vector[][],
  options: {
    fillStyle?: string;
    centerX?: number;
    centerY?: number;
  } = {},
): void {
  // If no paths or empty main path, nothing to render
  if (explosionPaths.length === 0 || explosionPaths[0].length === 0) {
    return;
  }

  const {fillStyle = 'white', centerX = 0, centerY = 0} = options;

  // Create a separate temporary canvas for our shape with holes
  const tempCanvas  = document.createElement('canvas');
  tempCanvas.width  = ctx.canvas.width;
  tempCanvas.height = ctx.canvas.height;
  const tempCtx     = tempCanvas.getContext('2d');

  if (!tempCtx) {
    return;
  }

  tempCtx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

  tempCtx.save();

  // I don't know why this is necessary, but it is
  tempCtx.translate(-centerX, -centerY);

  // Draw the main path (first path in the array)
  const mainPath    = explosionPaths[0];
  tempCtx.fillStyle = fillStyle;
  tempCtx.beginPath();
  tempCtx.moveTo(mainPath[0].x, mainPath[0].y);
  for (let i = 1; i < mainPath.length; i++) {
    tempCtx.lineTo(mainPath[i].x, mainPath[i].y);
  }
  tempCtx.closePath();
  tempCtx.fill();

  tempCtx.restore();

  // Cut out holes (remaining paths)
  tempCtx.globalCompositeOperation = "destination-out";

  for (let pathIndex = 1; pathIndex < explosionPaths.length; pathIndex++) {
    const path = explosionPaths[pathIndex];
    if (!path.length) continue;

    tempCtx.beginPath();
    tempCtx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      tempCtx.lineTo(path[i].x, path[i].y);
    }
    tempCtx.closePath();
    tempCtx.fill();
  }

  // Reset composite operation
  tempCtx.globalCompositeOperation = "source-over";

  // Draw the temp canvas to the main canvas
  ctx.drawImage(tempCanvas, centerX - ctx.canvas.width / 2, centerY - ctx.canvas.height / 2);
}