import {Bodies, Body, Vector, Vertices} from 'matter-js';

import circleVertices from '../common/circleVertices';
import {planetDebugRender} from '../data/debugRender';
import {cTerrain} from '../data/collisionGroups';

export default class Planet {

  name: string;
  body: Body;
  sourceVertices: Vector[];

  density: number;
  radius: number;

  constructor({
                x = 0, y = 0, vertices,
                name, radius, density
              }) {

    this.name = name;

    this.sourceVertices = vertices;

    const offsetX = vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length
    const offsetY = vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length

    console.log({offsetX, offsetY});

    this.body = Bodies.fromVertices(0, 0, vertices, {
      render:          planetDebugRender,
      collisionFilter: {category: cTerrain},
      density,
      isStatic:        true,
    });

    setTimeout(() => {
      console.log({
        v: vertices[0].y,
        vl: vertices.length,
        bto: this.body.bounds.min.y,
      });
    }, 1000);

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
    return this.sourceVertices;
    // const v = Vertices.translate(cloneDeep(this.sourceVertices), this.movement, 1);
    // Vertices.rotate(v, this.body.angle, this.body.position);
    // return v;
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