import {Vertices} from 'matter-js';

import Stage from '../../logic/Stage';
import Planet from '../../logic/Planet';

export default () => {

    const radius = 100;

    const stage = new Stage({x: 0, y: -radius - 50});

    stage.addPlanet(Planet.createCircular({
        x:          0,
        y:          0,
        name:       'moon',
        radius,
        resolution: 10,
        rand:       0,
    }));

    const testPlanets = [
        Vertices.translate([
            {x: -30, y: -170},
            {x: -120, y: -430},
            {x: 0, y: -430},
            {x: -32, y: -420},
        ], {x: 0, y: 0}, 1),
    ];

    for (const i in testPlanets) {
        stage.addPlanet(
            new Planet({
                name:     `test.${i}`,
                vertices: testPlanets[i],
            }),
        );
    }

    return stage;
};