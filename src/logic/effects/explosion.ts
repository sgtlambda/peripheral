import {ExplosionEffect, ExplosionEffectProps} from "../../ExplosionEffect";
import Stage from "../Stage";
import {ExplosionGeneratorConfig} from "../../common/explosion";

/**
 * Parameters for creating an explosion effect
 */
export interface ExplosionParams {
  /** X-coordinate of the explosion */
  x: number;
  /** Y-coordinate of the explosion */
  y: number;
  /** The game stage to apply the effect to */
  stage: Stage;
  /** Radius of the explosion (default: 100) */
  radius?: number;
  /** Duration of the explosion animation in milliseconds (default: 1000) */
  duration?: number;
  /** Color of the explosion (default: '#ff4040') */
  color?: string;
  /** Resolution/detail of the explosion shape (default: 30) */
  resolution?: number;
  /** Random factor for vertex positions (0-1) (default: 0.25) */
  radiusRand?: number;
  /** Additional explosion configuration options */
  explosionConfig?: Partial<ExplosionGeneratorConfig>;
}

/**
 * Creates and adds an animated explosion effect to the stage
 */
export function explosion({
  x,
  y,
  stage,
  radius = 100,
  duration = 1000,
  color = '#ff4040',
  resolution = 30,
  radiusRand = 0.25,
  explosionConfig = {}
}: ExplosionParams): ExplosionEffect {

  // Create the explosion effect
  const effect = new ExplosionEffect({
    position: { x, y },
    radius,
    duration,
    color,
    resolution,
    radiusRand,
    explosionConfig
  });
  
  stage.stepEffects.push(effect);
  stage.graphics.addOverLayer(effect);
  
  return effect;
} 