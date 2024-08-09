import {Bodies, Body, Vector, Vertices} from 'matter-js';
import {cloneDeep} from "lodash";

import circleVertices from '../common/circleVertices';
import {cTerrain} from '../data/collisionGroups';

export default class Planet {

  name: string;
  body: Body;
  sourceVertices: Vector[];

  density: number;
  color: string;

  sourcePosition: Vector;

  constructor(
    {
      x = 0,
      y = 0,
      vertices,
      name,
      color,
      density = .001,
      isStatic = true,
    }: {
      x?: number;
      y?: number;
      vertices: Vector[];
      name: string;
      density?: number;
      isStatic?: boolean;
      color: string;
    },
  ) {

    this.name = name;

    const centroid = Vertices.centre(vertices);

    this.sourceVertices = vertices.map(v => ({
      x: v.x - centroid.x,
      y: v.y - centroid.y,
    }));

    this.body = Bodies.fromVertices(
      x + centroid.x,
      y + centroid.y,
      cloneDeep(this.sourceVertices),
      {
        render:          {
          fillStyle:   color,
          strokeStyle: color,
          lineWidth:   1,
        },
        collisionFilter: {category: cTerrain},
        density,
        friction:        .99,
        isStatic:        false,
      }
    );

    if (isStatic) {
      // This solves a weird positioning bug, no idea why
      this.body.isStatic = true;
    }

    this.sourceVertices = vertices;

    this.body.label = "planet";

    // For descendent planets
    this.density = density;
    this.color   = color;

    this.lockSourcePosition();
  }

  lockSourcePosition() {
    this.sourcePosition = {...this.body.position};
  }

  getCurrentVertices() {
    const v = Vertices.translate(
      cloneDeep(this.sourceVertices),
      this.movement,
      1,
    );
    Vertices.rotate(v, this.body.angle, this.body.position);
    return v;
  }

  get movement() {
    return Vector.sub(this.body.position, this.sourcePosition);
  }

  static createCircular({name, radius, density, resolution = 124, rand = 0, x = 0, y = 0, color}: {
    name: string, radius: number, density: number, resolution?: number, rand?: number, x?: number, y?: number, color,
  }) {
    const vertices = circleVertices(radius, resolution, rand);
    return new Planet({x, y, name, vertices, density, color});
  }
}