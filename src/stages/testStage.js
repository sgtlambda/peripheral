import {Bodies, World} from 'matter-js';
import pendulum from '../parts/pendulum';
import arena from '../shapes/arena';

import {cTerrain} from '../constants/collisionGroups';

import getBodyOffset from './../common/getBodyOffset';

export default ({

    world,

}) => {

    const terrainBodies = arena().map(vertices => {
        const offset = getBodyOffset(vertices);
        return Bodies.fromVertices(offset.x, offset.y, vertices, {
            isStatic:        true,
            render:          {
                fillStyle:   'none',
                strokeStyle: '#eee',
                lineWidth:   1
            },
            collisionFilter: {
                category: cTerrain,
            }
        });
    });

    // [0, 1].forEach(i => {
    //     const x = 382 + i * 85;
    //     const p = pendulum({
    //         x, y:                  305,
    //         width:                 80,
    //         ropeSeparationAtSwing: 30,
    //         ropeLength:            200,
    //     });
    //     terrainBodies.push(p.body);
    //     World.add(world, p.constraints);
    // });

    const boxSize = 32;
    [
        [2, 1], [3, 1],
        [2, 2], [3, 2],
    ].forEach(([bx, by]) => {
        const b = Bodies.rectangle(
            180 + bx * boxSize,
            300 - boxSize * 3.5 + by * boxSize, boxSize - 1, boxSize - 1, {
                isStatic: true,
                render: {
                    fillStyle:   'none',
                    strokeStyle: '#eee',
                    lineWidth:   1
                }
            });
        terrainBodies.push(b);
    });

    World.add(world, terrainBodies);

    return {world, terrainBodies};
}