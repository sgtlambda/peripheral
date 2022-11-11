import {Vector, Vertices} from "matter-js";
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
      if (Vertices.area(path, true) < 40) return;
      const name      = `${planet.name}.${index}`;
      console.log('making new planet. number of vertices: ', path.length);
      const newPlanet = new Planet({
        vertices: path,
        name:     name,
        density:  planet.density,
        radius:   planet.radius,
      });
      stage.addPlanet(newPlanet);
    });
  });
}