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

const houseShape     = JSON.parse('[{"x":-161.6,"y":-668.8},{"x":-161.6,"y":-843.8},{"x":14.4,"y":-845.8},{"x":14.4,"y":-667.8}]');
const topFence       = JSON.parse('[{"x":-390.8,"y":-1055.1},{"x":-305.8,"y":-1124.1},{"x":-297.8,"y":-1116.1},{"x":-385.8,"y":-1044.1}]');
const leftFence      = JSON.parse('[{"x":-452.9,"y":-761.7},{"x":-376.9,"y":-690.7},{"x":-274.9,"y":-638.7},{"x":-156.9,"y":-593.7},{"x":-140.9,"y":-517.7},{"x":-136.9,"y":-418.7},{"x":-117.9,"y":-417.7},{"x":-122.9,"y":-519.7},{"x":-140.9,"y":-600.7},{"x":-146.9,"y":-607.7},{"x":-268.9,"y":-656.7},{"x":-367.9,"y":-704.7},{"x":-444.9,"y":-775.7},{"x":-454.9,"y":-773.7}]');
const rightFence     = JSON.parse('[{"x":96.5,"y":-661.9},{"x":151.5,"y":-714.9},{"x":193.5,"y":-783.9},{"x":206.5,"y":-781.9},{"x":165.5,"y":-706.9},{"x":111.5,"y":-654.9},{"x":128.5,"y":-573.9},{"x":113.5,"y":-572.9}]');
const outerLeftFence = JSON.parse('[{"x":-1418.1,"y":-996.6},{"x":-1256.1,"y":-948.6},{"x":-1208.1,"y":-780.6},{"x":-1194.1,"y":-786.6},{"x":-1243.1,"y":-956.6},{"x":-1252.1,"y":-963.6},{"x":-1410.1,"y":-1011.6}]');

const baseBorderLeft  = JSON.parse('[{"x":733,"y":-1598.2},{"x":733,"y":-982.5},{"x":1089,"y":-981.5},{"x":1089,"y":-1004.5},{"x":757,"y":-1007.5},{"x":756.6,"y":-1603.1}]');
const baseBorderRight = JSON.parse('[{"x":1228.2,"y":-981.7},{"x":1391.2,"y":-978.7},{"x":1390.2,"y":-1605.7},{"x":1365.2,"y":-1605.7},{"x":1364.2,"y":-1007.4},{"x":1226.2,"y":-1008.4}]');

const ruinsMainTower = JSON.parse('[{"x":-1477.4,"y":-1359.1},{"x":-1374.4,"y":-1364.1},{"x":-1376.4,"y":-1458.1},{"x":-1396.4,"y":-1465.1},{"x":-1476.4,"y":-1461.1},{"x":-1482.4,"y":-1368.1}]');
const ruinsCompound  = JSON.parse('[{"x":-1339.7,"y":-1233.7},{"x":-1288.8,"y":-1234.7},{"x":-1282.8,"y":-1224.7},{"x":-1297.8,"y":-1214.7},{"x":-1297.8,"y":-1203.7},{"x":-1276.8,"y":-1206.7},{"x":-1277.8,"y":-1221.7},{"x":-1238.8,"y":-1229.7},{"x":-1238.8,"y":-1237.7},{"x":-1225.8,"y":-1239.7},{"x":-1225.8,"y":-1253.7},{"x":-1215.8,"y":-1275.7},{"x":-1236.8,"y":-1284.7},{"x":-1233.8,"y":-1299.7},{"x":-1171.8,"y":-1296.7},{"x":-1182.8,"y":-1325.7},{"x":-1205.8,"y":-1327.7},{"x":-1235.8,"y":-1310.7},{"x":-1241.8,"y":-1333.7},{"x":-1268.8,"y":-1348.7},{"x":-1278.8,"y":-1345.7},{"x":-1278.8,"y":-1368.7},{"x":-1313.8,"y":-1370.7},{"x":-1321.8,"y":-1411.7},{"x":-1321.8,"y":-1436.7},{"x":-1349.8,"y":-1436.7},{"x":-1350.8,"y":-1393.7},{"x":-1345.8,"y":-1322.7},{"x":-1344.8,"y":-1238.7}]');

const waterLeft  = JSON.parse('[{"x":250.5,"y":-131.9},{"x":313.5,"y":-3.9},{"x":131.2,"y":117.4},{"x":-28,"y":197.9},{"x":-190.1,"y":213},{"x":-373.2,"y":157.2},{"x":-539.9,"y":30.6},{"x":-709.4,"y":-97.1},{"x":-960.2,"y":-217.5},{"x":-1096.4,"y":-335.4},{"x":-1181.4,"y":-450.4},{"x":-1310.9,"y":-561.5},{"x":-1437.5,"y":-691.8},{"x":-1521.3,"y":-901.2},{"x":-1582.3,"y":-999.3},{"x":-1639.3,"y":-1036.3},{"x":-1641.2,"y":-1270.4},{"x":-1511.2,"y":-1166.3},{"x":-1432.2,"y":-994.3},{"x":-1364.7,"y":-821.7},{"x":-1270.6,"y":-694.5},{"x":-1156.6,"y":-604.5},{"x":-1073.4,"y":-484.6},{"x":-939.3,"y":-374.6},{"x":-844.8,"y":-329.1},{"x":-729.7,"y":-276.9},{"x":-566.2,"y":-169.6},{"x":-380.8,"y":-20.3},{"x":-214.8,"y":38.7},{"x":-83.5,"y":38.4},{"x":51.5,"y":-7.6},{"x":167.5,"y":-77.6}]');
const waterRight = JSON.parse('[{"x":308.8,"y":-174.6},{"x":383.8,"y":-39.6},{"x":619.6,"y":-144.2},{"x":935.4,"y":-296.9},{"x":1085.8,"y":-363.5},{"x":1258.6,"y":-397.7},{"x":1614.6,"y":-394.7},{"x":1613.6,"y":-678.5},{"x":1354.6,"y":-586.7},{"x":1134.7,"y":-554.7},{"x":948.7,"y":-479.9},{"x":714.6,"y":-356.8},{"x":480.2,"y":-258.7}]');

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
        ruinsMainTower, ruinsCompound,
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

    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 600 - 300;
        const y = Math.random() * 700 - 350;
        stage.addItem(new StrayItem({itemType: log, position: {x, y}}));
    }

    stage.addItem(new StrayItem({itemType: banana, position: {x: -100, y: 100}}));

    return stage;
}