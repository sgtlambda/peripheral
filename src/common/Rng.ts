export type RandomFn = () => number;

/**
 * Deterministic seeded pseudo-random number generator (mulberry32).
 *
 * All randomness that affects the simulation must come from an `Rng` owned by
 * the running `Stage`, so that a session can be reproduced from its seed.
 * Purely cosmetic randomness (audio pitch, standalone sandbox stories) may
 * still use `Math.random`.
 */
export class Rng {

  private state: number;

  constructor(public readonly seed: number = 1) {
    this.state = seed >>> 0;
  }

  /** Returns a float in [0, 1). Bound so it can be passed around as a plain function. */
  public next: RandomFn = () => {
    this.state |= 0;
    this.state = (this.state + 0x6D2B79F5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t     = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}
