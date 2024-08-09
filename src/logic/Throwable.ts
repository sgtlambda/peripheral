import {Bodies, Body, Vector} from 'matter-js';

import debugRender from '../data/debugRender';

import {cItems, cTerrain} from '../data/collisionGroups';
import {HasStep} from "../types";
import InteractionHandler from "./InteractionHandler";
import {EngineStep} from "../engineStep";
import {shouldBlink} from "../common/blink";

export type ThrowableTriggerHandler = ({position, throwable, interactionHandler}: {
  position: Vector;
  throwable: Throwable;
  interactionHandler: InteractionHandler;
}) => void;

/**
 * A physics based item with a lifetime that calls the `trigger` function when it reaches 0.
 */
export class Throwable implements HasStep {

  private readonly name: string;

  // TODO convert to time-based (using the event thing in step)
  private ttl: number;

  private collider: Body;

  private readonly trigger: ThrowableTriggerHandler;

  constructor({name, x, y, velocity = null, trigger, ttl}: {
    name: string;
    x: number;
    y: number;
    velocity?: Vector;
    trigger: ThrowableTriggerHandler;
    ttl: number;
  }) {
    this.name    = name;
    this.ttl     = ttl;
    this.trigger = trigger;
    this.prepareBodies({x, y, velocity});
  }

  prepareBodies({x, y, velocity = null, radius = 8}: {
    x: number;
    y: number;
    velocity?: Vector;
    radius?: number;
  }) {
    this.collider = Bodies.circle(x, y, radius, {
      restitution:     .5,
      inertia:         Infinity,
      render:          debugRender,
      collisionFilter: {
        category: cItems,
        mask:     cTerrain | cItems,
      }
    });
    if (velocity) {
      Body.setVelocity(this.collider, velocity);
    }
  }

  getCollider() {
    return this.collider;
  }

  get position(): Vector {
    return this.collider.position;
  }

  step(event: EngineStep, interactionHandler: InteractionHandler) {
    this.ttl -= event.delta;
    this.collider.render.strokeStyle = !shouldBlink(this.ttl) ? 'white' : debugRender.strokeStyle;
    if (this.ttl <= 0) {
      this.trigger({position: {...this.position}, throwable: this, interactionHandler});
      interactionHandler.stage.removeThrowable(this);
    }
  }
}

export default Throwable;