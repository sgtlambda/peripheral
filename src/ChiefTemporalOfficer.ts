import {Engine} from "matter-js";

/**
 * Responsible for temporary slow-motion and fast-forwarding of the game.
 */
export class ChiefTemporalOfficer {

  private engine: Engine | null = null;

  constructor() {
  }

  public attachToEngine(engine: Engine) {
    this.engine = engine;
  }

  public detachFromEngine() {
    if (this.engine) {
      this.engine = null;
    }
  }

  public slowMoTemporarily(multiplier: number, duration: number) {
    if (this.engine) {
      this.engine.timing.timeScale = multiplier;
      setTimeout(() => {
        this.engine!.timing.timeScale = 1;
      }, duration);
    }
  }
}