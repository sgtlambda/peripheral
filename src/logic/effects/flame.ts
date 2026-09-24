import {FlameEffect, FlameEffectProps} from "../../FlameEffect";
import Stage from "../Stage";
import {FlameGeneratorConfig} from "../../common/flame";

/**
 * Parameters for adding a flame effect to the stage (as opposed to
 * `FlameParams` in common/flame, the generator's tunables)
 */
export interface StageFlameParams {
  /** X-coordinate of the nozzle */
  x: number;
  /** Y-coordinate of the nozzle */
  y: number;
  /** The game stage to apply the effect to */
  stage: Stage;
  /** Emission direction in radians (0 = +x, -π/2 = up) (default: -π/2) */
  direction?: number;
  /** How far the flame reaches from the nozzle (default: 200) */
  reach?: number;
  /** Solid flame colour */
  color: string;
  /** Optional lifetime in milliseconds; omit to burn until stopped */
  duration?: number;
  /** Additional flame configuration options */
  flameConfig?: Partial<FlameGeneratorConfig>;
}

/**
 * Creates and adds a flame effect to the stage.
 *
 * Returns the effect so the caller can `stop()` it (e.g. when the jetpack
 * throttle is released).
 */
export function flame(
  {
    x,
    y,
    stage,
    direction = -Math.PI / 2,
    reach = 200,
    color,
    duration,
    flameConfig = {},
  }: StageFlameParams): FlameEffect {

  const effect = new FlameEffect({
    position: {x, y},
    direction,
    reach,
    color,
    duration,
    flameConfig: {random: stage.rng.next, ...flameConfig},
  });

  stage.stepEffects.push(effect);
  stage.graphics.addOverLayer(effect);

  return effect;
}
