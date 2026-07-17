import {Vector} from "matter-js";

import {StageGraphicsLayer} from "./logic/StageGraphics";
import {HasStep, StepContext} from "./types";
import {FlameGenerator, FlameGeneratorConfig, generateAnimatedFlame} from "./common/butaneFlame";
import {renderFlame} from "./common/renderFlame";

export type ButaneFlameEffectProps = {
  /** Position of the nozzle the flame is emitted from */
  position: Vector;
  /** Emission direction in radians (0 = +x, -π/2 = up) */
  direction?: number;
  /** How far the flame reaches from the nozzle */
  reach: number;
  /** Solid flame colour */
  color: string;
  /**
   * Optional lifetime in milliseconds. When omitted the flame burns until
   * `stop()` is called; when set it auto-extinguishes after `duration`.
   */
  duration?: number;
  /** Duration of the extinguish fade-out in milliseconds (default: 200) */
  fadeOut?: number;
  /** Additional flame configuration */
  flameConfig?: Partial<FlameGeneratorConfig>;
};

/**
 * A continuously burning butane flame, as emitted from a jetpack or torch.
 * Implements both StageGraphicsLayer for rendering and HasStep for animation.
 *
 * Unlike the one-shot ExplosionEffect, a flame has no fixed shape lifecycle: it
 * loops until either its optional `duration` elapses or `stop()` is called, at
 * which point it fades out over `fadeOut` milliseconds before finishing.
 */
export class ButaneFlameEffect implements StageGraphicsLayer, HasStep {
  private readonly position: Vector;
  private readonly color: string;
  private readonly duration?: number;
  private readonly fadeOut: number;
  private readonly flameGenerator: FlameGenerator;

  /** Time elapsed since creation, in milliseconds */
  private timeElapsed = 0;
  /** Timestamp (ms since creation) at which the flame began extinguishing */
  private stoppedAt?: number;

  constructor(
    {
      position,
      direction = -Math.PI / 2,
      reach,
      color,
      duration,
      fadeOut = 200,
      flameConfig = {},
    }: ButaneFlameEffectProps) {
    this.position = position;
    this.color    = color;
    this.duration = duration;
    this.fadeOut  = fadeOut;

    this.flameGenerator = generateAnimatedFlame({
      reach,
      direction,
      ...flameConfig,
    });
  }

  /**
   * Begin extinguishing the flame. It fades out over `fadeOut` ms, then finishes.
   */
  stop(): void {
    if (this.stoppedAt === undefined) this.stoppedAt = this.timeElapsed;
  }

  /** How far through the extinguish fade we are (0 = burning, 1 = gone) */
  private get fadeProgress(): number {
    if (this.stoppedAt === undefined) return 0;
    return Math.min(1, (this.timeElapsed - this.stoppedAt) / this.fadeOut);
  }

  drawTo({context}: { context: CanvasRenderingContext2D }): void {
    if (this.isFinished) return;

    context.save();
    context.globalAlpha = 1 - this.fadeProgress;

    // Flame time is measured in seconds; the generator loops on it.
    const shape = this.flameGenerator.generate(this.timeElapsed / 1000);

    renderFlame(context, shape, {
      color:   this.color,
      originX: this.position.x,
      originY: this.position.y,
    });

    context.restore();
  }

  step({event}: StepContext): void {
    this.timeElapsed += event.delta;

    // Auto-extinguish once the optional lifetime is up.
    if (this.duration !== undefined && this.timeElapsed >= this.duration) {
      this.stop();
    }
  }

  get isFinished(): boolean {
    return this.fadeProgress >= 1;
  }
}
