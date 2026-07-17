import {Bodies, Body, World} from 'matter-js';

import {cPlayer, cTerrain} from './data/collisionGroups';

import debugRender from './data/debugRender';

import Stage from "./logic/Stage";

import {WorldPart} from "./types";

export type CharacterConstructorProps = {
  x: number,
  y: number,
  stage: Stage,
  radius?: number,
  friction?: number,
};

class Character implements WorldPart {

  public readonly stage: Stage;

  public collider!: Body;

  public readonly friction: number;

  constructor(
    {
      x, y,
      stage,
      radius = 16,
      friction = .5,
    }: CharacterConstructorProps) {

    this.stage    = stage;
    this.friction = friction;
    this.prepareBodies({x, y, radius});
  }

  get body() {
    return this.collider;
  }

  prepareBodies({x, y, radius}: { x: number, y: number, radius: number }) {
    this.collider = Bodies.circle(x, y, radius, {
      friction:        this.friction,
      inertia:         Infinity,
      render:          debugRender,
      collisionFilter: {
        category: cPlayer,
        mask:     cTerrain,
      },
    });
  }

  get position() {
    return this.collider.position;
  }

  provision(world: World) {
    World.add(world, [this.collider]);
    return this;
  }
}

export default Character;
