import Stage from '../../logic/Stage';
import Planet from '../../logic/Planet';

export default () => {

    const radius = 10000;

    const stage = new Stage({x: 0, y: -radius - 50});

    stage.addPlanet(Planet.createCircular({
        x:          0,
        y:          0,
        name:       'moon',
        radius,
        resolution: 200,
        rand:       .1,
    }));

    return stage;
};