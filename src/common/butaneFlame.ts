import {Vector} from "matter-js";
import {times} from "lodash";
import {RandomFn} from "./Rng";
import {ease, EasingName} from "./easings";

/**
 * Configuration for generating an animated butane flame (as emitted from a
 * jetpack nozzle or a sci-fi torch).
 *
 * Sizes are given as ratios of `reach` (so a config is reach-independent) and
 * everything else is unitless, which makes configs reusable as templates.
 */
export type FlameGeneratorConfig = {
  /** How far the lenses travel from the nozzle, in pixels (default: 200) */
  reach: number;
  /** Emission direction in radians (0 = +x, -π/2 = up on screen) (default: -π/2) */
  direction?: number;
  /** Global speed multiplier — scales the body, holes and flicker together (default: 1) */
  speed?: number;

  // --- Body (positive lenses) ---
  /** Number of body lenses (default: 42) */
  bodyCount?: number;
  /** Body lens half-length as a ratio of reach (default: 0.19) */
  bodyLengthRatio?: number;
  /** Body lens half-width relative to its half-length (default: 0.6) */
  lensAspect?: number;
  /** Random spread of body lens size, ± this fraction (default: 0.5) */
  bodySizeVar?: number;
  /** Half-angle of the body emission cone in radians (default: 0.28) */
  spread?: number;
  /** Nozzle emission width as a ratio of reach (default: 0.3) */
  nozzleWidthRatio?: number;
  /** Age (0-1) at which a body lens starts shrinking toward the tip (default: 0.35) */
  bodyTaperStart?: number;
  /**
   * Distance (as a ratio of reach) at which the body is hard-clipped flat — a
   * far cutoff plane perpendicular to the flow, mirroring the nozzle mask at 0.
   * Set beyond the flame's natural reach (default: 1.2) to leave the tip untouched.
   */
  cutoffDist?: number;
  /** Easing for how a body lens travels outward over its life (default: "outQuad") */
  bodyDistEasing?: EasingName;
  /** How fast the body lens stream cycles, in cycles per unit time (default: 1) */
  bodySpeed?: number;
  /** Sideways flicker amplitude for body lenses, as a ratio of reach (default: 0.03) */
  flickerRatio?: number;
  /** Flicker frequency, in cycles per unit time (default: 2) */
  flickerFreq?: number;

  // --- Holes (negative lenses, boolean-subtracted) ---
  /** Number of hole lenses (default: 8) */
  holeCount?: number;
  /** Hole lens size at its asymptote, as a ratio of reach (default: 0.22) */
  holeSpanRatio?: number;
  /** Hole lens width relative to its length; 1 = round (default: 0.85) */
  holeThickness?: number;
  /** Random spread of hole size, ± this fraction (default: 0.4) */
  holeSizeVar?: number;
  /** Easing for how a hole grows to its full size (default: "outExpo") */
  holeSizeEasing?: EasingName;
  /** Easing for how a hole travels outward (default: "outExpo") */
  holeDistEasing?: EasingName;
  /** Where holes are born, as a ratio of reach (default: 0.35) */
  holeSpawnDist?: number;
  /** Exponential rise distance beyond the spawn point, as a ratio of reach (default: 0.5) */
  holeRiseDist?: number;
  /** Linear continued drift, as a ratio of reach — keeps holes creeping after the ease (default: 0.2) */
  holeDriftDist?: number;
  /** Half-angle of the hole emission cone in radians (default: 0.28) */
  holeSpread?: number;
  /** How fast the hole stream cycles (default: 1.1) */
  holeSpeed?: number;

  /** Vertices per lens side; keep low for the faceted, stop-motion look (default: 4) */
  lensResolution?: number;
  /** Source of randomness; pass the stage rng when the flame affects the simulation (default: Math.random) */
  random?: RandomFn;
}

/**
 * A butane flame at a moment in time, as computed vector polygons: a set of
 * body lenses to be filled, and a set of hole lenses to be subtracted from them
 * (exactly like the explosion's main shape and its holes).
 */
export type FlameShape = {
  /** Positive lenses forming the flame body (already clipped at the nozzle plane) */
  body: Vector[][];
  /** Lenses to boolean-subtract from the body (they grow as they age) */
  holes: Vector[][];
}

/** Function that generates the flame shape for a specific time */
export type FlamePathGenerator = (t: number) => FlameShape;

