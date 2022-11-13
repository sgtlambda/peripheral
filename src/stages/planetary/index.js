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

    stage.addPlanet(
        new Planet({
            name:     'test',
            vertices: [
                {x: -30, y: -170},
                {x: -120, y: -430},
                {x: 0, y: -430},
                {x: -32, y: -420},
            ],
        }),
    );

    return stage;
};