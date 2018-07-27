window.decomp = require('poly-decomp');

import {Engine, World, Vector, Vertices, Runner, Query, Bodies, Body, Constraint, Events} from 'matter-js';

import Render from '../fork/renderer';
import createRenderer from './createRenderer';
import controller from './controller';

import testStage from './worlds/test';

import Player from './Player';

// cleanup
const canvas = document.getElementsByTagName('canvas').item(0);
if (canvas) canvas.remove();
if (window.lastStop) window.lastStop();

const cTerrain    = 0x0001,
      cPlayerBody = 0x0002;

(() => {

    const engine   = Engine.create();
    const runner   = Runner.create();
    const renderer = createRenderer({element: document.body, engine});

    const world = engine.world;

    world.gravity.scale = 0.003;

    const {terrainBodies} = testStage({world, collisionCategory: cTerrain});

    const {keysOn, destroy: destroyController} = controller();

    new Player({
        x:                 200,
        y:                 200,
        engine,
        terrainBodies,
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