import {Bodies, Body, Vector, Vertices} from 'matter-js';
import {clone, cloneDeep} from "lodash";

import circleVertices from '../common/circleVertices';
import {planetDebugRender} from '../data/debugRender';
import {cTerrain} from '../data/collisionGroups';

export default class Planet {

  name: string;
  body: Body;
  sourceVertices: Vector[];

  density: number;
  radius: number;

  origin: Vector;

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

    this.body = createBody(-(tempBody.bounds.min.x + tempBody.bounds.max.x) / 2, -(tempBody.bounds.min.y + tempBody.bounds.max.y) / 2);

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
    return cloneDeep(this.body.vertices)
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