import {Vector} from "matter-js";
import {FlameShape} from "./butaneFlame";

/** Traces a closed polygon path onto the context. */
function tracePath(ctx: CanvasRenderingContext2D, path: Vector[], ox: number, oy: number): void {
  if (path.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(path[0].x + ox, path[0].y + oy);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x + ox, path[i].y + oy);
  }
  ctx.closePath();
}

/** Axis-aligned bounding box of a set of polygons. */
function boundsOf(polys: Vector[][]): {minX: number; minY: number; maxX: number; maxY: number} | null {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const poly of polys) {
    for (const v of poly) {
      if (v.x < minX) minX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.x > maxX) maxX = v.x;
      if (v.y > maxY) maxY = v.y;
    }
  }
  return Number.isFinite(minX) ? {minX, minY, maxX, maxY} : null;
}

/**
 * Renders a butane flame shape by filling its body lenses in a single solid
 * colour, then boolean-subtracting the hole lenses (`destination-out`), the same
 * way the explosion punches out its holes. No gradients — the flame is one flat
 * colour, matching the rest of the game's rendering.
 *
 * The compositing happens on a temp canvas sized to the flame's bounding box,
 * which is then blitted at (originX, originY). Because the temp canvas is local
 * to the flame (not the full screen), this behaves correctly whether the target
 * context is untransformed (sandbox) or carries a camera transform (in-game).
 */
export function renderFlame(
  ctx: CanvasRenderingContext2D,
  shape: FlameShape,
  options: {
    color: string;
    originX?: number;
    originY?: number;
    /** Draw the lens outlines instead of filling (useful for debugging) */
    stroke?: boolean;
  },
): void {
  const {color, originX = 0, originY = 0, stroke = false} = options;

  if (shape.body.length === 0) return;

  const bounds = boundsOf([...shape.body, ...shape.holes]);
  if (!bounds) return;

  const margin = 2;
  const ox = -bounds.minX + margin;
  const oy = -bounds.minY + margin;
  const w  = Math.ceil(bounds.maxX - bounds.minX) + margin * 2;
  const h  = Math.ceil(bounds.maxY - bounds.minY) + margin * 2;
  if (w <= 0 || h <= 0) return;

  const temp = document.createElement('canvas');
  temp.width  = w;
  temp.height = h;
  const tctx  = temp.getContext('2d');
  if (!tctx) return;

  if (stroke) {
    tctx.strokeStyle = color;
    tctx.lineWidth   = 1;
    for (const lens of shape.body)  { tracePath(tctx, lens, ox, oy); tctx.stroke(); }
    tctx.strokeStyle = 'red';
    for (const lens of shape.holes) { tracePath(tctx, lens, ox, oy); tctx.stroke(); }
  } else {
    // Fill the body lenses as one solid union...
    tctx.fillStyle = color;
    for (const lens of shape.body) { tracePath(tctx, lens, ox, oy); tctx.fill(); }

    // ...then boolean-subtract the hole lenses.
    tctx.globalCompositeOperation = 'destination-out';
    for (const lens of shape.holes) { tracePath(tctx, lens, ox, oy); tctx.fill(); }
    tctx.globalCompositeOperation = 'source-over';
  }

  // Blit so the flame's model origin lands at (originX, originY).
  ctx.drawImage(temp, originX - ox, originY - oy);
}
