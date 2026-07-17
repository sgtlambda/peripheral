import {HasStep, StepContext} from "../types";

/**
 * Timeline to schedule against:
 * - 'sim': scaled simulation time (affected by slow motion / fast forward)
 * - 'unscaled': engine step time with `timeScale` factored out; advances at a
 *   constant rate per tick regardless of slow motion, but is still driven
 *   exclusively by engine steps (never by the wall clock), so it remains
 *   deterministic and replayable.
 */
export type SimTimeline = 'sim' | 'unscaled';

type ScheduledTask = {
  fireAt: number;
  timeline: SimTimeline;
  seq: number;
  fn: () => void;
};

// Matches the default fixed timestep of Matter's Runner; only used as a
// fallback when timeScale is 0 and the unscaled delta cannot be recovered.
const FALLBACK_DELTA = 1000 / 60;

/**
 * The single source of time for gameplay code.
 *
 * Everything that used to rely on `setTimeout`/`setInterval` should schedule
 * through this clock instead: tasks fire at deterministic points in the
 * engine's step sequence, survive slow motion correctly, and die with the
 * stage instead of firing on stale objects after a teardown.
 */
export class SimClock implements HasStep {

  /** Scaled simulation time in ms (mirrors the engine timestamp). */
  public simTime: number = 0;

  /** Unscaled step time in ms (timeScale factored out). */
  public unscaledTime: number = 0;

  private tasks: ScheduledTask[] = [];
  private seq: number            = 0;

  /**
   * Schedule `fn` to run once, `delayMs` from now on the given timeline.
   * Returns a cancel function.
   */
  after(delayMs: number, fn: () => void, timeline: SimTimeline = 'sim'): () => void {
    const task: ScheduledTask = {
      fireAt: this.now(timeline) + delayMs,
      timeline,
      seq:    this.seq++,
      fn,
    };
    this.tasks.push(task);
    return () => {
      const index = this.tasks.indexOf(task);
      if (index !== -1) this.tasks.splice(index, 1);
    };
  }

  now(timeline: SimTimeline): number {
    return timeline === 'sim' ? this.simTime : this.unscaledTime;
  }

  step({event}: StepContext) {
    const timeScale = event.source.timing.timeScale;

    this.simTime = event.timestamp;
    // event.delta is pre-multiplied by timeScale (see Matter's Engine.update)
    this.unscaledTime += timeScale > 0 ? event.delta / timeScale : FALLBACK_DELTA;

    // Snapshot the due tasks before firing so that tasks scheduled from within
    // a callback never run in the same step (keeps ordering deterministic).
    const due = this.tasks
      .filter(task => this.now(task.timeline) >= task.fireAt)
      .sort((a, b) => (a.fireAt - b.fireAt) || (a.seq - b.seq));

    this.tasks = this.tasks.filter(task => !due.includes(task));

    for (const task of due) task.fn();
  }
}
