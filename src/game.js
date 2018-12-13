window.decomp = require('poly-decomp');

import {Engine, Runner} from 'matter-js';

import Render from '../fork/renderer';
import createRenderer from './createRenderer';
import controller from './controller';

import practiceStage from './stages/practiceStage';
import StageRenderer from './logic/StageRenderer';
import InteractionHandler from './logic/InteractionHandler';
import PlayerState from './logic/PlayerState';

import Player from './Player';
import Camera from './common/Camera';

// cleanup
const canvas = document.getElementsByTagName('canvas').item(0);
if (canvas) canvas.remove();
if (window.lastStop) window.lastStop();

(() => {

    const engine = Engine.create();
    const runner = Runner.create();
    const render = createRenderer({element: document.body, engine});

    const playerState = new PlayerState();

    const world = engine.world;

    world.gravity.scale = 0;

    const stage = practiceStage().provision(world);

    const {keysOn, destroy: destroyController} = controller();

    const player = new Player({x: 0, y: 0, controller: keysOn, terrainBodies: stage.terrainBodies});

    player.provision(world).attach(engine);

    const stageRenderer      = new StageRenderer({stage, render}).attach();
    const interactionHandler = new InteractionHandler({engine, player, playerState}).attach(engine);
    const camera             = new Camera({render, trackBody: player.collider}).attach(engine);

    Render.run(render);
    Runner.run(runner, engine);

    window.lastStop = () => {

        Render.stop(render);
        Runner.stop(runner);

        player.detach(engine);

        stageRenderer.detach();
        interactionHandler.detach(engine);
        camera.detach(engine);

        destroyController();
    };
})();