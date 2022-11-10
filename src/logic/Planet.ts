import {Bodies, Body, Vector, Vertices} from 'matter-js';
import {cloneDeep} from 'lodash';

import circleVertices from '../common/circleVertices';
import {planetDebugRender} from '../data/debugRender';
import {cTerrain} from '../data/collisionGroups';

export const gravityConstant = 8e-1;

export const getPlanetaryGravity = (bodyA, bodyB, epicenter) => {
  const angle       = Vector.angle(bodyA.position, bodyB.position);
  let distance      = Vector.magnitude(Vector.sub(bodyA.position, bodyB.position));
  distance          = Math.max(distance, epicenter);
  const massProduct = bodyA.mass * bodyB.mass;
  const force       = gravityConstant * massProduct / Math.pow(distance, 2);
  return Vector.rotate({x: -force, y: 0}, angle);
};

export default class Planet {

  name: string;
  body: Body;
  sourceVertices: Vector[];
  centroid: Vector;
  sourcePosition: Vector;

  density: number;
  radius: number;
  epicenter: number;

  constructor({
                x = 0, y = 0, vertices,
                name, radius, density
              }) {

    this.name = name;

    this.sourceVertices = vertices;
    this.centroid       = Vertices.centre(this.sourceVertices);

    const pos = Vector.add({x, y}, this.centroid);

    this.body = Bodies.fromVertices(pos.x, pos.y, vertices, {
      render:          planetDebugRender,
      collisionFilter: {category: cTerrain},
      density,
    });

    this.body.label = "planet";

    // For descendent planets
    this.radius  = radius;
    this.density = density;

    // For static bodies, the mass is set to 'Infinity' which breaks the gravitational
    // formula, so we have to manually define the mass of the planet
    this.lockSourcePosition();
    this.lockEpicenter();
  }

  lockSourcePosition() {
    this.sourcePosition = {...this.body.position};
  }

  lockEpicenter() {
    this.epicenter = Math.sqrt(this.body.area) / 1.5;
    // console.log(this.epicenter);
  }

  getCurrentVertices() {
    const v = Vertices.translate(cloneDeep(this.sourceVertices), this.movement, 1);
    Vertices.rotate(v, this.body.angle, this.body.position);
    return v;
  }

  get movement() {
    return Vector.sub(this.body.position, this.sourcePosition);
  }

  get centerOfMass() {
    return this.body.position;
  }

  getGravityForce(body) {
    return getPlanetaryGravity(this.body, body, this.epicenter);
  }

  static createCircular({name, radius, density = .001, resolution = 124, rand = 0, x = 0, y = 0}) {
    const vertices = circleVertices(radius, resolution, rand);
    return new Planet({name, x, y, vertices, density, radius});
  }
}