import {Vector, Vertices} from "matter-js";
import {cloneDeep} from "lodash";
import Planet from "../Planet";
import Stage from "../Stage";

import {subtract} from "../../common/terrainOps";

/**
 * Take a "bite" out of all planets on the given stage, with the given shape
 */
export function nom(stage: Stage, bite: Vector[]) {
  stage.planets.forEach(planet => {

    const currentVertices = planet.getCurrentVertices();

    stage.removePlanet(planet);

    const paths = subtract(currentVertices, bite);

    paths.map((path, index) => {

      if (Vertices.area(path, true) < 1) return;

      const name = `${planet.name}.${index}`;

      const c1 = Vertices.centre(path);

      const translated = Vertices.translate(cloneDeep(path), Vector.neg(c1), 1);

      const newPlanet = new Planet({
        x:        c1.x,
        y:        c1.y,
        vertices: translated,
        name:     name,
        density:  planet.density,
      });

      stage.addPlanet(newPlanet);
    });
  });
}