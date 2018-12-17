import {Bodies, Body, World, Events, Vector} from 'matter-js';

import {cTerrain, cPlayer} from './data/collisionGroups';

import debugRender from './data/debugRender';

import getTotalPlanetaryForce from './common/getTotalPlanetaryForce';

class Player {

    constructor({

        x, y, angle = 0,

        keys, mouse,
        stage,

        radius = 16,

        moveForce = .001,
        jetpackForce = .003,

        // acceleration = .0004,
        frictionWhileMoving = .0015,
        friction = .1,

    }) {

        this.aimAngle = 0;

        // globals
        this.keys  = keys;
        this.mouse = mouse;
        this.stage = stage;

        // configuration
        this.moveForce           = moveForce;
        this.jetpackForce        = jetpackForce;
        this.frictionWhileMoving = frictionWhileMoving;
        this.friction            = friction;

        this.prepareBodies({x, y, radius});
    }

    get body() {
        return this.collider;
    }

    prepareBodies({x, y, radius}) {
        this.collider = Bodies.circle(x, y, radius, {
            friction:        this.friction,
            inertia:         Infinity,
            render:          debugRender,
            collisionFilter: {
                category: cPlayer,
                mask:     cTerrain,
            },
        });
    }

    get surfaceAngle() {
        return this.gravityForce ? Vector.angle(this.gravityForce, {x: 0, y: 0}) : -Math.PI / 2;
    }

    rotateVectorToSurface(point) {
        const angle = this.surfaceAngle + Math.PI / 2;
        return Vector.rotate(point, angle);
    }

    beforeStep() {

        const xForce = (this.keys.left ? -this.moveForce : 0) + (this.keys.right ? this.moveForce : 0);
        const yForce = this.keys.up ? -this.jetpackForce : 0;

        let force = this.rotateVectorToSurface({x: xForce, y: yForce});

        this.collider.friction = this.keys.left || this.keys.right ? this.frictionWhileMoving : this.friction;

        Body.applyForce(this.collider, this.collider.position, force);
    }

    get position() {
        return this.collider.position;
    }

    afterStep() {
        this.aimAngle     = Vector.angle(this.position, this.mouse);
        this.gravityForce = getTotalPlanetaryForce(this.stage.planets, this.body);
    }

    provision(world) {
        World.add(world, [this.collider]);
        return this;
    }

    attach(engine) {
        this._eBeforeStep = this.beforeStep.bind(this);
        this._eAfterStep  = this.afterStep.bind(this);
        Events.on(engine, 'beforeUpdate', this._eBeforeStep);
        Events.on(engine, 'beforeUpdate', this._eAfterStep);
        return this;
    }

    detach(engine) {
        Events.off(engine, 'beforeUpdate', this._eBeforeStep);
        Events.off(engine, 'beforeUpdate', this._eAfterStep);
        this._eBeforeStep = null;
        this._eAfterStep  = null;
    }
}

export default Player;