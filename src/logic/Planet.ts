import {Bodies, Body, Vector, Vertices} from 'matter-js';
import {cloneDeep} from "lodash";

import circleVertices from '../common/circleVertices';
import {planetDebugRender} from '../data/debugRender';
import {cTerrain} from '../data/collisionGroups';

const listVertices = (v: Vector[]): string => {
  return v.map(v => `x ${v.x} y ${v.y} `).join('\n');
};

export default class Planet {

  name: string;
  body: Body;
  sourceVertices: Vector[];

  density: number;

  constructor(
    {
      x = 0,
      y = 0,
      vertices,
      name,
      density = .1,
    }: {
      x?: number;
      y?: number;
      vertices: Vector[];
      name: string;
      density?: number;
    }
  ) {

    this.name = name;

    const centroid = Vertices.centre(vertices);

    this.sourceVertices = vertices.map(v => ({
      x: v.x - centroid.x,
      y: v.y - centroid.y,
    }));

    this.body = Bodies.fromVertices(x + centroid.x, y + centroid.y, cloneDeep(this.sourceVertices), {
      render:          planetDebugRender,
      collisionFilter: {category: cTerrain},
      density,
      isStatic:        true,
    });

    this.body.label = "planet";

    // For descendent planets
    this.density = density;
  }

  getCurrentVertices() {
    return cloneDeep(this.sourceVertices).map(v => ({
      x: v.x + this.body.position.x,
      y: v.y + this.body.position.y,
    }));
  }

  static createCircular({name, radius, density, resolution = 124, rand = 0, x = 0, y = 0}) {
    const vertices = circleVertices(radius, resolution, rand);
    return new Planet({x, y, name, vertices, density});
  }
}