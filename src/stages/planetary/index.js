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

    const meteorRadius = 200;
    const meteorDist   = 300;

    const meteorY = -radius - meteorDist - meteorRadius;

    stage.addPlanet(Planet.create({name: 'moon', radius}));

    stage.addPlanet(Planet.create({name: 'meteor', radius: meteorRadius, density: 15e-4, x: 0, y: meteorY}));

    const boxes = [
        // [-10, meteorY + meteorRadius + 20]
    ];

    // Add a bunch of boxes...
    const boxSize = 24;
    [
        [-.5, 1], [.5, 1],
    ].forEach(([bx, by]) => {
        boxes.push([bx * boxSize,
            -radius - 238.4820728 + by * boxSize]);
    });

    boxes.forEach(([x, y]) => {
        stage.addTerrainBody(Bodies.rectangle(x, y, boxSize, boxSize, {
            density: .001,
            render:  {fillStyle: '#b2b2b0',}
        }));
    });

    return stage;
}