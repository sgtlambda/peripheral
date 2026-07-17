export type CornerRadii = {
  tl?: number;
  tr?: number;
  br?: number;
  bl?: number;
};

/**
 * https://stackoverflow.com/a/3368118/700144
 * Draws a rounded rectangle using the current state of the canvas.
 * @param ctx The canvas rendering context
 * @param x The top left x coordinate
 * @param y The top left y coordinate
 * @param width The width of the rectangle
 * @param height The height of the rectangle
 * @param radius The corner radius; a number applies to all corners, an object
 *               can specify different radii per corner (default: 5)
 * @param fill Whether to fill the rectangle (default: false)
 * @param stroke Whether to stroke the rectangle (default: true)
 */
export default function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | CornerRadii = 5,
  fill: boolean                = false,
  stroke: boolean              = true,
) {
  const radii: Required<CornerRadii> = typeof radius === 'number'
    ? {tl: radius, tr: radius, br: radius, bl: radius}
    : {tl: radius.tl ?? 0, tr: radius.tr ?? 0, br: radius.br ?? 0, bl: radius.bl ?? 0};

  ctx.beginPath();
  ctx.moveTo(x + radii.tl, y);
  ctx.lineTo(x + width - radii.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radii.tr);
  ctx.lineTo(x + width, y + height - radii.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radii.br, y + height);
  ctx.lineTo(x + radii.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radii.bl);
  ctx.lineTo(x, y + radii.tl);
  ctx.quadraticCurveTo(x, y, x + radii.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
