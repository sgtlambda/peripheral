window.decomp = require('poly-decomp');

import {Engine, Runner, Events} from 'matter-js';

import Render from '../fork/renderer';
import createRenderer from './createRenderer';
import controller from './controller';

import testStage from './stages/testStage';

import Player from './Player';
import Camera from './common/Camera';

// cleanup
const canvas = document.getElementsByTagName('canvas').item(0);
if (canvas) canvas.remove();
if (window.lastStop) window.lastStop();


(() => {

    const engine   = Engine.create();
    const runner   = Runner.create();
    const renderer = createRenderer({element: document.body, engine});

    // renderer.bounds.min = {x: -render}

    const world = engine.world;

    world.gravity.scale = 0;

    const {terrainBodies} = testStage({world});

    const {keysOn, destroy: destroyController} = controller();

    const player = new Player({
        x:          0,
        y:          0,
        controller: keysOn,
        engine,
        terrainBodies,
    });

    const camera = new Camera({
        engine,
        render:    renderer,
        trackBody: player.collider,
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