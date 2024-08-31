import {Bodies, Body, Vector} from 'matter-js';

import debugRender from '../data/debugRender';

import {cItems, cTerrain} from '../data/collisionGroups';
import {HasStep} from "../types";
import {ItemType} from "../todoTypes";
import {EngineStep} from "../engineStep";
import InteractionHandler from "./InteractionHandler";

class StrayItem implements HasStep {

  // src/rendering/layers/uiLayers.js:83
  public readonly itemType: ItemType;
  private cooldown: number;
  private collider!: Body;

  // TODO this shares a lot of logic with `Throwable`, deduplicate or create common superclass

  constructor({itemType, x, y, velocity, cooldown = 0}: {
    itemType: ItemType,
    x: number,
    y: number,
    velocity?: Vector;
    cooldown?: number,
  }) {
    this.itemType = itemType;
    this.cooldown = cooldown;
    this.prepareBodies({x, y, velocity});
  }

  prepareBodies({x, y, velocity, radius = 8}: {
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

  isReady() {
    return this.cooldown <= 0;
  }

  get position() {
    return this.collider.position;
  }

  step(event: EngineStep, interactionHandler: InteractionHandler) {
    if (this.cooldown >= 0) this.cooldown -= event.delta;
  }
}

export default StrayItem;