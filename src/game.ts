import {browserWindowController} from "./browserWindowController";

declare global {
    interface Window {
        lastStop: any;
        decomp: any;
    }
}

window.decomp = require('poly-decomp');

import {Engine, Runner} from 'matter-js';

import {Render} from 'matter-js';
import createRenderer from './createRenderer';
import playerController from './playerController';
import mouseController from './mouseController';
import uiController from './uiController';
import interactionController from './interactionController';

import planetaryStage from './stages/planetary';

import InteractionHandler from './logic/InteractionHandler';
import PlayerState from './logic/PlayerState';

import backgroundLayer from './rendering/layers/backgroundLayer.js';
import stageLayers from './rendering/layers/stageLayers';
import uiLayers from './rendering/layers/uiLayers';
import playerInteractionLayer from './rendering/layers/playerInteractionLayer';
import rotateContext from './rendering/layers/rotateContext';

import Player from './Player';
import Camera from './rendering/Camera';

import drill from "./data/itemTypes/drill";
import grenade from './data/itemTypes/grenade';
import nuke from './data/itemTypes/nuke';
import crate from './data/itemTypes/crate';
import {laser} from './data/itemTypes/laser';
import debugDraw from './data/itemTypes/debugDraw.js';

// cleanup (for hot reload, if applicable)
const canvas = document.getElementsByTagName('canvas').item(0);
if (canvas) canvas.remove();
if ('lastStop' in window) window.lastStop();

(() => {

    const engine = Engine.create();
    const runner = Runner.create({});
    const world = engine.world;
    const render = createRenderer({element: document.body, engine});

    const camera = new Camera({render});

    const playerState = new PlayerState();

    playerState.addToInventory({itemType: laser});
    playerState.addToInventory({itemType: grenade, amount: 99});
    playerState.addToInventory({itemType: nuke, amount: 99});
    playerState.addToInventory({itemType: drill, amount: 800});
    playerState.addToInventory({itemType: crate, amount: 800});
    playerState.addToInventory({itemType: debugDraw, slot: 7});

    const {keysOn, destroy: destroyPlayerController} = playerController();
    const {gameMouse, destroy: destroyMouseController} = mouseController({engine, camera});
    const {destroy: destroyUiController} = uiController({playerState});
    const {destroy: destroyBrowserWindowController} = browserWindowController({render, camera});

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

    const worldParts = [stage, player];
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
        destroyBrowserWindowController();
    };
})();
