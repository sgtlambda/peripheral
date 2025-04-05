import {Vector} from "matter-js";

import {StageGraphicsLayer} from "./logic/StageGraphics";
import {HasStep} from "./types";
import {EngineStep} from "./engineStep";
import InteractionHandler from "./logic/InteractionHandler";
import {ExplosionGenerator, ExplosionGeneratorConfig, generateAnimatedExplosion} from "./common/explosion";
import {renderExplosion} from "./common/renderExplosion";

export type ExplosionEffectProps = {
  /** Duration of the explosion effect in milliseconds */
  duration: number;
  /** Position of the explosion center */
  position: Vector;
  /** The explosion radius */
  radius: number;
  /** Color of the explosion */
  color?: string;
  /** Resolution of the explosion (number of vertices) */
  resolution?: number;
  /** Random factor for vertex positions (0-1) */
  radiusRand?: number;
  /** Additional explosion configuration */
  explosionConfig?: Partial<ExplosionGeneratorConfig>;
};

/**
 * Creates an animated explosion effect
 * Implements both StageGraphicsLayer for rendering and HasStep for animation updates
 */
export class ExplosionEffect implements StageGraphicsLayer, HasStep {
  /** The original position of the explosion */
  private readonly position: Vector;
  /** The explosion color */
  private readonly color: string;
  /** Total duration of the effect in milliseconds */
  private readonly duration: number;
  /** The explosion generator with all animation data */
  private readonly explosionGenerator: ExplosionGenerator;
  
  /** Time elapsed since creation */
  private timeElapsed: number = 0;
  /** Normalized time value (0-1) for animation progress */
  private normalizedTime: number = 0;

  /**
   * Create a new explosion effect
   */
  constructor({
    position,
    radius,
    duration,
    color = 'white',
    resolution = 30,
    radiusRand = 0.25,
    explosionConfig = {}
  }: ExplosionEffectProps) {
    this.position = position;
    this.color = color;
    this.duration = duration;
    
    // Generate the explosion with combined configuration
    this.explosionGenerator = generateAnimatedExplosion({
      radius,
      resolution,
      radiusRand,
      rotateRand: true,
      ...explosionConfig
    });
  }

  /**
   * Get the original shape of the explosion (for physics, etc.)
   */
  get originalShape(): Vector[] {
    return this.explosionGenerator.originalShape;
  }

  /**
   * Draw the explosion to the provided canvas context
   */
  drawTo({context}: { context: CanvasRenderingContext2D }): void {
    if (this.isFinished) return;

    // Calculate opacity based on progress
    // Start fading out at `fadeStart` normalized time
    const fadeStart = 0.4;
    const opacity = this.normalizedTime > fadeStart
      ? 1 - ((this.normalizedTime - fadeStart) / (1 - fadeStart))
      : 1;

    // Save the context state
    context.save();
    
    // Set the global alpha for fading
    context.globalAlpha = opacity;

    // Generate the current explosion paths based on normalized time
    const explosionPaths = this.explosionGenerator.generate(this.normalizedTime);
    
    // Render using our specialized renderer
    renderExplosion(context, explosionPaths, {
      fillStyle: this.color,
      centerX: this.position.x,
      centerY: this.position.y
    });
    
    // Restore the context
    context.restore();
  }

  /**
   * Update the animation state
   */
  step(event: EngineStep, handler: InteractionHandler): void {
    // Update the elapsed time
    this.timeElapsed += event.delta;
    
    // Calculate normalized time (0-1) clamped at 1
    this.normalizedTime = Math.min(1, this.timeElapsed / this.duration);

    console.log({
      elapsed: this.timeElapsed,
      normalized: this.normalizedTime,
    })
  }

  /**
   * Check if the effect has finished playing
   */
  get isFinished(): boolean {
    return this.timeElapsed >= this.duration;
  }
} 