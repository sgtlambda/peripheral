import {ButaneFlameEffect, ButaneFlameEffectProps} from "../../ButaneFlameEffect";
import Stage from "../Stage";
import {FlameGeneratorConfig} from "../../common/butaneFlame";

/**
 * Parameters for creating a butane flame effect
 */
export interface ButaneFlameParams {
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
 * Creates and adds a butane flame effect to the stage.
 *
 * Returns the effect so the caller can `stop()` it (e.g. when the jetpack
 * throttle is released).
 */
export function butaneFlame(
  {
    x,
    y,
    stage,
    direction = -Math.PI / 2,
    reach = 200,
    color,
    duration,
    flameConfig = {},
  }: ButaneFlameParams): ButaneFlameEffect {

  const effect = new ButaneFlameEffect({
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
