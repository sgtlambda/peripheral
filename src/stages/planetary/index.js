import {Bodies} from 'matter-js';
import {range} from "lodash";

import Stage from '../../logic/Stage';
import Planet from '../../logic/Planet';

export default () => {

    const radius = 5000;

    const stage = new Stage({x: 400, y: -radius - 100});

    stage.addPlanet(Planet.createCircular({
        name:       'moon',
        radius,
        resolution: 50,
        rand:       0,
    }));

    const boxes = [];

    // Add a bunch of boxes...
    const boxSize = 30;

    const boxMatrix = range(-2, 2).flatMap(x => {
        return range(-2, 0).map(y => [x, y]);
    });

    for (const [bx, by] of boxMatrix) {
        boxes.push([
            bx * boxSize,
            -radius + by * boxSize,
        ]);
    }

    boxes.forEach(([x, y]) => {
        stage.addTerrainBody(Bodies.rectangle(x, y, boxSize * .9, boxSize * .9, {
            render: {fillStyle: '#6171a2'},
        }));
    });

    return stage;
}