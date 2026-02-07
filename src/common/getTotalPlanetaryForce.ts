import {Body, Vector} from 'matter-js';
import Planet from '../logic/Planet';

/**
 * Calculate the total gravitational force from all planets acting on a body
 */
export default function getTotalPlanetaryForce(planets: Planet[], body: Body) {
  return planets.reduce((force, planet) => {
    return Vector.add(force, planet.getGravityForce(body));
  }, {x: 0, y: 0} as Vector);
}
