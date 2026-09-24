import {flameTemplates} from "../../common/flameTemplates";
import {PlayerRenderState} from "./types";

/** Shared drawing helpers for player designs: faceted shapes, strokes and negative-space cuts. */

export type Pt = [number, number];

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const template = (name: string) => flameTemplates.find(t => t.name === name)!;

export function tracePoly(ctx: CanvasRenderingContext2D, pts: Pt[]): void {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

export function poly(ctx: CanvasRenderingContext2D, pts: Pt[], fill: string): void {
  tracePoly(ctx, pts);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function segment(
  ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number, color: string,
): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth   = width;
  ctx.lineCap     = "round";
  ctx.strokeStyle = color;
  ctx.stroke();
}

/**
 * Negative space: erase from the design's own layer (see `withLayer`), so
 * detail comes from holes rather than extra colours — the same trick the flame
 * and explosion use.
 */
export function cut(ctx: CanvasRenderingContext2D, pts: Pt[]): void {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  poly(ctx, pts, "#000");
  ctx.restore();
}

export function cutSegment(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number): void {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  segment(ctx, x1, y1, x2, y2, width, "#000");
  ctx.restore();
}

/** A faceted ellipse: `sides` vertices, first one pointing straight up. */
export function ngon(cx: number, cy: number, rx: number, ry: number, sides: number, rotation = 0): Pt[] {
  return Array.from({length: sides}, (_, i) => {
    const a = rotation - Math.PI / 2 + (i / sides) * Math.PI * 2;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as Pt;
  });
}

/** Lean into horizontal motion, like a hovering body dragged by its thrust. */
export const tiltFor = ({velocity}: PlayerRenderState, strength: number, max: number) =>
  clamp(velocity.x * strength, -max, max);

/**
 * Draw a design into its own offscreen layer centred on the player, then blit
 * it. Cutouts can then erase freely without punching through the scene behind.
 * The layer is sized in device pixels, so zoomed views stay crisp.
 */
export function createLayer() {
  let canvas: HTMLCanvasElement | null = null;

  return (ctx: CanvasRenderingContext2D, state: PlayerRenderState, draw: (layer: CanvasRenderingContext2D) => void) => {
    const m    = ctx.getTransform();
    const s    = Math.max(1, Math.hypot(m.a, m.b));
    const half = state.radius * 4;
    const px   = Math.ceil(half * 2 * s);

    if (!canvas) canvas = document.createElement("canvas");
    if (canvas.width !== px) canvas.width = canvas.height = px;
    const layer = canvas.getContext("2d")!;
    layer.setTransform(1, 0, 0, 1, 0, 0);
    layer.clearRect(0, 0, px, px);
    layer.setTransform(s, 0, 0, s, px / 2, px / 2);
    draw(layer);

    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.scale(1 / s, 1 / s);
    ctx.drawImage(canvas, -px / 2, -px / 2);
    ctx.restore();
  };
}

/**
 * A lens ("vesica") polygon — the flame's own primitive: pointed at both tips,
 * `halfLen` along `angle`, bulging to `halfWidth` in the middle.
 */
export function lens(cx: number, cy: number, halfLen: number, halfWidth: number, angle: number, resolution = 4): Pt[] {
  const along: Pt = [Math.cos(angle), Math.sin(angle)];
  const perp: Pt  = [-along[1], along[0]];
  const pts: Pt[] = [];
  const push = (u: number, side: number) => {
    const w = side * halfWidth * (1 - u * u);
    pts.push([cx + along[0] * u * halfLen + perp[0] * w, cy + along[1] * u * halfLen + perp[1] * w]);
  };
  for (let i = 0; i <= resolution; i++) push(-1 + (2 * i) / resolution, 1);
  for (let i = resolution - 1; i >= 1; i--) push(-1 + (2 * i) / resolution, -1);
  return pts;
}

/** A true (smooth) filled circle. */
export function disc(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, fill: string): void {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, radius), 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}
