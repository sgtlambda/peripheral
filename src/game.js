window.decomp = require('poly-decomp');

import {Engine, Runner, Body, Events, Vector} from 'matter-js';

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


const ingameMousePos = (mouse, camera) => ({
    x: mouse.x + camera.panX,
    y: mouse.y,
});

const updateAimAngle = ({ctx, player, camera, mouse}) => {
    const mountPos = player.weaponMount.position;
    const mousePos = ingameMousePos(mouse, camera);
    const aimAngle = Vector.angle(mountPos, mousePos);
    // ctx.translate(mountPos.x - camera.panX, mountPos.y);
    // ctx.rotate(aimAngle);
    // ctx.fillStyle   = 'transparent';
    // ctx.strokeStyle = 'white';
    // ctx.strokeWidth = '.5px';
    // ctx.strokeRect(0, -5, 40, 10);
    // ctx.setTransform(2, 0, 0, 2, 0, 0);
    return aimAngle;
};

(() => {

    const engine   = Engine.create();
    const runner   = Runner.create();
    const renderer = createRenderer({element: document.body, engine});

    const world = engine.world;

    world.gravity.scale = 0.003;

    const {terrainBodies} = testStage({world});

    const {keysOn, destroy: destroyController} = controller();

    const player = new Player({
        x:          100,
        y:          200,
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

    let aimAngle;

    Events.on(renderer, 'afterRender', () => {
        const ctx = renderer.context;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'red';

        aimAngle = updateAimAngle({player, camera, mouse, ctx});
    });

    window.addEventListener('mousedown', e => {
        const vector = Vector.rotate({x: -.05, y: 0}, aimAngle);
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