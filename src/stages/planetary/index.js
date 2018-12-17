import {Bodies} from 'matter-js';

import Stage from '../../logic/Stage';

import Planet from '../../logic/Planet';

export default () => {

    const radius = 400;

    const stage = new Stage({
        initialPlayerPos: {x: 0, y: -radius - 100},
    });

    stage.addPlanet(Planet.createCircular({
        name:       'moon',
        radius,
        resolution: 32,
        rand:       .2
    }));

    const boxes = [];

    // Add a bunch of boxes...
    const boxSize = 24;
    [
        [-5, 2], [-4, 2],
        [-5, 3], [-4, 3],
    ].forEach(([bx, by]) => {
        boxes.push([bx * boxSize,
            -radius - 238.4820728 + by * boxSize]);
    });

    boxes.forEach(([x, y]) => {
        stage.addTerrainBody(Bodies.rectangle(x, y, boxSize, boxSize, {
            render: {fillStyle: '#b2b2b0'}
        }));
    });

    return stage;
}