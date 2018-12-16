import {Bodies, Body, World, Events, Vector} from 'matter-js';

import {cTerrain, cPlayer} from './data/collisionGroups';

import debugRender from './data/debugRender';

class Player {

    constructor({

        x, y, angle = 0,

        keys, mouse,
        stage,

        radius = 16,
        moveForce = 5,
        jetpackForce = 9,
        acceleration = .0004,
        friction = .0015,
        density = .001,

    }) {

        this.angle         = 0;
        this.currentPlanet = null;

        // globals
        this.keys  = keys;
        this.mouse = mouse;
        this.stage = stage;

        // configuration
        this.acceleration = acceleration;
        this.moveForce    = moveForce;
        this.jetpackForce = jetpackForce;
        this.friction     = friction;
        this.density      = density;

        this.prepareBodies({x, y, radius});
    }

    get body() {
        return this.collider;
    }

    prepareBodies({x, y, radius}) {

        const pp = {x, y};

        this.collider = Bodies.circle(pp.x, pp.y, radius, {
            density:         this.density,
            friction:        this.friction,
            inertia:         Infinity,
            render:          debugRender,
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

    rotateVector(point) {
        if (!this.currentPlanet) return point;
        const angle = Vector.angle(this.currentPlanet.position, this.position);
        console.log(angle);
    }

    beforeStep() {
        let targetXVelocity = this.controllerHorizontalMovement ? (this.keys.left ? -1 : 1) * this.moveForce : 0;
        // let targetYVelocity = this.keys.up ? -this.jetpackForce : 0;

        let xForce = -(this.collider.velocity.x - targetXVelocity) * this.acceleration;
        let yForce = this.keys.up ? -(this.collider.velocity.y + this.jetpackForce) * this.acceleration : 0;

        Body.applyForce(this.collider, {x: 0, y: 0}, {x: xForce, y: yForce});
    }

    get position() {
        return this.collider.position;
    }

    afterStep() {
        this.angle         = Vector.angle(this.position, this.mouse);
        this.currentPlanet = this.stage.getClosestPlanet(this.position);
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