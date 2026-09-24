import {Vector, Vertices} from "matter-js";
import {times} from "lodash";
import {RandomFn} from "./Rng";
import {ease, EasingName} from "./easings";
import {combine} from "./paperOps";

/**
 * Configuration for generating an animated flame (as emitted from a
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
  /**
   * The flame repeats exactly every `loopPeriod` seconds (at speed 1). Every
   * particle's cycle rate and every oscillation frequency is quantized to a
   * multiple of 1/loopPeriod so the whole ensemble loops in sync — a longer
   * period means the repetition is far less noticeable (default: 10).
   */
  loopPeriod?: number;

  // --- Body (positive lenses) ---
  /** Number of body lenses (default: 42) */
  bodyCount?: number;
  /** Body lens half-length as a ratio of reach (default: 0.19) */
  bodyLengthRatio?: number;
  /** Body lens half-width relative to its half-length (default: 0.6) */
  lensAspect?: number;
  /** Random spread of body lens size, ± this fraction (default: 0.5) */
  bodySizeVar?: number;
  /**
   * Half-angle of the body emission fan in radians. Every lens is emitted from
   * the origin along its own ray within `direction ± spread` (default: 0.35).
   */
  spread?: number;
  /** Age (0-1) at which a body lens starts shrinking toward the tip (default: 0.35) */
  bodyTaperStart?: number;
  /**
   * Radius (as a ratio of reach) from the emission point at which the body is
   * hard-clipped — an arc-shaped far cutoff, mirroring the nozzle mask at 0.
   * Set beyond the flame's natural reach (default: 1.2) to leave the tip untouched.
   */
  cutoffDist?: number;
  /** Radial jiggle of the cutoff arc, as a fraction of its radius (default: 0.05) */
  cutoffWobbleAmp?: number;
  /** Number of jiggle lobes across the arc (default: 3) */
  cutoffWobbleFreq?: number;
  /** How fast the jiggle lobes drift along the arc, per unit time (default: 1) */
  cutoffWobbleSpeed?: number;
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
  /**
   * Per-hole random variation of the spawn distance, ± this ratio of reach —
   * so holes originate at varying distances from the origin instead of all
   * popping in on the same arc (default: 0.15).
   */
  holeSpawnDistVar?: number;
  /** Exponential rise distance beyond the spawn point, as a ratio of reach (default: 0.5) */
  holeRiseDist?: number;
  /**
   * Fraction of a hole's life before the rise begins (default: 0.15). Size
   * growth starts immediately, so the hole visibly materialises at its spawn
   * distance before it starts travelling — without this, a fast distance
   * easing front-loads the rise and shifts where holes appear to spawn.
   */
  holeRiseDelay?: number;
  /** Linear continued drift, as a ratio of reach — keeps holes creeping after the ease (default: 0.2) */
  holeDriftDist?: number;
  /**
   * Multiplier on the body's `spread` for the hole fan. Holes share the body's
   * origin and angle range, scaled by this factor — 1 = identical fan, slightly
   * below/above narrows/widens the hole fan relative to the body (default: 1).
   */
  holeSpreadScale?: number;
  /** How fast the hole stream cycles (default: 1.1) */
  holeSpeed?: number;
  /** Random initial rotation of each hole lens, ± this many radians off its ray (default: 0) */
  holeRotStart?: number;
  /** Random extra rotation each hole accumulates over its life, ± this many radians (default: 0) */
  holeRotEnd?: number;

  // --- Island culling (true boolean combine + cull of detached fragments) ---
  /**
   * When true, the body/holes are boolean-combined for real each frame; any
   * contour no longer touching the mainland (the contour over the emit point)
   * is an "island" and must pass the area-vs-distance threshold below to
   * render (default: true).
   */
  cullIslands?: boolean;
  /** Distance (ratio of reach) where the island culling ramp begins — islands closer than this always render (default: 0.45) */
  islandSlopeStart?: number;
  /** Distance (ratio of reach) where the culling ramp reaches full strength (default: 1.05) */
  islandSlopeEnd?: number;
  /** Minimum island area at full ramp strength, as a ratio of reach² (default: 0.02) */
  islandCullArea?: number;

  /** Vertices per lens side; keep low for the faceted, stop-motion look (default: 4) */
  lensResolution?: number;
  /** Source of randomness; pass the stage rng when the flame affects the simulation (default: Math.random) */
  random?: RandomFn;
}

