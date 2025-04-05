import {Vector} from "matter-js";

import {StageGraphicsLayer} from "./logic/StageGraphics";
import {HasStep} from "./types";
import {EngineStep} from "./engineStep";
import InteractionHandler from "./logic/InteractionHandler";

export type FlashEffectProps = {
  duration: number;
  color?: string;
  polygon: Vector[];
};

/**
 * Temporarily renders some polygon to the screen, like a flash of light.
 * TODO CLEAN UP after lifecycle!!!!
 */
export class FlashEffect implements StageGraphicsLayer, HasStep {

  private readonly duration: number;
  private readonly color: string;
  private readonly polygon: Vector[];

  private timeLeft: number;

  constructor(
    {
      duration,
      color = "white",
      polygon,
    }: FlashEffectProps) {

    this.duration = duration;
    this.color    = color;
    this.polygon  = polygon;

    this.timeLeft = duration;
  }

  drawTo({context}: { context: CanvasRenderingContext2D }): void {
    if (this.isFinished) return;
    const opacity = this.timeLeft / this.duration;
    context.save();
    context.fillStyle   = this.color;
    context.globalAlpha = opacity;
    context.beginPath();
    this.polygon.forEach((v, i) => {
      if (i === 0) {
        context.moveTo(v.x, v.y);
      } else {
        context.lineTo(v.x, v.y);
      }
    });
    context.closePath();
    context.fill();
    context.restore();
  }

  step(event: EngineStep, handler: InteractionHandler): void {
    this.timeLeft -= event.delta;
  }

  get isFinished(): boolean {
    return this.timeLeft <= 0;
  }
}