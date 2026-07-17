import {Vector} from 'matter-js';

import debugRender from '../data/debugRender';
import {HasStep, StepContext} from "../types";
import {shouldBlink} from "../common/blink";
import PhysicalItem from "./PhysicalItem";

export type ThrowableTriggerHandler = ({position, throwable, ctx}: {
  position: Vector;
  throwable: Throwable;
  ctx: StepContext;
}) => void;

/**
 * A physics based item with a lifetime that calls the `trigger` function when it reaches 0.
 */
export class Throwable extends PhysicalItem implements HasStep {

  public readonly name: string;

  private ttl: number;

  private readonly trigger: ThrowableTriggerHandler;

  constructor({name, x, y, radius, velocity, trigger, ttl, density}: {
    name: string;
    x: number;
    y: number;
    radius: number;
    velocity?: Vector;
    trigger: ThrowableTriggerHandler;
    ttl: number;
    density?: number;
  }) {
    super({x, y, radius, velocity, density});
    this.name    = name;
    this.ttl     = ttl;
    this.trigger = trigger;
  }

  step(ctx: StepContext) {
    this.ttl -= ctx.event.delta;
    this.collider.render.strokeStyle = !shouldBlink(this.ttl) ? 'white' : debugRender.strokeStyle;
    this.collider.render.fillStyle   = !shouldBlink(this.ttl) ? 'white' : debugRender.fillStyle;
    if (this.ttl <= 0) {
      this.trigger({position: {...this.position}, throwable: this, ctx});
      ctx.stage.removeThrowable(this);
    }
  }
}

export default Throwable;