/**
 * A flame at a moment in time, as computed vector polygons: a set of
 * body lenses to be filled, and a set of hole lenses to be subtracted from them
 * (exactly like the explosion's main shape and its holes).
 */
export type FlameShape = {
  /** Positive lenses forming the flame body (already clipped at the nozzle plane) */
  body: Vector[][];
  /** Lenses to boolean-subtract from the body (they grow as they age) */
  holes: Vector[][];
  /**
   * Where each lens sits this frame, before any clipping or boolean combine —
   * purely for debug overlays (the sandbox draws them as markers), never for
   * rendering the flame itself.
   */
  centers: {
    /** Centre of every body lens (including ones fully clipped away) */
    body: Vector[];
    /** Centre of every hole lens */
    holes: Vector[];
  };
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
  loopPeriod:       10,
  bodyCount:        42,
  bodyLengthRatio:  0.19,
  lensAspect:       0.6,
  bodySizeVar:      0.5,
  spread:           0.35,
  bodyTaperStart:   0.35,
  cutoffDist:       1.2,
  cutoffWobbleAmp:  0.05,
  cutoffWobbleFreq: 3,
  cutoffWobbleSpeed: 1,
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
  holeSpawnDistVar: 0.15,
  holeRiseDist:     0.5,
  holeRiseDelay:    0.15,
  holeDriftDist:    0.2,
  holeSpreadScale:  1,
  holeSpeed:        1.1,
  holeRotStart:     0,
  holeRotEnd:       0,

  cullIslands:      true,
  islandSlopeStart: 0.45,
  islandSlopeEnd:   1.05,
  islandCullArea:   0.02,

  lensResolution:   4,
};

/**
 * The complete set of tunable flame parameters (every key of `flameDefaults`),
 * always fully populated — as opposed to `FlameGeneratorConfig`, where every
 * tunable is optional and `reach`/`direction`/`random` come from the caller.
 */
export type FlameParams = typeof flameDefaults;

