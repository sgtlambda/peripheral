import Stage from "../Stage";
import {AudioManager} from "../../common/AudioManager";

/**
 * Subscribes the presentation side effects (camera shake, audio, slow motion)
 * to the stage's game events. Gameplay code only emits events; everything
 * juicy hangs off the bus here: adding a new reaction to an explosion means
 * adding a subscriber, not editing `applyExplosion`.
 *
 * Returns an unsubscribe function.
 */
export function wireStageEffects(stage: Stage, audio?: AudioManager): () => void {
  return stage.bus.on('explosion', explosion => {

    // Scheduled on the unscaled timeline so the delay reflects perceived time
    // even when the explosion also triggers slow motion.
    stage.simClock.after(explosion.shakeDelay, () => {
      stage.cameraShakeStack.add({
        x:        50,
        y:        5,
        duration: 400,
      });
    }, 'unscaled');

    if (explosion.slowMo) {
      stage.chiefTemporalOfficer.slowMoTemporarily(explosion.slowMo.multiplier, explosion.slowMo.duration);
    }

    if (explosion.sound && audio) {
      audio.playWithRandomPitch(explosion.sound);
    }
  });
}
