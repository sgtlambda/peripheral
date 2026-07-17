import {StepContext, System} from '../types';
import PlayerActions, {InteractionCommand} from './PlayerActions';

/** Minimum simulation time between continuous (held-trigger) activations */
export const CONTINUOUS_INTERVAL_MS = 80;

/**
 * Feeds player input into the simulation at step boundaries.
 *
 * Input handlers (DOM events) only queue commands and toggle the held state
 * of the primary trigger; the simulation is mutated exclusively from `step`,
 * which keeps it deterministic and replayable. Continuous fire is paced on
 * the simulation clock.
 */
export default class PlayerInputSystem implements System {

  private commandQueue: InteractionCommand[] = [];
  private primaryPressed: boolean            = false;
  private primaryHeld: boolean               = false;
  private continuousCooldown: number         = 0;

  constructor(private readonly actions: PlayerActions) {
  }

  /**
   * Queue a discrete command from an input handler; it runs at the next step.
   */
  enqueueCommand(command: InteractionCommand) {
    this.commandQueue.push(command);
  }

  pressPrimary() {
    this.primaryPressed = true;
    this.primaryHeld    = true;
  }

  releasePrimary() {
    this.primaryHeld = false;
  }

  step({event}: StepContext) {
    const commands    = this.commandQueue;
    this.commandQueue = [];
    for (const command of commands) this.actions.run(command);

    if (this.primaryPressed) {
      this.primaryPressed     = false;
      this.continuousCooldown = CONTINUOUS_INTERVAL_MS;
      this.actions.triggerPrimary();
    } else if (this.primaryHeld) {
      this.continuousCooldown -= event.delta;
      if (this.continuousCooldown <= 0) {
        this.continuousCooldown += CONTINUOUS_INTERVAL_MS;
        this.actions.triggerContinuous();
      }
    }
  }
}
