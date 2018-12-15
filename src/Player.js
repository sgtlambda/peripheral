import {Bodies, Body, World, Events, Vector} from 'matter-js';

import {cTerrain, cPlayer} from './data/collisionGroups';

class Player {

    constructor({

        x, y, angle = 0,

        keys, mouse,
        terrainBodies,

        radius = 25,
        moveForce = 10,
        friction = .0015,
        density = .001,

    }) {

        this.angle = 0;

        // globals
        this.keys          = keys;
        this.mouse         = mouse;
        this.terrainBodies = terrainBodies;

        // configuration
        this.moveForce = moveForce;
        this.friction  = friction;
        this.density   = density;

        this.prepareBodies({x, y, radius});
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

    get controllerHorizontalMovement() {
        return (this.keys.right && !this.keys.left) ||
            (!this.keys.right && this.keys.left);
    }

    get controllerVerticalMovement() {
        return (this.keys.up && !this.keys.down) ||
            (!this.keys.up && this.keys.down);
    }

    beforeStep() {
        const targetXVelocity = this.controllerHorizontalMovement ? (this.keys.left ? -1 : 1) * this.moveForce : 0;
        const xForce          = -(this.collider.velocity.x - targetXVelocity) * .0008;

        const targetYVelocity = this.controllerVerticalMovement ? (this.keys.up ? -1 : 1) * this.moveForce : 0;
        const yForce          = -(this.collider.velocity.y - targetYVelocity) * .0008;

        Body.applyForce(this.collider, {x: 0, y: 0}, {x: xForce, y: yForce});
    }

    get position() {
        return this.collider.position;
    }

    afterStep() {
        this.angle = Vector.angle(this.position, this.mouse);
    }

    provision(world) {
        World.add(world, [this.collider]);
        return this;
    }

    attach(engine) {
        this._eBeforeStep = this.beforeStep.bind(this);
        this._eAfterStep  = this.afterStep.bind(this);
        Events.on(engine, 'beforeUpdate', this._eBeforeStep);
        Events.on(engine, 'afterUpdate', this._eAfterStep);
        return this;
    }

    detach(engine) {
        Events.off(engine, 'beforeUpdate', this._eBeforeStep);
        Events.off(engine, 'afterUpdate', this._eAfterStep);
        this._eBeforeStep = null;
        this._eAfterStep  = null;
    }
}

export default Player;