import {Bodies, Body} from 'matter-js';

import debugRender from '../data/debugRender';

import {cItems, cTerrain} from '../data/collisionGroups';
import {HasStep} from "../types";
import {ItemType} from "../todoTypes";
import {EngineStep} from "../engineStep";
import InteractionHandler from "./InteractionHandler";

class StrayItem implements HasStep {

  // src/rendering/layers/uiLayers.js:83
  private readonly itemType: ItemType;
  private cooldown: number;
  private collider: Body;

  constructor({itemType, x, y, velocity = null, cooldown = 0}) {
    this.itemType = itemType;
    this.cooldown = cooldown;
    this.prepareBodies({x, y, velocity});
  }

  prepareBodies({x, y, velocity = null, radius = 8}) {
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