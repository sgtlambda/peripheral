/**
 * A small registry of well-known easing functions (see easings.net), each
 * mapping a normalized input t ∈ [0,1] to an eased output. Used to shape the
 * flame's growth/travel curves so they can be swapped by name.
 */
export type EasingName =
  | "linear"
  | "inQuad" | "outQuad" | "inOutQuad"
  | "inCubic" | "outCubic" | "inOutCubic"
  | "outQuart" | "outQuint"
  | "inExpo" | "outExpo" | "inOutExpo"
  | "outCirc" | "inOutSine";

export const easings: Record<EasingName, (t: number) => number> = {
  linear:     t => t,
  inQuad:     t => t * t,
  outQuad:    t => 1 - (1 - t) * (1 - t),
  inOutQuad:  t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic:    t => t * t * t,
  outCubic:   t => 1 - Math.pow(1 - t, 3),
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart:   t => 1 - Math.pow(1 - t, 4),
  outQuint:   t => 1 - Math.pow(1 - t, 5),
  inExpo:     t => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outExpo:    t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutExpo:  t => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2),
  outCirc:    t => Math.sqrt(1 - Math.pow(t - 1, 2)),
  inOutSine:  t => -(Math.cos(Math.PI * t) - 1) / 2,
};

export const easingNames = Object.keys(easings) as EasingName[];

/** Look up an easing by name, falling back to linear. */
export function ease(name: EasingName, t: number): number {
  return (easings[name] ?? easings.linear)(t);
}
