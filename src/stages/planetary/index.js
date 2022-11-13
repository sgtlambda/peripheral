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
        Vertices.translate(
            [
                {x: 30, y: 30},
                {x: -30, y: 30},
                {x: -30, y: -30},
                {x: 30, y: -30},
            ], {x: -80, y: -200}, 1),
        Vertices.translate([
            {x: 30, y: 30},
            {x: -30, y: 30},
            {x: -30, y: -30},
            {x: 0, y: -30},
            {x: 0, y: 0},
            {x: 30, y: 0},
        ], {x: 0, y: -200}, 1),
        Vertices.translate([
            {x: 30, y: 30},
            {x: -30, y: 30},
            {x: -30, y: -30},
            {x: 0, y: -30},
            {x: -10, y: 10},
            {x: 30, y: 0},
        ], {x: 80, y: -200}, 1),
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