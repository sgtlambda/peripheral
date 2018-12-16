import {Bodies} from 'matter-js';

import Stage from '../../logic/Stage';
import StrayItem from '../../logic/StrayItem';

import arena from '../../shapes/simpleArena';
import banana from '../../data/itemTypes/banana';
import log from '../../data/itemTypes/log';
import {cTerrain} from '../../data/collisionGroups';

import Img from './../../common/Img';
import getBodyOffset from '../../common/getBodyOffset';

import ground from './forestmap_0ground.jpg';
import trees from './trees_transparent.png';
import house from './house.png';

const houseShape     = JSON.parse('[{"x":-161.6,"y":-668.8},{"x":-161.6,"y":-843.8},{"x":14.4,"y":-845.8},{"x":14.4,"y":-667.8}]');
const topFence       = JSON.parse('[{"x":-390.8,"y":-1055.1},{"x":-305.8,"y":-1124.1},{"x":-297.8,"y":-1116.1},{"x":-385.8,"y":-1044.1}]');
const leftFence      = JSON.parse('[{"x":-452.9,"y":-761.7},{"x":-376.9,"y":-690.7},{"x":-274.9,"y":-638.7},{"x":-156.9,"y":-593.7},{"x":-140.9,"y":-517.7},{"x":-136.9,"y":-418.7},{"x":-117.9,"y":-417.7},{"x":-122.9,"y":-519.7},{"x":-140.9,"y":-600.7},{"x":-146.9,"y":-607.7},{"x":-268.9,"y":-656.7},{"x":-367.9,"y":-704.7},{"x":-444.9,"y":-775.7},{"x":-454.9,"y":-773.7}]');
const rightFence     = JSON.parse('[{"x":96.5,"y":-661.9},{"x":151.5,"y":-714.9},{"x":193.5,"y":-783.9},{"x":206.5,"y":-781.9},{"x":165.5,"y":-706.9},{"x":111.5,"y":-654.9},{"x":128.5,"y":-573.9},{"x":113.5,"y":-572.9}]');
const outerLeftFence = JSON.parse('[{"x":-1418.3,"y":-998.2},{"x":-1254.3,"y":-948.2},{"x":-1206.3,"y":-778.2},{"x":-1199.3,"y":-784.2},{"x":-1245.3,"y":-955.2},{"x":-1414.3,"y":-1006.2}]');

export default () => {

    const stage = new Stage({
        initialPlayerPos: {x: 0, y: -1000},
    });

    const imageLayers = {w: 3200, h: 3200, x: -1600, y: -1600};
    stage.graphics.addBaseLayer(new Img({src: ground, ...imageLayers}));
    stage.graphics.addOverLayer(new Img({src: trees, ...imageLayers, h: 1827}));
    stage.graphics.addOverLayer(new Img({src: house, x: -171, y: -853, w: 195, h: 195}));

    const stuff = [houseShape, topFence, leftFence, rightFence, outerLeftFence];

    stuff.forEach(vertices => {
        const offset = getBodyOffset(vertices);
        stage.addBody(Bodies.fromVertices(offset.x, offset.y, vertices, {
            isStatic:        true,
            render:          {
                strokeStyle: 'rgba(255,0,0,.5)',
                fillStyle:   'transparent',
                lineWidth:   1,
            },
            collisionFilter: {
                category: cTerrain,
            }
        }));
    });

    const boxSize = 24;

    [
        [2, 1], [3, 1],
        [2, 2], [3, 2],
    ].forEach(([bx, by]) => {
        stage.addBody(Bodies.rectangle(
            -300 + bx * boxSize,
            -700 - boxSize * 3.5 + by * boxSize, boxSize - 1, boxSize - 1, {
                density:     .01,
                frictionAir: .1,
                render:      {
                    fillStyle: '#443827',
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