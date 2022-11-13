import {Vector} from "matter-js";
import {cloneDeep} from "lodash";
import Planet from "../Planet";
import Stage from "../Stage";

import {subtract} from "../../common/terrainOps";

/**
 * Take a "bite" out of all planets on the given stage, with the given shape
 */
export function nom(stage: Stage, bite: Vector[]) {
  stage.planets.forEach(planet => {

    stage.removePlanet(planet);
    const currentVertices = planet.getCurrentVertices();

    const paths = subtract(cloneDeep(currentVertices), bite);

    if (paths.length > 1) {
      console.log({paths});
    }

    paths.forEach((path, index) => {

      const name = `${planet.name}.${index}`;

      const newPlanet = new Planet({
        vertices: path,
        name:     name,
        density:  planet.density,
      });

      stage.addPlanet(newPlanet);
    });
  });
}