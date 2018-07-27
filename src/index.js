window.decomp = require('poly-decomp');

import {Engine, World, Vector, Vertices, Runner, Query, Bodies, Body, Constraint, Events} from 'matter-js';

import Render from '../fork/renderer';
import createRenderer from './createRenderer';
import controller from './controller';

import testTerrain from './shapes/testTerrain';

import pendulum from './parts/pendulum';

import Player from './Player';

// cleanup
const canvas = document.getElementsByTagName('canvas').item(0);
if (canvas) canvas.remove();
if (window.lastStop) window.lastStop();

// const width  = 800;
const height = 400;

const cTerrain    = 0x0001,
      cPlayerBody = 0x0002;

(() => {

    const engine   = Engine.create();
    const runner   = Runner.create();
    const renderer = createRenderer({element: document.body, engine});

    const world = engine.world;

    world.gravity.scale = 0.002;

    const vertices = testTerrain;
    const center   = Vertices.centre(vertices);

    const terrain = Bodies.fromVertices(center.x, center.y + height, vertices, {
        isStatic:        true,
        render:          {
            fillStyle:   '#2e2b44',
            strokeStyle: '#2e2b44',
            lineWidth:   1
        },
        collisionFilter: {
            category: cTerrain,
        }
    });

    const pendula = [0, 1, 2].map(x => pendulum({
        x: x * 100 + 350, y: 360, width: 60, ropeSeparation: 20,
    }));

    const allTerrain = [
        terrain,
        ...pendula.map(p => p.body),
    ];

    World.add(world, allTerrain);
    World.add(world, pendula.reduce((arr, p) => arr.concat(p.constraints), []));

    const {keysOn, destroy: destroyController} = controller();

    const player = new Player({
        x:                 200,
        y:                 200,
        engine,
        terrainBodies:     allTerrain,
        collisionCategory: cPlayerBody,
        collisionMask:     cTerrain,
        controller:        keysOn,
    });

    Render.run(renderer);

    Runner.run(Runner.create(), engine);

    window.lastStop = () => {
        Render.stop(renderer);
        Runner.stop(runner);
        Events.off(engine);
        Events.off(renderer);
        destroyController();
    };
})();