import {Vector} from 'matter-js';

/**
 * @param {Planet[]} planets
 * @param body
 */
export default (planets, body) => {
    return planets.reduce((force, planet) => {
        return Vector.add(force, planet.getGravityForce(body));
    }, {x: 0, y: 0})
};