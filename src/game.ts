import {Engine, Render, Runner} from 'matter-js';

import {browserWindowController} from "./browserWindowController";
import createRenderer from './createRenderer';
import playerController from './playerController';
import mouseController from './mouseController';
import uiController from './uiController';
import interactionController from './interactionController';

import sandboxStage from './stages/sandbox';

import InteractionHandler from './logic/InteractionHandler';
import PlayerState from './logic/PlayerState';

import backgroundLayer from './rendering/layers/backgroundLayer.js';
import {createStageLayers} from './rendering/layers/stageLayers';
import uiLayers from './rendering/layers/uiLayers';
import {playerInteractionLayer} from './rendering/layers/playerInteractionLayer';
import rotateContext from './rendering/layers/rotateContext';

import Player from './Player';
import Camera from './rendering/Camera';
import {createMarkupGuiRenderer} from "./rendering/markupGuiLayer";
import {npcObserver} from "./ui/npcObserver";
import Layer from "./rendering/Layer";

import {EngineComponent} from "./types";
import {defaultInventory} from "./defaultInventory";
import {AudioManager} from "./common/AudioManager";
import {soundEffectPaths, SoundEffectID} from "./data/soundEffects";

declare global {
  interface Window {
    lastStop: any;
    decomp: any;
    audioManager: AudioManager; // Expose for debugging
  }
}

import decomp from 'poly-decomp';
import {ChiefTemporalOfficer} from "./ChiefTemporalOfficer";

window.decomp = decomp;

// cleanup (for hot reload, if applicable)
const canvas = document.getElementsByTagName('canvas').item(0);
if (canvas) canvas.remove();
if ('lastStop' in window) window.lastStop();

(() => {
  // Initialize the audio manager
  const audioManager = AudioManager.getInstance();
  audioManager.init(soundEffectPaths);
  window.audioManager = audioManager; // Expose for debugging

  setTimeout(() => {
    // TODO this should only start upon the very first user interaction
    // Start background music
    audioManager.playBackgroundMusic(SoundEffectID.BACKGROUND_MUSIC, .5);
  }, 1000);

  const engine = Engine.create();
  const runner = Runner.create({});
  const world  = engine.world;
  const render = createRenderer({element: document.body, engine});

  const stage = sandboxStage();

  stage.chiefTemporalOfficer.attachToEngine(engine);

  const camera = new Camera({
    render,
    trackOffset: {x: 0, y: -120},
    shakeStack:  stage.cameraShakeStack,
  });

  const playerState = new PlayerState();

  for (const slot of defaultInventory) {
    playerState.addToInventory(slot);
  }

  const {keysOn, destroy: destroyPlayerController}   = playerController();
  const {gameMouse, destroy: destroyMouseController} = mouseController({engine, camera});
  const {destroy: destroyUiController}               = uiController({playerState});
  const {destroy: destroyBrowserWindowController}    = browserWindowController({render, camera});


  const player = new Player({
    stage, keys: keysOn, mouse: gameMouse,
    ...stage.initialPlayerPos,
  });

  camera.trackPlayer(player);

  const interactionHandler = new InteractionHandler({stage, player, playerState});

  const {destroy: destroyInteractionController} = interactionController({
    mouseEmitter: render.canvas,
    interactionHandler
  });

  const worldParts = [stage, player];

  const engineComponents: EngineComponent[] = [
    player,
    interactionHandler,
    camera,
    npcObserver(stage, player),
  ];

  const {before: rotate, after: unrotate} = rotateContext();

  const markupGuiRenderer = createMarkupGuiRenderer();

  const layers: Layer[] = [
    unrotate, // Note this layer MUST be first

    backgroundLayer(),
    playerInteractionLayer({player, playerState, stage}),
    ...createStageLayers(stage),
    ...uiLayers({gameMouse, player, playerState}),
    markupGuiRenderer.layer,

    rotate, // Note this layer MUST be last
  ];

  const c: HTMLCanvasElement = render.canvas;
  c.parentNode.appendChild(markupGuiRenderer.element);

  worldParts.forEach(p => p.provision(world));

  engineComponents.forEach(e => e.attach(engine));

  layers.forEach(r => r.attach(render, camera));

  Render.run(render);
  Runner.run(runner, engine);

  window.lastStop = () => {
    // Stop background music when the game stops
    audioManager.stopBackgroundMusic();

    Render.stop(render);
    Runner.stop(runner);

    stage.chiefTemporalOfficer.detachFromEngine();

    engineComponents.forEach(e => e.detach(engine));

    layers.forEach(r => r.detach(render));

    destroyPlayerController();
    destroyUiController();
    destroyMouseController();
    destroyInteractionController();
    destroyBrowserWindowController();
  };
})();
