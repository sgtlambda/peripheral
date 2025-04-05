import {FlashEffect, FlashEffectProps} from "../../FlashEffect";
import Stage from "../Stage";

export function flash(
  stage: Stage,
  flash: FlashEffectProps,
) {
  const effect = new FlashEffect(flash);
  stage.stepEffects.push(effect);
  stage.graphics.addOverLayer(effect);
}