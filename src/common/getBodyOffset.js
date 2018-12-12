import {Bodies} from 'matter-js';
import {minBy} from 'lodash';

const getTopLeft = vertices => ({
    x: minBy(vertices, 'x').x,
    y: minBy(vertices, 'y').y,
});

export default vertices => {
    const testBody        = Bodies.fromVertices(0, 0, vertices, {
        isStatic: true,
    });
    const verticesTopLeft = getTopLeft(vertices);
    const bodyTopLeft     = testBody.bounds.min;
    return {
        x: -bodyTopLeft.x + verticesTopLeft.x,
        y: -bodyTopLeft.y + verticesTopLeft.y,
    };
};