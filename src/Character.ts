import {Bodies, Body, Events, World} from 'matter-js';

import {cPlayer, cTerrain} from './data/collisionGroups';

import debugRender from './data/debugRender';

import Stage from "./logic/Stage";

export type CharacterConstructorProps = {
  x: number,
  y: number,
  stage: Stage,
  radius: number,
  friction: number,
};

class Character {

  public readonly stage: Stage;

  public collider: Body;

  public readonly friction: number;

  private _eBeforeStep: any; // TODO
  private _eAfterStep: any; // TODO

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

  beforeStep() {
  }

  afterStep() {
  }

  get position() {
    return this.collider.position;
  }

  provision(world) {
    World.add(world, [this.collider]);
    return this;
  }

  attach(engine) {
    this._eBeforeStep = this.beforeStep.bind(this);
    this._eAfterStep  = this.afterStep.bind(this);
    Events.on(engine, 'beforeUpdate', this._eBeforeStep);
    Events.on(engine, 'beforeUpdate', this._eAfterStep);
    return this;
  }

  detach(engine) {
    Events.off(engine, 'beforeUpdate', this._eBeforeStep);
    Events.off(engine, 'beforeUpdate', this._eAfterStep);
    this._eBeforeStep = null;
    this._eAfterStep  = null;
  }
}

export default Character;