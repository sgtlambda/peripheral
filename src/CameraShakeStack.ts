import {EngineStep} from "./engineStep";
import InteractionHandler from "./logic/InteractionHandler";
import {HasStep} from "./types";

export type CameraShake = {
  duration: number;
  x: number;
  y: number;
};

export type TimestampedCameraShake = CameraShake & {
  firstAdded: number;
};

export class CameraShakeStack implements HasStep {

  public stack: TimestampedCameraShake[] = [];

  private pending: CameraShake[] = [];

  add(shake: CameraShake) {
    this.pending.push(shake);
  }

  step(event: EngineStep, interactionHandler: InteractionHandler) {
    this.stack   = [
      ...this.stack,
      ...this.pending.map((shake) => ({
        ...shake,
        // TODO the timestamp should ideally be registered upon the actual moment
        //  of the shake, not when it is added to the stack from the pending list
        firstAdded: event.timestamp,
      })),
    ];
    this.pending = [];
    // Now we'll remove all shakes that are finished
    this.stack   = this.stack.filter((shake) => {
      const timeElapsed = event.timestamp - shake.firstAdded;
      return timeElapsed < shake.duration;
    });
  }

  static computeCameraShake(event: EngineStep, stack: TimestampedCameraShake[]) {
    return stack.reduce((vector, shake) => {
      // First we'll calculate a value between 0 and 1 based on the duration and `firstAdded` and event timestamp
      const timeElapsed    = event.timestamp - shake.firstAdded;
      const normalizedTime = Math.max(timeElapsed / shake.duration, 0);
      const randomFac      = Math.random() - .5;
      const shakeX         = randomFac * shake.x * (1 - normalizedTime);
      const shakeY         = randomFac * shake.y * (1 - normalizedTime);
      return {
        x: vector.x + shakeX,
        y: vector.y + shakeY,
      };
    }, {x: 0, y: 0});
  }
}