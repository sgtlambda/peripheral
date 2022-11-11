import {Bodies, Body, Bounds, Vector} from 'matter-js';
import {cloneDeep} from "lodash";

import circleVertices from '../common/circleVertices';
import {planetDebugRender} from '../data/debugRender';
import {cTerrain} from '../data/collisionGroups';

let hasGcv = false;

export default class Planet {

  name: string;
  body: Body;
  sourceVertices: Vector[];

  density: number;
  radius: number;

  xOffset: number;
  yOffset: number;

  constructor({
                x = 0, y = 0, vertices,
                name, radius, density
              }) {

    this.name = name;

    this.sourceVertices = cloneDeep(vertices);

    const createBody = (x: number = 0, y: number = 0) => Bodies.fromVertices(x, y, cloneDeep(vertices), {
      render:          planetDebugRender,
      collisionFilter: {category: cTerrain},
      density,
      isStatic:        true,
    });

    const tempBody = createBody();

    this.xOffset = -(tempBody.bounds.min.x + tempBody.bounds.max.x);
    this.yOffset = -(tempBody.bounds.min.y + tempBody.bounds.max.y);

    this.body = createBody(this.xOffset / 2, this.yOffset / 2);

    // console.log({
    //   x: this.body.position.x,
    //   y: this.body.position.y,
    //   xoff: this.xOffset,
    //   yoff: this.yOffset,
    //   // actualBody: this.body.vertices.map(v => `${v.x} ${v.y}`),
    //   // source:     this.sourceVertices.map(v => `${v.x} ${v.y}`),
    //   // xbx:        Bounds.create(this.body.vertices).min.x - Bounds.create(this.sourceVertices).min.x,
    //   // xby:        Bounds.create(this.body.vertices).min.y - Bounds.create(this.sourceVertices).min.y,
    // })

    this.body.label = "planet";

    // For descendent planets
    this.radius  = radius;
    this.density = density;

    // For static bodies, the mass is set to 'Infinity' which breaks the gravitational
    // formula, so we have to manually define the mass of the planet
    // this.lockSourcePosition();
    // this.lockEpicenter();
  }

  // lockSourcePosition() {
  //   this.sourcePosition = {...this.body.position};
  // }

  // lockEpicenter() {
  //   this.epicenter = Math.sqrt(this.body.area) / 1.5;
  // console.log(this.epicenter);
  // }

  getCurrentVertices() {
    // return this.sourceVertices;
    // const v = Vertices.translate(cloneDeep(this.sourceVertices), this.movement, 1);
    // Vertices.rotate(v, this.body.angle, this.body.position);
    // return cloneDeep(this.body.vertices)
    // if(!hasGcv) {
    //   console.log({
    //     gcv: cloneDeep(this.sourceVertices),
    //   });
    //   hasGcv =true;
    // }
    // return cloneDeep(this.sourceVertices);
    return cloneDeep(this.sourceVertices).map(v => ({
      x: v.x - this.xOffset + this.body.position.x * 2,
      y: v.y - this.yOffset + this.body.position.y * 2,
    }));
  }

  // get movement() {
  //   return Vector.sub(this.body.position, this.sourcePosition);
  // }

  // get centerOfMass() {
  //   return this.body.position;
  // }

  static createCircular({name, radius, density = .001, resolution = 124, rand = 0, x = 0, y = 0}) {
    const vertices = circleVertices(radius, resolution, rand);
    return new Planet({name, x, y, vertices, density, radius});
  }
}