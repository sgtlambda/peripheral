window.decomp = require('poly-decomp');

import {Engine, Runner, Events} from 'matter-js';

import {cTerrain} from "./common/collisionGroups";

import Render from '../fork/renderer';
import createRenderer from './createRenderer';
import controller from './controller';

import testStage from './worlds/tutorialStage';

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

    const world = engine.world;

    world.gravity.scale = 0.003;

    const {terrainBodies} = testStage({world});

    const {keysOn, destroy: destroyController} = controller();

    const player = new Player({

        x: 200,
        y: 200,

        controller: keysOn,

        engine,
        terrainBodies,
    });

    new Camera({
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