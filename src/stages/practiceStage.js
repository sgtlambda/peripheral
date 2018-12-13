import {Bodies} from 'matter-js';

import Stage from '../logic/Stage';
import StrayItem from '../logic/StrayItem';

import arena from '../shapes/simpleArena';
import banana from '../constants/itemTypes/banana';
import log from '../constants/itemTypes/log';
import {cTerrain} from '../constants/collisionGroups';

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
                isStatic: true,
                render:   {
                    fillStyle:   'none',
                    strokeStyle: '#eee',
                    lineWidth:   1
                }
            }));
    });

    stage.addItem(new StrayItem({itemType: banana, position: {x: -100, y: 100}}));

    stage.addItem(new StrayItem({itemType: log, position: {x: -110, y: 40}}));

    stage.addItem(new StrayItem({itemType: log, position: {x: -190, y: 20}}));

    return stage;
}