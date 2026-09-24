import {fbm3} from "../../common/noise";
import {DotField, FORCED_GAP} from "./field";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** One thing drawn on the surface this frame. */
export type HalftoneSource = {
  /** Stable identity, so the source's trail follows it across frames (and outlives it) */
  key: unknown;
  /** Centre of the area to sample, in world coordinates */
  x: number;
  y: number;
  /** Half-size of the square around (x, y) that `field` can light */
  reach: number;
  /** Ink for the source's own dots and its trail */
  color: string;
  field: DotField;
  /** Leave a cooling heat trail; `sigma` is its width (gaussian sigma) in px */
  trail?: {sigma: number};
};

export type HalftoneSurfaceOptions = {
  /** Grid spacing in world px */
  pitch?: number;
  /** Seconds for a trail point to cool completely */
  trailLife?: number;
  /** Feature size of the trail noise, in world px */
  noiseScale?: number;
  /** How fast the noise morphs, in noise features per second (0 = static) */
  noiseEvolve?: number;
  /** Largest trail dot, relative to a full dot — trails stay dimmed */
  trailDim?: number;
  seed?: number;
};

type Trail = {color: string; sigma: number; path: {x: number; y: number; t: number}[]};

const cellKey = (i: number, j: number) => (i + 32768) * 65536 + (j + 32768);
const cellI   = (key: number) => Math.floor(key / 65536) - 32768;
const cellJ   = (key: number) => (key % 65536) - 32768;

/**
 * A halftone dot screen fixed to the world, shared by everything drawn on it.
 *
 * Every frame, sources (the player, NPCs, grenades, …) sample their dot fields
 * on the same axis-aligned grid, so nothing carries dots with it: shapes light
 * up whichever grid dots they cover. Moving sources leave a cooling heat trail;
 * an evolving fBm noise field decides which dimmed trail dots that heat
 * reveals, so trails dissolve in organic, terrain-locked patches. A trail
 * outlives its source (a grenade's trail keeps fading after it explodes).
 *
 * Each cell shows the largest dot any source or trail gives it, so bodies
 * blend into their own trails without seams; eyes (`FORCED_GAP`) stay empty.
 */
export class HalftoneSurface {
  readonly pitch: number;
  readonly maxDot: number;
  private readonly trailLife: number;
  private readonly noiseScale: number;
  private readonly noiseEvolve: number;
  private readonly trailDim: number;
  private readonly seed: number;
  private readonly trails = new Map<unknown, Trail>();

  constructor(
    {pitch = 3, trailLife = 1.5, noiseScale = 14, noiseEvolve = 0.3, trailDim = 0.45, seed = 7}: HalftoneSurfaceOptions = {},
  ) {
    this.pitch       = pitch;
    this.maxDot      = pitch * 0.62;
    this.trailLife   = trailLife;
    this.noiseScale  = noiseScale;
    this.noiseEvolve = noiseEvolve;
    this.trailDim    = trailDim;
    this.seed        = seed;
  }

