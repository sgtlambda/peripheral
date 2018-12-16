import {Bodies} from 'matter-js';

import Stage from '../../logic/Stage';
import StrayItem from '../../logic/StrayItem';

import banana from '../../data/itemTypes/banana';
import log from '../../data/itemTypes/log';
import {cTerrain} from '../../data/collisionGroups';

import Img from './../../common/Img';
import getBodyOffset from '../../common/getBodyOffset';

import ground from './forestmap_0ground.jpg';
import trees from './trees_transparent.png';
import house from './house.png';

import debugRender from '../../data/debugRender';

import {
    houseShape, topFence, leftFence, rightFence, outerLeftFence, ruinsThing,
    baseBorderLeft, baseBorderRight, ruinsMainTower, ruinsCompound, waterLeft, waterRight, logPos, logPos2
} from "./vectors";

export default () => {

    const stage = new Stage({
        initialPlayerPos: {x: 15, y: -535},
    });

    const imageLayers = {w: 3200, h: 3200, x: -1600, y: -1600};
    stage.graphics.addBaseLayer(new Img({src: ground, ...imageLayers}));
    stage.graphics.addOverLayer(new Img({src: trees, ...imageLayers, h: 1827}));
    stage.graphics.addOverLayer(new Img({src: house, x: -171, y: -853, w: 195, h: 195}));

    const waters = [waterLeft, waterRight];

    const stuff = [
        ruinsMainTower, ruinsCompound, ruinsThing,
        baseBorderLeft, baseBorderRight,
        houseShape, topFence, leftFence, rightFence, outerLeftFence,
        ...waters,
    ];

    stuff.forEach(vertices => {
        const offset = getBodyOffset(vertices);
        stage.addBody(Bodies.fromVertices(offset.x, offset.y, vertices, {
            isStatic:        true,
            render:          debugRender,
            collisionFilter: {
                category: cTerrain,
            }
        }));
    });

    const boxSize = 24;

    [
        [2, 0], [3, 0],
        [2, 1], [3, 1],
        [2, 2], [3, 2],
    ].forEach(([bx, by]) => {
        stage.addBody(Bodies.rectangle(
            -300 + bx * boxSize,
            -700 - boxSize * 3.5 + by * boxSize, boxSize - 1, boxSize - 1, {
                density: .001, frictionAir: .3, render: {fillStyle: '#443827',}
            }));
    });

    [...logPos, ...logPos2].forEach(position => {
        stage.addItem(new StrayItem({itemType: log, position}));
    });

    // stage.addItem(new StrayItem({itemType: banana, position: {x: -100, y: 100}}));

    return stage;
}