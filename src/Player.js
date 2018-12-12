import {Bodies, Body, Constraint, Query, Vector, World, Events} from "matter-js";

import {cTerrain, cPlayer} from "./constants/collisionGroups";

class Player {

    constructor({

        x,
        y,
        controller,
        engine,
        terrainBodies,

        radius = 25,
        moveForce = 10,
        friction = .0015,
        density = .001,

    }) {

        // globals
        this.engine        = engine;
        this.controller    = controller;
        this.terrainBodies = terrainBodies;

        // configuration
        this.moveForce = moveForce;
        this.friction  = friction;
        this.density   = density;

        this.prepareBodies({x, y, radius});

        this.addBodies();

        this.attachLoop();
    }

    prepareBodies({x, y, radius}) {

        const pp = {x, y};

        this.collider = Bodies.circle(pp.x, pp.y, radius, {
            density:         this.density,
            friction:        this.friction,
            inertia:         Infinity,
            render:          {
                fillStyle:   'none',
                strokeStyle: '#eee',
                lineWidth:   1,
            },
            collisionFilter: {
                category: cPlayer,
                mask:     cTerrain,
            },
        });

    }

    addBodies() {
        World.add(this.engine.world, [
            this.collider,
        ]);
    }

    attachLoop() {
        this._eBeforeStep = this.beforeStep.bind(this);
        this._eAfterStep  = this.afterStep.bind(this);
        Events.on(this.engine, 'beforeUpdate', this._eBeforeStep);
        Events.on(this.engine, 'afterUpdate', this._eAfterStep);
    }

    get controllerHorizontalMovement() {
        return (this.controller.right && !this.controller.left) ||
            (!this.controller.right && this.controller.left);
    }

    get controllerVerticalMovement() {
        return (this.controller.up && !this.controller.down) ||
            (!this.controller.up && this.controller.down);
    }

    beforeStep() {

        const targetXVelocity = this.controllerHorizontalMovement ? (this.controller.left ? -1 : 1) * this.moveForce : 0;
        const xForce          = -(this.collider.velocity.x - targetXVelocity) * .0008;

        const targetYVelocity = this.controllerVerticalMovement ? (this.controller.up ? -1 : 1) * this.moveForce : 0;
        const yForce          = -(this.collider.velocity.y - targetYVelocity) * .0008;

        Body.applyForce(this.collider, {x: 0, y: 0}, {x: xForce, y: yForce});
    }

    afterStep() {

    }
}

export default Player;