/** Object returned by the flame generator */
export type FlameGenerator = {
  /** Function to generate the flame shape for a specific time (in seconds) */
  generate: FlamePathGenerator;
}

/**
 * A low-poly lens ("vesica") polygon: pointed at both tips along the y-axis,
 * bulging to `halfWidth` at the middle. Half-length is 1.
 */
function lensVertices(halfWidth: number, resolution: number): Vector[] {
  const pts: Vector[] = [];
  for (let i = 0; i <= resolution; i++) {
    const y = -1 + (2 * i) / resolution;
    pts.push(Vector.create(halfWidth * (1 - y * y), y));
  }
  for (let i = resolution - 1; i >= 1; i--) {
    const y = -1 + (2 * i) / resolution;
    pts.push(Vector.create(-halfWidth * (1 - y * y), y));
  }
  return pts;
}

/**
 * Default values for every tunable flame parameter. Shared with the sandbox so
 * its sliders and the generator stay in sync.
 */
export const flameDefaults = {
  speed:            1,
  bodyCount:        42,
  bodyLengthRatio:  0.19,
  lensAspect:       0.6,
  bodySizeVar:      0.5,
  spread:           0.28,
  nozzleWidthRatio: 0.3,
  bodyTaperStart:   0.35,
  cutoffDist:       1.2,
  bodyDistEasing:   "outQuad" as EasingName,
  bodySpeed:        1,
  flickerRatio:     0.03,
  flickerFreq:      2,

  holeCount:        8,
  holeSpanRatio:    0.22,
  holeThickness:    0.85,
  holeSizeVar:      0.4,
  holeSizeEasing:   "outExpo" as EasingName,
  holeDistEasing:   "outExpo" as EasingName,
  holeSpawnDist:    0.35,
  holeRiseDist:     0.5,
  holeDriftDist:    0.2,
  holeSpread:       0.28,
  holeSpeed:        1.1,

  lensResolution:   4,
};

/**
 * Clip a polygon to the half-plane `dot(p, normal) >= offset` (Sutherland–
 * Hodgman against a single line). Used to cut the flame off at the nozzle plane
 * (start) and at the cutoff plane (end).
 */
function clipHalfPlane(poly: Vector[], nx: number, ny: number, offset = 0): Vector[] {
  const out: Vector[] = [];
  const n   = poly.length;
  for (let i = 0; i < n; i++) {
    const cur = poly[i];
    const nxt = poly[(i + 1) % n];
    const dc  = cur.x * nx + cur.y * ny - offset;
    const dn  = nxt.x * nx + nxt.y * ny - offset;
    const curIn = dc >= 0;
    const nxtIn = dn >= 0;
    if (curIn) out.push(cur);
    if (curIn !== nxtIn) {
      const t = dc / (dc - dn);
      out.push(Vector.create(cur.x + (nxt.x - cur.x) * t, cur.y + (nxt.y - cur.y) * t));
    }
  }
  return out;
}

/**
 * Generates an animated butane flame as a stop-motion vector shape.
 *
 * Modelled on the explosion: a positive body built from lens primitives emitted
 * across the nozzle and swimming outward (decelerating), minus a set of hole
 * lenses that shoot up and swell along an exponential-approach curve and then
 * keep drifting slowly. The whole flame is clipped at the nozzle plane.
 *
 * Each lens has a fixed phase, so `generate(t)` is a pure function of time:
 * given the same `random` source it always produces the same flame, making it
 * reproducible in the simulation and testable in the sandbox.
 */
