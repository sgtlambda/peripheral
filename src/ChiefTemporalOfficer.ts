import {HasStep, StepContext} from "./types";

// Matches the default fixed timestep of Matter's Runner; only used as a
// fallback when timeScale is 0 and the unscaled delta cannot be recovered.
const FALLBACK_DELTA = 1000 / 60;

/**
 * Responsible for temporary slow-motion and fast-forwarding of the game.
 *
 * Stepped from the engine loop (via `Stage.stepEffects`) rather than using
 * `setTimeout`, so time manipulation is deterministic, survives teardown, and
 * overlapping requests can't clobber each other: a new request simply replaces
 * the current one.
 */
export class ChiefTemporalOfficer implements HasStep {

  private request: { multiplier: number; duration: number } | null = null;

  private active: boolean              = false;
  private remainingUnscaledMs: number  = 0;

  /**
   * Temporarily change the simulation speed.
   * @param multiplier The time scale to apply (e.g. .01 for slow motion)
   * @param duration How long to keep it, in unscaled (step) milliseconds —
   *   i.e. roughly perceived real time, independent of the multiplier.
   */
  public slowMoTemporarily(multiplier: number, duration: number) {
    this.request = {multiplier, duration};
  }

  step({event}: StepContext) {
    const timing = event.source.timing;

    if (this.request) {
      timing.timeScale         = this.request.multiplier;
      this.remainingUnscaledMs = this.request.duration;
      this.active              = true;
      this.request             = null;
      return;
    }

    if (!this.active) return;

    // event.delta is pre-multiplied by timeScale (see Matter's Engine.update)
    const unscaledDelta = timing.timeScale > 0 ? event.delta / timing.timeScale : FALLBACK_DELTA;

    this.remainingUnscaledMs -= unscaledDelta;

    if (this.remainingUnscaledMs <= 0) {
      timing.timeScale = 1;
      this.active      = false;
    }
  }
}
