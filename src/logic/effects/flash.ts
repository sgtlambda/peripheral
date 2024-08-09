import {FlashEffect, FlashEffectProps} from "../../FlashEffect";
import Stage from "../Stage";

export function flash(
  stage: Stage,
  flash: FlashEffectProps,
) {
  // TODO somehow clean up the effect after its lifecycle!!
  const effect = new FlashEffect(flash);
  stage.flashEffects.push(effect);
  stage.graphics.addOverLayer(effect);
}