export function generateAnimatedFlame(config: FlameGeneratorConfig = {reach: 0}): FlameGenerator {

  const {
    reach,
    direction = -Math.PI / 2,
    random    = Math.random,
    speed,

    bodyCount, bodyLengthRatio, lensAspect, bodySizeVar, spread, nozzleWidthRatio,
    bodyTaperStart, cutoffDist, bodyDistEasing, bodySpeed, flickerRatio, flickerFreq,

    holeCount, holeSpanRatio, holeThickness, holeSizeVar, holeSizeEasing, holeDistEasing,
    holeSpawnDist, holeRiseDist, holeDriftDist, holeSpread, holeSpeed,

    lensResolution,
  } = {...flameDefaults, ...config};

  const bodyLength  = reach * bodyLengthRatio;
  const nozzleWidth = reach * nozzleWidthRatio;
  const holeSpan    = reach * holeSpanRatio;
  const flicker     = reach * flickerRatio;
  const cutoff      = reach * cutoffDist;

  const dir    = Vector.create(Math.cos(direction), Math.sin(direction));
  const across = Vector.create(-dir.y, dir.x);

  const bodyParticles = times(bodyCount, () => ({
    phase:       random(),
    angle:       direction + (random() * 2 - 1) * spread,
    lateral:     (random() - 0.5) * nozzleWidth,
    sizeVar:     Math.max(0, 1 + (random() - 0.5) * bodySizeVar),
    flickerSeed: random(),
    unitLens:    lensVertices(lensAspect * (0.85 + random() * 0.3), lensResolution),
  }));

  const holeParticles = times(holeCount, () => ({
    phase:    random(),
    angle:    direction + (random() * 2 - 1) * holeSpread,
    lateral:  (random() - 0.5) * nozzleWidth,
    sizeVar:  Math.max(0, 1 + (random() - 0.5) * holeSizeVar),
    unitLens: lensVertices(holeThickness, lensResolution),
  }));

  /** Place a unit lens: scaled to `halfLen`, its long (y) axis along `angle`, centred at `pos`. */
  const placeLens = (unitLens: Vector[], pos: Vector, halfLen: number, angle: number): Vector[] => {
    const along = Vector.create(Math.cos(angle), Math.sin(angle));
    const perp  = Vector.create(-along.y, along.x);
    return unitLens.map(v => Vector.create(
      pos.x + along.x * v.y * halfLen + perp.x * v.x * halfLen,
      pos.y + along.y * v.y * halfLen + perp.y * v.x * halfLen,
    ));
  };

  const generate: FlamePathGenerator = (rawT: number) => {

    // Global speed multiplier scales the whole animation clock.
    const t = rawT * speed;

    // Body lenses: emitted across the nozzle, swimming outward and decelerating,
    // tapering after `bodyTaperStart` so the flame narrows to its tip.
    const body: Vector[][] = [];
    for (const p of bodyParticles) {
      const age   = (t * bodySpeed + p.phase) % 1;
      const taper = age < bodyTaperStart ? 1 : Math.max(0, (1 - age) / (1 - bodyTaperStart));
      const halfLen = bodyLength * p.sizeVar * taper;
      if (halfLen <= 0) continue;

      const ray     = Vector.create(Math.cos(p.angle), Math.sin(p.angle));
      const rayPerp = Vector.create(-ray.y, ray.x);
      const dist    = reach * ease(bodyDistEasing, age);
      const wobble  = flicker * age * Math.sin((t * flickerFreq + p.flickerSeed) * 2 * Math.PI);

      const pos = Vector.create(
        ray.x * dist + across.x * p.lateral + rayPerp.x * wobble,
        ray.y * dist + across.y * p.lateral + rayPerp.y * wobble,
      );

      // Clip at the nozzle plane (start) and the cutoff plane (end).
      let clipped = clipHalfPlane(placeLens(p.unitLens, pos, halfLen, p.angle), dir.x, dir.y);
      clipped     = clipHalfPlane(clipped, -dir.x, -dir.y, -cutoff);
      if (clipped.length >= 3) body.push(clipped);
    }

    // Hole lenses: size and distance both follow an exponential approach (shoot
    // up and swell fast, then stagger), plus a linear drift so they never fully
    // stop — they keep creeping outward past the ease.
    const holes: Vector[][] = [];
    for (const p of holeParticles) {
      const hp   = (t * holeSpeed + p.phase) % 1;
      const half = holeSpan * p.sizeVar * ease(holeSizeEasing, hp);
      if (half <= 0) continue;

      const ray  = Vector.create(Math.cos(p.angle), Math.sin(p.angle));
      // Eased rise plus a linear drift so the hole keeps creeping after the ease.
      const dist = reach * (holeSpawnDist + holeRiseDist * ease(holeDistEasing, hp) + holeDriftDist * hp);
      const pos  = Vector.create(
        ray.x * dist + across.x * p.lateral,
        ray.y * dist + across.y * p.lateral,
      );

      holes.push(placeLens(p.unitLens, pos, half, p.angle));
    }

    return {body, holes};
  };

  return {generate};
}
