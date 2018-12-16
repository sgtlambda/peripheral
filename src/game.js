window.decomp = require('poly-decomp');

import {Engine, Runner} from 'matter-js';

import Render from '../fork/renderer';
import createRenderer from './createRenderer';
import playerController from './playerController';
import mouseController from './mouseController';
import uiController from './uiController';
import interactionController from './interactionController';

import forestStage from './stages/forest';
import InteractionHandler from './logic/InteractionHandler';
import PlayerState from './logic/PlayerState';
import BuildPlaceholderCollider from './logic/BuildPlaceholderCollider';
import StageRenderer from './logic/rendering/StageRenderer';
import UiRenderer from './logic/rendering/UiRenderer';
import PlayerInteractionRenderer from './logic/rendering/PlayerInteractionRenderer';

import Player from './Player';
import Camera from './logic/rendering/Camera';

import debugDraw from './data/itemTypes/debugDraw.js';

// cleanup
const canvas = document.getElementsByTagName('canvas').item(0);
if (canvas) canvas.remove();
if (window.lastStop) window.lastStop();

(() => {

    const engine = Engine.create();
    const runner = Runner.create();
    const world  = engine.world;
    const render = createRenderer({element: document.body, engine});

    const camera = new Camera({render});

    const playerState = new PlayerState();

    playerState.addToInventory({itemType: debugDraw, amount: Math.Infinity, slot: 7});

    world.gravity.scale = 0;

    const {keysOn, destroy: destroyPlayerController}   = playerController();
    const {gameMouse, destroy: destroyMouseController} = mouseController({engine, camera});
    const {destroy: destroyUiController}               = uiController({playerState});

    const stage = forestStage();

    const player = new Player({
        x:    stage.initialPlayerPos.x, y: stage.initialPlayerPos.y,
        keys: keysOn, mouse: gameMouse, terrainBodies: stage.terrainBodies
    });

    const buildPlaceholderCollider = new BuildPlaceholderCollider({player});

    camera.track(player.collider);

    const interactionHandler = new InteractionHandler({gameMouse, stage, player, playerState});

    const stageRenderer             = new StageRenderer(stage);
    const uiRenderer                = new UiRenderer({gameMouse, player, playerState});
    const playerInteractionRenderer = new PlayerInteractionRenderer({player, playerState});

    const {destroy: destroyInteractionController} = interactionController({
        mouseEmitter: render.canvas,
        interactionHandler
    });

    const worldParts  = [stage, player];
    const engineHooks = [player, interactionHandler, camera];
    const renderHooks = [playerInteractionRenderer, stageRenderer, uiRenderer];

    worldParts.forEach(p => p.provision(world));
    engineHooks.forEach(e => e.attach(engine));
    renderHooks.forEach(r => r.attach(render));

    Render.run(render);
    Runner.run(runner, engine);

    window.lastStop = () => {

        Render.stop(render);
        Runner.stop(runner);

        engineHooks.forEach(e => e.detach(engine));
        renderHooks.forEach(r => r.detach(render));

        destroyPlayerController();
        destroyUiController();
        destroyMouseController();
        destroyInteractionController();
    };
})();