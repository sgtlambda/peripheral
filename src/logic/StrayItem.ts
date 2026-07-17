import {Vector} from 'matter-js';

import {HasStep, StepContext} from "../types";
import ItemType from "./ItemType";
import PhysicalItem from "./PhysicalItem";

class StrayItem extends PhysicalItem implements HasStep {

  public readonly itemType: ItemType;
  private cooldown: number;

  constructor({itemType, x, y, velocity, cooldown = 0}: {
    itemType: ItemType,
    x: number,
    y: number,
    velocity?: Vector;
    cooldown?: number,
  }) {
    super({x, y, velocity});
    this.itemType = itemType;
    this.cooldown = cooldown;
  }

  isReady() {
    return this.cooldown <= 0;
  }

  step({event}: StepContext) {
    if (this.cooldown >= 0) this.cooldown -= event.delta;
  }
}

export default StrayItem;
