window.decomp = require('poly-decomp');

import {Engine, Runner, Body, Events, Vector} from 'matter-js';

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

    const camera = new Camera({
        engine,
        render:    renderer,
        trackBody: player.collider,
    });

    Render.run(renderer);

    Runner.run(Runner.create(), engine);

    let mouse = {x: 0, y: 0};

    window.addEventListener('mousemove', e => {
        mouse.x = e.pageX;
        mouse.y = e.pageY;
    });

    const ingameMousePos = (mouse, camera) => {
        return {
            x: mouse.x + camera.panX,
            y: mouse.y,
        };
    };

    let aimAngle;

    Events.on(renderer, 'afterRender', () => {
        const ctx = renderer.context;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle  = 'red';
        const mountPos = player.weaponMount.position;
        const mousePos = ingameMousePos(mouse, camera);
        aimAngle       = Vector.angle(mountPos, mousePos);
        ctx.translate(mountPos.x - camera.panX, mountPos.y);
        ctx.rotate(aimAngle);
        ctx.fillRect(0, -5, 40, 10);
        ctx.setTransform(2, 0, 0, 2, 0, 0);
    });

    window.addEventListener('mousedown', e => {
        const vector = Vector.rotate({x: -.05, y: 0}, aimAngle);
        // player.collider.applyForce()
        Body.applyForce(player.collider, {x: 0, y: 0}, vector);
    });

    window.lastStop = () => {
        Render.stop(renderer);
        Runner.stop(runner);
        Events.off(engine);
        Events.off(renderer);
        destroyController();
    };
})();