import {Vector, Vertices} from "matter-js";
import {cloneDeep, sortBy} from "lodash";
import Planet from "../Planet";
import Stage from "../Stage";

import {subtract} from "../../common/terrainOps";

/**
 * Take a "bite" out of all planets on the given stage, with the given shape
 */
export function nom(stage: Stage, bite: Vector[]) {

  stage.planets.forEach(planet => {

    const currentVertices = planet.getCurrentVertices();
    const paths           = subtract(cloneDeep(currentVertices), bite);

    if (paths.length === 1 && paths[0].length === planet.getCurrentVertices().length) {
      // No modifications to this planet were made
      return;
    }

    stage.removePlanet(planet);

    const orderedPaths = sortBy(paths, path => -Vertices.area(path, true));

    const mainPath = orderedPaths[0];

    paths.forEach((path, index) => {

      const name = `${planet.name}.${index}`;

      const isMain = path === mainPath;

      const isStatic = isMain && planet.body.isStatic;

      const newPlanet = new Planet({
        vertices:  path,
        name:      name,
        density:   planet.density,
        isStatic:  isStatic,
        color:     planet.color,
        integrity: planet.integrity * (isStatic ? 1 : .8),
      });

      stage.addPlanet(newPlanet);
    });
  });
}