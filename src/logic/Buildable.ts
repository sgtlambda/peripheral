import Matter, {Bodies} from 'matter-js';

import Building from './Building';

const DEFAULT_BUILDABLE_SIZE = 32;

export type BuildOpts = { x: number, y: number, angle: number };

export type MakeCollider = (opts: BuildOpts, buildable: Buildable) => Matter.Body;

export const defaultMakeCollider: MakeCollider = opts => {
  return Bodies.rectangle(opts.x, opts.y, DEFAULT_BUILDABLE_SIZE, DEFAULT_BUILDABLE_SIZE, {
    angle:  opts.angle,
    render: {
      fillStyle:   'transparent',
      strokeStyle: '#eee',
      lineWidth:   1,
    },
  });
};

/**
 * Prototype for an item that can be "built" (i.e. placed in the world)
 */
export default class Buildable {

  public readonly name: string;
  protected readonly makeCollider: MakeCollider;

  constructor(opts: {
    name: string,
    makeCollider?: MakeCollider,
  }) {
    this.name         = opts.name;
    this.makeCollider = opts.makeCollider ?? defaultMakeCollider;
  }

  public toBuilding({x, y, angle}: BuildOpts): Building {
    const body = this.makeCollider({x, y, angle}, this);
    return new Building({buildable: this, body});
  }
}