import {Bodies} from 'matter-js';
import {range} from "lodash";

import Stage from '../../logic/Stage';
import Planet from '../../logic/Planet';

export default () => {

    const radius = 500;

    const stage = new Stage({x: 0, y: -radius - 50});

    stage.addPlanet(Planet.createCircular({
        name:       'moon',
        radius,
        resolution: 6,
        rand:       0,
    }));

    // const boxes = [];
    //
    // // Add a bunch of boxes...
    // const boxSize = 30;
    //
    // const boxMatrix = range(-3, 3).flatMap(x => {
    //     return range(-4, 0).map(y => [x, y]);
    // });
    //
    // for (const [bx, by] of boxMatrix) {
    //     boxes.push([
    //         bx * boxSize,
    //         -radius + by * boxSize,
    //     ]);
    // }
    //
    // boxes.forEach(([x, y]) => {
    //     stage.addTerrainBody(Bodies.rectangle(x, y, boxSize * .99, boxSize * .9, {
    //         render: {fillStyle: '#6171a2'},
    //     }));
    // });

    return stage;
}