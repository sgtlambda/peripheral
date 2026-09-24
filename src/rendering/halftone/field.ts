/**
 * Dot fields: a shape described as "how big is the halftone dot at this world
 * point". Fields are sampled on a world-fixed grid (see `HalftoneSurface`), so
 * shapes light up grid dots as they move instead of carrying dots with them.
 */

/** A field value meaning "a gap nothing may fill" (an eye), as opposed to 0, "no dot here". */
export const FORCED_GAP = -1;

/** Dot radius at a world point, 0 for none, or `FORCED_GAP`. */
export type DotField = (wx: number, wy: number) => number;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export type OrbOptions = {
  /** Centre, in world coordinates */
  x: number;
  y: number;
  /** Collider radius; the orb is drawn slightly inside it */
  radius: number;
  /** Largest dot radius on the grid */
  maxDot: number;
  /** Direction the orb looks, in world radians: lights that side and places the eye. Omit for no eye. */
  look?: number;
  /** Lean from motion, in radians (the eye and plume turn with it) */
  tilt?: number;
  /** Vertical hover offset, in px */
  bob?: number;
  /** Jetpack throttle 0-1: adds a dotted plume below */
  thrust?: number;
  /** Animation clock in seconds (plume flicker) */
  time?: number;
  /** Multiplier on every dot, e.g. to pulse a blinking grenade */
  scale?: number;
};

/**
 * A halftone sphere: dots grow toward the side it looks at (or the upper left,
 * without `look`), with an almond eye gap and a solid pupil toward the look
 * direction, and an optional thrust plume below.
 */
export function orbField(
  {x, y, radius: r, maxDot, look, tilt = 0, bob = 0, thrust = 0, time = 0, scale = 1}: OrbOptions,
): DotField {
  const R     = r * 0.85;
  const local = (look ?? -Math.PI * 0.75) - tilt;
  const lx = Math.cos(local), ly = Math.sin(local);
  const cosT = Math.cos(-tilt), sinT = Math.sin(-tilt);
  const hasEye = look !== undefined;
  const eyeX = lx * R * 0.45, eyeY = ly * R * 0.3;
  const pupilX = eyeX + lx * R * 0.11, pupilY = eyeY + ly * R * 0.07;
  const pupilR = R * 0.16;

  return (wx, wy) => {
    const ox = wx - x, oy = wy - y - bob;
    const px = ox * cosT - oy * sinT, py = ox * sinT + oy * cosT;
    const d  = Math.hypot(px, py);
    if (d < R) {
      if (hasEye) {
        if (Math.hypot(px - pupilX, py - pupilY) < pupilR) return maxDot * scale;
        const u = (px - eyeX) / (R * 0.38), v = (py - eyeY) / (R * 0.2);
        if (u * u + v * v < 1) return FORCED_GAP;
      }
      const z     = Math.sqrt(1 - (d / R) ** 2);
      const light = clamp((px * lx + py * ly) / R * 0.7 + z * 0.55, 0, 1);
      return (0.18 + light * 0.82) * maxDot * 0.85 * scale;
    }
    if (thrust > 0.02 && py > R * 0.5) {
      const depth = py - R * 0.5, spread = 2 + depth * 0.35, len = r * 2.2 * thrust;
      if (Math.abs(px) < spread && depth < len) {
        const flicker = 0.6 + 0.4 * Math.sin(depth * 0.9 - time * 18 + wx * 0.7);
        return (1 - depth / len) * (1 - Math.abs(px) / spread) * maxDot * flicker * scale;
      }
    }
    return 0;
  };
}
