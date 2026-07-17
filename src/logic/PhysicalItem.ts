import {Bodies, Body, Vector} from 'matter-js';

import debugRender from '../data/debugRender';
import {cItems, cTerrain} from '../data/collisionGroups';

export type PhysicalItemProps = {
  x: number;
  y: number;
  radius?: number;
  velocity?: Vector;
  density?: number;
};

/**
 * A loose physics-backed object in the world; the shared base for
 * stray (droppable/pickable) items and armed throwables.
 */
export default class PhysicalItem {

  protected readonly collider: Body;

  constructor({x, y, radius = 8, velocity, density}: PhysicalItemProps) {
    this.collider = Bodies.circle(x, y, radius, {
      restitution:     .5,
      inertia:         Infinity,
      render:          debugRender,
      ...density ? {density} : {},
      collisionFilter: {
        category: cItems,
        mask:     cTerrain | cItems,
      },
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
}
