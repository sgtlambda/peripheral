window.decomp = require('poly-decomp');

import Matter, {Engine, Runner} from 'matter-js';

import MatterAttractors from 'matter-attractors';

import Render from '../fork/renderer';
import createRenderer from './createRenderer';
import playerController from './playerController';
import mouseController from './mouseController';
import uiController from './uiController';
import interactionController from './interactionController';

import planetaryStage from './stages/planetary';

import InteractionHandler from './logic/InteractionHandler';
import PlayerState from './logic/PlayerState';

import backgroundLayer from './logic/rendering/layers/backgroundLayer.js';
import stageLayers from './logic/rendering/layers/stageLayers';
import uiLayers from './logic/rendering/layers/uiLayers';
import playerInteractionLayer from './logic/rendering/layers/playerInteractionLayer';
import rotateContext from './logic/rendering/layers/rotateContext';

import Player from './Player';
import Camera from './logic/rendering/Camera';

import debugDraw from './data/itemTypes/debugDraw.js';

// cleanup
const canvas = document.getElementsByTagName('canvas').item(0);
if (canvas) canvas.remove();
if (window.lastStop) window.lastStop();

(() => {

    // Set up the "Matter" engine to use attractors (point-based gravity)
    Matter.use(MatterAttractors);

    const engine = Engine.create();
    const runner = Runner.create();
    const world  = engine.world;
    const render = createRenderer({element: document.body, engine});

    const camera = new Camera({render});

    const playerState = new PlayerState();

    playerState.addToInventory({itemType: debugDraw, slot: 7});

    world.gravity.scale = 0;

    const {keysOn, destroy: destroyPlayerController}   = playerController();
    const {gameMouse, destroy: destroyMouseController} = mouseController({engine, camera});
    const {destroy: destroyUiController}               = uiController({playerState});

    const stage = planetaryStage();

    const player = new Player({
        stage, keys: keysOn, mouse: gameMouse,
        ...stage.initialPlayerPos,
    });

    camera.trackPlayer(player);

    const interactionHandler = new InteractionHandler({gameMouse, stage, player, playerState});

    const {destroy: destroyInteractionController} = interactionController({
        mouseEmitter: render.canvas,
        interactionHandler
    });

    const worldParts  = [stage, player];
    const engineHooks = [player, interactionHandler, camera];

    const {before: rotate, after: unrotate} = rotateContext();

    const layers = [
        unrotate, // Note this layer MUST be first

        backgroundLayer(),
        playerInteractionLayer({player, playerState}),
        ...stageLayers({stage}),
        ...uiLayers({gameMouse, player, playerState}),

        rotate, // Note this layer MUST be last
    ];

    worldParts.forEach(p => p.provision(world));
    engineHooks.forEach(e => e.attach(engine));

    layers.forEach(r => r.attach(render, camera));

    Render.run(render);
    Runner.run(runner, engine);

    window.lastStop = () => {

        Render.stop(render);
        Runner.stop(runner);

        engineHooks.forEach(e => e.detach(engine));
        layers.forEach(r => r.detach(render));

        destroyPlayerController();
        destroyUiController();
        destroyMouseController();
        destroyInteractionController();
    };
})();