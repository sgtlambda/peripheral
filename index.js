window.decomp = require('poly-decomp');

import {Engine, World, Vector, Vertices, Runner, Query, Bodies, Body, Constraint, Events} from 'matter-js';

import Render from './renderer';
import createRenderer from './createRenderer';
import controller from './controller';

import testTerrain from './poly/testTerrain';

import pendulum from './parts/pendulum';

// cleanup
const canvas = document.getElementsByTagName('canvas').item(0);
if (canvas) canvas.remove();
if (window.lastStop) window.lastStop();

const width  = 800;
const height = 400;

const playerRadius = 25;

const jumpForce = 12;

const cTerrain    = 0x0001,
      cPlayerBody = 0x0002;

(() => {

    const engine   = Engine.create();
    const runner   = Runner.create();
    const renderer = createRenderer({element: document.body, engine});

    const world = engine.world;

    const pp = {x: 200, y: 150};

    world.gravity.scale = 0.002;

    const player = Bodies.circle(pp.x, pp.y, playerRadius, {
        density:         .001,
        inertia:         Infinity,
        render:          {
            fillStyle:   'none',
            strokeStyle: 'black',
            lineWidth:   2,
        },
        collisionFilter: {
            category: cPlayerBody,
            mask:     cTerrain,
        },
    });

    const playerGroundSensor = Bodies.circle(pp.x, pp.y + 18, 16, {
        isStatic: true,
        isSensor: true,
        render:   {
            fillStyle:   'transparent',
            strokeStyle: 'rgba(255,255,255,0.7)',
            lineWidth:   1,
        }
    });

    World.add(engine.world, [
        player,
        playerGroundSensor,
    ]);

    const vertices = testTerrain;
    const center   = Vertices.centre(vertices);

    const terrain = Bodies.fromVertices(center.x, center.y + height, vertices, {
        isStatic:        true,
        render:          {
            fillStyle:   '#2e2b44',
            strokeStyle: '#2e2b44',
            lineWidth:   1
        },
        collisionFilter: {
            category: cTerrain,
        }
    });

    console.log(terrain);

    const pendula = [0, 1, 2].map(x => pendulum({
        x: x * 100 + 350, y: 360, width: 60, ropeSeparation: 20,
    }));

    const allTerrain = [
        terrain,
        ...pendula.map(p => p.body),
    ];

    World.add(world, allTerrain);
    World.add(world, pendula.reduce((arr, p) => arr.concat(p.constraints), []));

    const {keysOn: keys, destroy: destroyController} = controller();

    let airborne     = true;
    let positionLock = null;
    let landing      = true;

    const horizontalPlayerMvmt = () => ((keys.right && !keys.left) || (!keys.right && keys.left));

    const updateAirborne = () => {
        airborne = !Query.collides(playerGroundSensor, allTerrain).length;
    };

    const lockPosition = () => {

        if (positionLock) return;

        const collision      = Query.collides(playerGroundSensor, allTerrain)[0];
        const supportingBody = collision.bodyB;
        const parentBody     = supportingBody.parent ? supportingBody.parent : supportingBody;
        const absoluteOrigin = {
            x: player.position.x - player.velocity.x * .3,
            y: player.position.y
        };
        const relativeOrigin = Vector.sub(absoluteOrigin, parentBody.position);

        positionLock = Constraint.create({
            length:    Math.abs(player.velocity.x * 4),
            bodyA:     player,
            pointA:    {x: 0, y: 0},
            bodyB:     parentBody,
            pointB:    relativeOrigin,
            stiffness: .005,
            damping:   .05,
            render:    {
                type: 'line',
            },
        });
        World.add(world, positionLock);
    };

    const unlockPosition = () => {
        if (!positionLock) return;
        World.remove(world, positionLock);
        positionLock = null;
    };

    Events.on(engine, 'beforeUpdate', () => {

        player.friction = .001;

        if (landing && keys.up && !airborne) {
            // keys.up = false;
            unlockPosition();
            Body.setVelocity(player, {x: player.velocity.x, y: -jumpForce});
            landing = false;
            setTimeout(() => landing = true, 100);
        }

        if (horizontalPlayerMvmt()) {
            unlockPosition();
            const targetVelocity = keys.left ? -12 : 12;
            const force          = -(player.velocity.x - targetVelocity) * .0008 * (airborne ? .6 : 1);
            Body.applyForce(player, {x: 0, y: 0}, {x: force, y: 0});
        }
    });

    Events.on(engine, 'afterUpdate', () => {
        updateAirborne();
        Body.setPosition(playerGroundSensor, {
            x: player.position.x - player.velocity.x * .4,
            y: player.position.y + 18
        });
        if (!horizontalPlayerMvmt() && !airborne && landing) lockPosition();
        if (airborne) unlockPosition();
    });

    Render.run(renderer);

    Runner.run(Runner.create(), engine);

    window.lastStop = () => {
        // console.log('killing previous sim (hot reload)');
        Render.stop(renderer);
        Runner.stop(runner);
        Events.off(engine);
        Events.off(renderer);
        destroyController();
    };
})();