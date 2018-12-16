import {Bodies} from 'matter-js';

import Stage from '../../logic/Stage';

import Planet from '../../logic/Planet';

// import StrayItem from '../../logic/StrayItem';
//
// import banana from '../../data/itemTypes/banana';
// import log from '../../data/itemTypes/log';
// import {cTerrain} from '../../data/collisionGroups';
//
// import Img from './../../common/Img';
// import getBodyOffset from '../../common/getBodyOffset';
//
// import ground from './forestmap_0ground.jpg';
// import trees from './trees_transparent.png';
// import house from './house.png';
//
// import debugRender from '../../data/debugRender';

// import {
//     houseShape, topFence, leftFence, rightFence, outerLeftFence, ruinsThing,
//     baseBorderLeft, baseBorderRight, ruinsMainTower, ruinsCompound, waterLeft, waterRight, logPos, logPos2
// } from "./vectors";


export default () => {

    const radius = 2000;

    const stage = new Stage({
        initialPlayerPos: {x: 0, y: -radius - 40},
    });

    stage.addPlanet(Planet.create({name: 'Mainland', radius}));

    // Add a bunch of boxes...
    const boxSize = 24;
    [
        [2, 0], [3, 0],
        [2, 1], [3, 1],
        [2, 2], [3, 2],
    ].forEach(([bx, by]) => {
        stage.addTerrainBody(Bodies.rectangle(
            -100 + bx * boxSize,
            -radius - 100 - boxSize * 3.5 + by * boxSize, boxSize - 1, boxSize - 1, {
                density: .001,
                render:  {fillStyle: '#b2b2b0',}
            }));
    });

    return stage;
}