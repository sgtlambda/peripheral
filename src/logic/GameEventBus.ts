import {SoundEffectID} from "../data/soundEffects";

export type ExplosionEvent = {
  x: number;
  y: number;
  /** Radius of the area affected by the explosion force */
  radius: number;
  force: number;
  /** Delay before the camera shake, in unscaled ms */
  shakeDelay: number;
  /** Sound to play, if any */
  sound?: SoundEffectID;
  /** Slow-motion to apply, if any */
  slowMo?: { multiplier: number; duration: number };
};

/**
 * All semantic game events. Gameplay code emits these; presentation concerns
 * (camera shake, audio, time manipulation, particles, ...) subscribe instead
 * of being called directly; see `wireStageEffects`.
 */
export type GameEvents = {
  explosion: ExplosionEvent;
};

export class GameEventBus {

  // Internally untyped; the public `on`/`emit` signatures keep payloads sound
  private handlers: Partial<Record<keyof GameEvents, Array<(payload: any) => void>>> = {};

  private listFor(type: keyof GameEvents): Array<(payload: any) => void> {
    return this.handlers[type] ?? (this.handlers[type] = []);
  }

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   */
  on<K extends keyof GameEvents>(type: K, handler: (payload: GameEvents[K]) => void): () => void {
    const list = this.listFor(type);
    list.push(handler);
    return () => {
      const index = list.indexOf(handler);
      if (index !== -1) list.splice(index, 1);
    };
  }

  emit<K extends keyof GameEvents>(type: K, payload: GameEvents[K]) {
    const list = this.handlers[type];
    if (!list) return;
    // Iterate over a copy so that handlers may unsubscribe while emitting
    for (const handler of [...list]) handler(payload);
  }
}
