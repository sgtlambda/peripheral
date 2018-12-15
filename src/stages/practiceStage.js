import {Bodies} from 'matter-js';

import Stage from '../logic/Stage';
import StrayItem from '../logic/StrayItem';

import arena from '../shapes/simpleArena';
import banana from '../data/itemTypes/banana';
import log from '../data/itemTypes/log';
import {cTerrain} from '../data/collisionGroups';

import getBodyOffset from './../common/getBodyOffset';

export default () => {

    const stage = new Stage();

    const arenaShape = arena();

    arenaShape.forEach(vertices => {
        const offset = getBodyOffset(vertices);
        stage.addBody(Bodies.fromVertices(offset.x, offset.y, vertices, {
            isStatic:        true,
            render:          {
                fillStyle:   'none',
                strokeStyle: '#eee',
                lineWidth:   1
            },
            collisionFilter: {
                category: cTerrain,
            }
        }));
    });

    const boxSize = 32;

    [
        [2, 1], [3, 1],
        [2, 2], [3, 2],
    ].forEach(([bx, by]) => {
        stage.addBody(Bodies.rectangle(
            180 + bx * boxSize,
            300 - boxSize * 3.5 + by * boxSize, boxSize - 1, boxSize - 1, {
                density: 15,
                render:  {
                    fillStyle:   'none',
                    strokeStyle: '#eee',
                    lineWidth:   1
                }
            }));
    });

    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 600 - 300;
        const y = Math.random() * 700 - 350;
        stage.addItem(new StrayItem({itemType: log, position: {x, y}}));
    }

    stage.addItem(new StrayItem({itemType: banana, position: {x: -100, y: 100}}));

    return stage;
}