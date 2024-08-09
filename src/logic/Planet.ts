import {Bodies, Body, Vector, Vertices} from 'matter-js';
import {cloneDeep} from "lodash";

import circleVertices from '../common/circleVertices';
import {cTerrain} from '../data/collisionGroups';
import Color from "color";

export default class Planet {

  name: string;
  body: Body;
  sourceVertices: Vector[];

  density: number;
  color: string;
  integrity?: number;

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
      integrity = 1,
    }: {
      x?: number;
      y?: number;
      vertices: Vector[];
      name: string;
      density?: number;
      isStatic?: boolean;
      color: string;
      integrity?: number;
    },
  ) {

    this.name = name;

    const centroid = Vertices.centre(vertices);

    this.sourceVertices = vertices.map(v => ({
      x: v.x - centroid.x,
      y: v.y - centroid.y,
    }));

    // TODO if we use 'alpha' / opacity here, the rendering of the stroke will cause
    //  outlines to appear. This is because the stroke is drawn on top of the fill
    //  if we don't use outlines, it looks as if there are gaps between the planets
    const actualColor = Color(color).darken((1 - integrity) * .6).rgb().string();

    const bodyX = x + centroid.x;
    const bodyY = y + centroid.y;

    this.body = Bodies.fromVertices(
      0,
      0,
      cloneDeep(this.sourceVertices),
      {
        render:          {
          fillStyle:   actualColor,
          strokeStyle: actualColor,
          lineWidth:   1,
          // opacity:     integrity,
        },
        collisionFilter: {category: cTerrain},
        density,
        friction:        .99,
        isStatic:        false,
      },
    );

    // Set the final position
    Body.setPosition(this.body, {x: bodyX, y: bodyY});

    this.body.isStatic = isStatic;

    this.sourceVertices = vertices;

    this.body.label = "planet";

    // For descendent planets
    this.density   = density;
    this.color     = color;
    this.integrity = integrity;

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
    name: string,
    radius: number,
    density: number,
    resolution?: number,
    rand?: number,
    x?: number,
    y?: number,
    color: string,
  }) {
    const vertices = circleVertices(radius, resolution, rand);
    return new Planet({x, y, name, vertices, density, color});
  }
}