  /** Draw every source (and every still-warm trail) in world coordinates. */
  draw(ctx: CanvasRenderingContext2D, sources: HalftoneSource[], time: number): void {
    const {pitch} = this;

    this.recordTrails(sources, time);

    // Bodies: per cell, the largest dot any source gives it.
    const cells = new Map<number, {size: number; color: string}>();
    const gaps  = new Set<number>();
    for (const source of sources) {
      const i0 = Math.floor((source.x - source.reach) / pitch), i1 = Math.ceil((source.x + source.reach) / pitch);
      const j0 = Math.floor((source.y - source.reach) / pitch), j1 = Math.ceil((source.y + source.reach) / pitch);
      for (let i = i0; i <= i1; i++) {
        for (let j = j0; j <= j1; j++) {
          const size = source.field(i * pitch, j * pitch);
          if (size === 0) continue;
          const key = cellKey(i, j);
          if (size === FORCED_GAP) {
            gaps.add(key);
            continue;
          }
          const cell = cells.get(key);
          if (!cell || size > cell.size) cells.set(key, {size, color: source.color});
        }
      }
    }
    gaps.forEach(key => cells.delete(key));

    // Trails: heat per cell from the hottest trail near it, revealed through noise.
    this.heat(time).forEach(({h, trail}, key) => {
      if (gaps.has(key)) return;
      const n      = this.noiseAt(cellI(key), cellJ(key), time);
      const margin = h - (0.1 + n * 0.85);
      if (margin <= 0) return;
      const size = this.maxDot * this.trailDim * Math.min(1, margin / 0.45);
      const cell = cells.get(key);
      if (!cell || size > cell.size) cells.set(key, {size, color: trail.color});
    });

    // One path per ink: thousands of arcs, a handful of fills.
    const byColor = new Map<string, [number, number, number][]>();
    cells.forEach(({size, color}, key) => {
      if (size <= 0.2) return;
      let list = byColor.get(color);
      if (!list) byColor.set(color, list = []);
      list.push([cellI(key) * pitch, cellJ(key) * pitch, size]);
    });
    byColor.forEach((dots, color) => {
      ctx.beginPath();
      for (const [x, y, s] of dots) {
        ctx.moveTo(x + s, y);
        ctx.arc(x, y, s, 0, Math.PI * 2);
      }
      ctx.fillStyle = color;
      ctx.fill();
    });
  }

  /**
   * Extend each trailed source's path (a point every fraction of its width)
   * and forget points, then whole trails, once they've fully cooled.
   */
  private recordTrails(sources: HalftoneSource[], time: number): void {
    for (const source of sources) {
      if (!source.trail) continue;
      let trail = this.trails.get(source.key);
      if (!trail) this.trails.set(source.key, trail = {color: source.color, sigma: source.trail.sigma, path: []});
      trail.color = source.color;
      trail.sigma = source.trail.sigma;
      const last = trail.path[trail.path.length - 1];
      if (last && time < last.t) trail.path.length = 0; // clock went backwards (reset)
      if (!last || time < last.t || Math.hypot(source.x - last.x, source.y - last.y) > trail.sigma * 0.3) {
        trail.path.push({x: source.x, y: source.y, t: time});
      }
    }
    const current = new Set(sources.map(source => source.key));
    this.trails.forEach((trail, key) => {
      while (trail.path.length && time - trail.path[0].t > this.trailLife) trail.path.shift();
      if (trail.path.length === 0 && !current.has(key)) this.trails.delete(key);
    });
  }

  /** Per cell: the hottest trail point near it — gaussian blobs cooling with age. */
  private heat(time: number): Map<number, {h: number; trail: Trail}> {
    const {pitch} = this;
    const heat = new Map<number, {h: number; trail: Trail}>();
    this.trails.forEach(trail => {
      const {sigma} = trail, extent = sigma * 3, twoSigma2 = 2 * sigma * sigma;
      for (const pt of trail.path) {
        const cool = Math.pow(1 - (time - pt.t) / this.trailLife, 1.5);
        if (cool <= 0) continue;
        const i0 = Math.floor((pt.x - extent) / pitch), i1 = Math.ceil((pt.x + extent) / pitch);
        const j0 = Math.floor((pt.y - extent) / pitch), j1 = Math.ceil((pt.y + extent) / pitch);
        for (let i = i0; i <= i1; i++) {
          for (let j = j0; j <= j1; j++) {
            const dx = i * pitch - pt.x, dy = j * pitch - pt.y;
            const h  = Math.exp(-(dx * dx + dy * dy) / twoSigma2) * cool;
            const key = cellKey(i, j);
            const cur = heat.get(key);
            if (!cur || h > cur.h) heat.set(key, {h, trail});
          }
        }
      }
    });
    return heat;
  }

  /** Trail noise at a cell: a slice through 3D fBm, so the pattern morphs in place over time. */
  private noiseAt(i: number, j: number, time: number): number {
    const {pitch, noiseScale} = this;
    // fBm bunches around 0.5; stretch it so the pattern has real contrast.
    return clamp((fbm3((i * pitch) / noiseScale, (j * pitch) / noiseScale, time * this.noiseEvolve, 3, this.seed) - 0.3) / 0.4, 0, 1);
  }
}