/** Ray-casting point-in-polygon test. */
function pointInPolygon(pt: Vector, poly: Vector[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > pt.y) !== (b.y > pt.y) &&
        pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Clip a polygon to the star-shaped region `|p| <= radiusAt(angle)` around the
 * origin — Sutherland–Hodgman against a curved boundary, with edge crossings
 * approximated linearly (reads fine at the low-poly resolutions we use).
 */
function clipRadial(poly: Vector[], radiusAt: (angle: number) => number): Vector[] {
  const out: Vector[] = [];
  const n   = poly.length;
  const inside = (v: Vector) => radiusAt(Math.atan2(v.y, v.x)) - Math.hypot(v.x, v.y);
  for (let i = 0; i < n; i++) {
    const cur = poly[i];
    const nxt = poly[(i + 1) % n];
    const dc  = inside(cur);
    const dn  = inside(nxt);
    if (dc >= 0) out.push(cur);
    if ((dc >= 0) !== (dn >= 0)) {
      const t = dc / (dc - dn);
      out.push(Vector.create(cur.x + (nxt.x - cur.x) * t, cur.y + (nxt.y - cur.y) * t));
    }
  }
  return out;
}

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
 * Generates an animated flame as a stop-motion vector shape.
 *
 * Modelled on the explosion: a positive body built from lens primitives emitted
 * radially within an angle fan and swimming outward (decelerating), minus a set of hole
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
    loopPeriod,

    bodyCount, bodyLengthRatio, lensAspect, bodySizeVar, spread,
    bodyTaperStart, cutoffDist, cutoffWobbleAmp, cutoffWobbleFreq, cutoffWobbleSpeed,
    bodyDistEasing, bodySpeed, flickerRatio, flickerFreq,

    holeCount, holeSpanRatio, holeThickness, holeSizeVar, holeSizeEasing, holeDistEasing,
    holeSpawnDist, holeSpawnDistVar, holeRiseDist, holeRiseDelay, holeDriftDist,
    holeSpreadScale, holeSpeed, holeRotStart, holeRotEnd,

    cullIslands, islandSlopeStart, islandSlopeEnd, islandCullArea,

    lensResolution,
  } = {...flameDefaults, ...config};

  const bodyLength = reach * bodyLengthRatio;
  const holeSpan   = reach * holeSpanRatio;
  const flicker    = reach * flickerRatio;
  const cutoff     = reach * cutoffDist;

  const dir = Vector.create(Math.cos(direction), Math.sin(direction));

  // Everything periodic is quantized to a multiple of 1/loopPeriod, so every
  // particle completes an integer number of cycles per loop and the whole
  // flame repeats exactly every `loopPeriod` seconds (at speed 1). Each
  // particle gets its own ±15% rate so the streams don't pulse in sync.
  const quantRate = (cyclesPerSec: number) =>
    Math.round(cyclesPerSec * loopPeriod) / loopPeriod;
  /** Particle cycle rates must not quantize to zero, or the particle freezes. */
  const quantParticleRate = (cyclesPerSec: number) =>
    Math.max(1 / loopPeriod, quantRate(cyclesPerSec));
  const quantRad = (radPerSec: number) =>
    Math.round(radPerSec * loopPeriod / (2 * Math.PI)) * (2 * Math.PI) / loopPeriod;

  // Pure angular emission: every lens travels its own ray from the emit point,
  // drawn uniformly from the fan `direction ± spread`. Body and holes share the
  // same distribution shape, so the holes eat the flame evenly across the fan.
  const bodyParticles = times(bodyCount, () => ({
    phase:       random(),
    angle:       direction + (random() * 2 - 1) * spread,
    sizeVar:     Math.max(0, 1 + (random() - 0.5) * bodySizeVar),
    flickerSeed: random(),
    /** This lens's own cycle rate, quantized to keep the global loop exact */
    rate:        quantParticleRate(bodySpeed * (0.85 + random() * 0.3)),
    unitLens:    lensVertices(lensAspect * (0.85 + random() * 0.3), lensResolution),
  }));

  const holeParticles = times(holeCount, () => ({
    phase:    random(),
    angle:    direction + (random() * 2 - 1) * spread * holeSpreadScale,
    sizeVar:  Math.max(0, 1 + (random() - 0.5) * holeSizeVar),
    /** Random initial orientation offset from the ray */
    rotStart: (random() * 2 - 1) * holeRotStart,
    /** Random extra rotation accumulated over the hole's life */
    rotEnd:   (random() * 2 - 1) * holeRotEnd,
    /** This hole's own spawn distance (ratio of reach) */
    spawnDist: Math.max(0, holeSpawnDist + (random() * 2 - 1) * holeSpawnDistVar),
    /** This hole's own cycle rate, quantized to keep the global loop exact */
    rate:     quantParticleRate(holeSpeed * (0.85 + random() * 0.3)),
    unitLens: lensVertices(holeThickness, lensResolution),
  }));

  // Phase offset for the cutoff arc's jiggle, so each flame's boundary drifts
  // differently. Drawn after the particle arrays to keep prior seeds stable.
  const cutoffPhase = random() * Math.PI * 2;

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

    // Global speed multiplier scales the whole animation clock. Reducing by the
    // loop period is an identity (every frequency is a multiple of 1/period)
    // but keeps precision from decaying as raw time grows.
    const t = (rawT * speed) % loopPeriod;

    // The far cutoff is an arc around the emission point whose radius jiggles
    // with angle and drifts over time — two drifting sine lobes (a primary and
    // a faster half-amplitude harmonic) give it an organic, licking edge.
    const cutoffRadiusAt = (theta: number) =>
      cutoff * (1 + cutoffWobbleAmp * (
        Math.sin(theta * cutoffWobbleFreq - t * quantRad(cutoffWobbleSpeed) + cutoffPhase) +
        0.5 * Math.sin(theta * cutoffWobbleFreq * 2.3 + t * quantRad(cutoffWobbleSpeed * 1.7) + cutoffPhase * 2)
      ));

    // Body lenses: emitted along their rays, swimming outward and decelerating,
    // tapering after `bodyTaperStart` so the flame narrows to its tip.
    const body: Vector[][] = [];
    const centers: FlameShape["centers"] = {body: [], holes: []};
    for (const p of bodyParticles) {
      const age   = (t * p.rate + p.phase) % 1;
      const taper = age < bodyTaperStart ? 1 : Math.max(0, (1 - age) / (1 - bodyTaperStart));
      const halfLen = bodyLength * p.sizeVar * taper;
      if (halfLen <= 0) continue;

      const ray     = Vector.create(Math.cos(p.angle), Math.sin(p.angle));
      const rayPerp = Vector.create(-ray.y, ray.x);
      // Spawn fully behind the nozzle plane (one half-length below) so the lens
      // slides smoothly into view through the clip instead of popping in at 0.
      const spawnDepth = bodyLength * p.sizeVar;
      const dist    = -spawnDepth + (reach + spawnDepth) * ease(bodyDistEasing, age);
      const wobble  = flicker * age * Math.sin((t * quantRate(flickerFreq) + p.flickerSeed) * 2 * Math.PI);

      const pos = Vector.create(
        ray.x * dist + rayPerp.x * wobble,
        ray.y * dist + rayPerp.y * wobble,
      );

      centers.body.push(pos);

      // Clip at the nozzle plane (start) and the jiggling cutoff arc (end).
      let clipped = clipHalfPlane(placeLens(p.unitLens, pos, halfLen, p.angle), dir.x, dir.y);
      clipped     = clipRadial(clipped, cutoffRadiusAt);
      if (clipped.length >= 3) body.push(clipped);
    }

    // Hole lenses: size and distance both follow an exponential approach (shoot
    // up and swell fast, then stagger), plus a linear drift so they never fully
    // stop — they keep creeping outward past the ease.
    const holes: Vector[][] = [];
    for (const p of holeParticles) {
      const hp   = (t * p.rate + p.phase) % 1;
      const half = holeSpan * p.sizeVar * ease(holeSizeEasing, hp);
      if (half <= 0) continue;

      const ray  = Vector.create(Math.cos(p.angle), Math.sin(p.angle));
      // Eased rise (held back by holeRiseDelay so the hole grows in place at its
      // spawn distance first) plus a linear drift that keeps it creeping after
      // the ease.
      const riseT = Math.max(0, (hp - holeRiseDelay) / Math.max(1e-4, 1 - holeRiseDelay));
      const dist  = reach * (p.spawnDist + holeRiseDist * ease(holeDistEasing, riseT) + holeDriftDist * hp);
      const pos  = Vector.create(ray.x * dist, ray.y * dist);

      // Orientation: ray-aligned plus the random start rotation, twisting
      // toward the random end offset as the hole ages.
      const rotation = p.angle + p.rotStart + p.rotEnd * hp;
      centers.holes.push(pos);
      holes.push(placeLens(p.unitLens, pos, half, rotation));
    }

    if (!cullIslands || body.length === 0) return {body, holes, centers};

    // True boolean combine: union the body, subtract the holes, then classify
    // the resulting contours. The contour over the emit point is the mainland;
    // every other outer contour is a detached island that must pass an
    // area-vs-distance threshold to render.
    const contours = combine(body, holes).filter(c => c.length >= 3);
    if (contours.length === 0) return {body, holes, centers};

    // Containment depth: even = outer contour (mainland/island), odd = hole void.
    const outers: Vector[][] = [];
    const voids: Vector[][]  = [];
    for (const c of contours) {
      let depth = 0;
      for (const other of contours) {
        if (other !== c && pointInPolygon(c[0], other)) depth++;
      }
      (depth % 2 === 1 ? voids : outers).push(c);
    }
    if (outers.length === 0) return {body, holes, centers};

    // The mainland is the outer contour containing a sample point just above
    // the nozzle; fall back to the largest outer if the base is fully eaten.
    const sample   = Vector.create(dir.x * reach * 0.05, dir.y * reach * 0.05);
    const mainland = outers.find(c => pointInPolygon(sample, c))
      ?? outers.reduce((a, b) =>
        Math.abs(Vertices.area(a, true)) >= Math.abs(Vertices.area(b, true)) ? a : b);

    // Islands pass if their area beats a threshold that ramps up with distance
    // from the emit point: zero before islandSlopeStart, full islandCullArea
    // beyond islandSlopeEnd.
    const denom     = Math.max(1e-4, islandSlopeEnd - islandSlopeStart);
    const survivors = outers.filter(c => {
      if (c === mainland) return true;
      const area = Math.abs(Vertices.area(c, true));
      const cen  = c.reduce((acc, v) => ({x: acc.x + v.x / c.length, y: acc.y + v.y / c.length}), {x: 0, y: 0});
      const f    = Math.min(1, Math.max(0, (Math.hypot(cen.x, cen.y) / reach - islandSlopeStart) / denom));
      return area >= reach * reach * islandCullArea * f;
    });

    // Keep only the voids that live inside a surviving contour.
    const keptVoids = voids.filter(v => survivors.some(s => pointInPolygon(v[0], s)));

    return {body: survivors, holes: keptVoids, centers};
  };

  return {generate};
}
