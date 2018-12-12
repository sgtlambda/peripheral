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
        // jumpForce = 12,
        // terrainRecoilForce = .005,
        // jumpBoost = .005,
        // jumpPressDown = 8,
        // jumpCooldown = 4,
        friction = .0015,
        density = .001,

    }) {

        // globals
        this.engine        = engine;
        this.controller    = controller;
        this.terrainBodies = terrainBodies;

        // configuration
        // this.jumpForce          = jumpForce;
        // this.jumpBoost          = jumpBoost;
        // this.jumpPressDown      = jumpPressDown;
        // this.jumpCooldown       = jumpCooldown;
        this.moveForce          = moveForce;
        // this.terrainRecoilForce = terrainRecoilForce;
        this.friction           = friction;
        this.density            = density;

        // state
        // this.supportLock = null;
        // this.sinceJump   = 0;

        this.prepareBodies({x, y, radius});

        this.addBodies();

        this.attachLoop();
    }

    // /**
    //  * Whether it's been at least "jumpCooldown" ticks since
    //  * the last jump
    //  * @returns {boolean}
    //  */
    // get landing() {
    //     return this.sinceJump > this.jumpCooldown;
    // }

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

        // this.sensor = Bodies.circle(pp.x, pp.y + 18, 16, {
        //     isStatic: true,
        //     isSensor: true,
        //     render:   {
        //         fillStyle:   'transparent',
        //         strokeStyle: 'rgba(255,255,255,0.3)',
        //         lineWidth:   1,
        //     }
        // });
    }

    addBodies() {
        World.add(this.engine.world, [
            this.collider,
            // this.sensor,
        ]);
    }

    attachLoop() {
        this._eBeforeStep = this.beforeStep.bind(this);
        this._eAfterStep  = this.afterStep.bind(this);
        Events.on(this.engine, 'beforeUpdate', this._eBeforeStep);
        Events.on(this.engine, 'afterUpdate', this._eAfterStep);
    }

    // getSupportingBody() {
    // const collision      = this.groundCollisions[0];
    // const supportingBody = [collision.bodyB, collision.bodyA].find(({id}) => id !== this.sensor.id);
    // return supportingBody.parent ? supportingBody.parent : supportingBody;
    // }

    // attachSupport() {
    //
    //     if (this.supportLock) return;
    //
    //     const supportingBody = this.getSupportingBody();
    //
    //     const absoluteOrigin = {
    //         x: this.collider.position.x - this.collider.velocity.x * .3,
    //         y: this.collider.position.y
    //     };
    //
    //     const relativeOrigin = Vector.sub(absoluteOrigin, supportingBody.position);
    //
    //     this.supportLock = Constraint.create({
    //         length:    Math.abs(this.collider.velocity.x * 4),
    //         bodyA:     this.collider,
    //         pointA:    {x: 0, y: 0},
    //         bodyB:     supportingBody,
    //         pointB:    relativeOrigin,
    //         stiffness: .005,
    //         damping:   .05,
    //         render:    {
    //             type:    'line',
    //             visible: false,
    //         },
    //     });
    //
    //     World.add(this.engine.world, this.supportLock);
    // }

    // detachSupport() {
    //     if (!this.supportLock) return;
    //     World.remove(this.engine.world, this.supportLock);
    //     this.supportLock = null;
    // }

    get controllerHorizontalMovement() {
        return (this.controller.right && !this.controller.left) ||
            (!this.controller.right && this.controller.left);
    }

    get controllerVerticalMovement() {
        return (this.controller.up && !this.controller.down) ||
            (!this.controller.up && this.controller.down);
    }

    //
    // getJumpBoost() {
    //     return this.sinceJump < this.jumpPressDown ? this.jumpBoost : 0;
    // }
    //
    // jump() {
    //     this.detachSupport();
    //
    //     Body.setVelocity(this.collider, {x: this.collider.velocity.x, y: -this.jumpForce});
    //
    //     this.sinceJump = 0;
    // }


    beforeStep() {

        // this.sinceJump++;
        //
        // if (this.controller.up) {
        //     const boost = this.getJumpBoost();
        //     if (boost) Body.applyForce(this.collider, {x: 0, y: 0}, {x: 0, y: -boost})
        // }
        //
        // if (this.landing && this.controller.up && !this.airborne) {
        //     this.jump();
        // }

        const targetXVelocity = this.controllerHorizontalMovement ? (this.controller.left ? -1 : 1) * this.moveForce : 0;
        const xForce          = -(this.collider.velocity.x - targetXVelocity) * .0008;
        // Body.applyForce(this.collider, {x: 0, y: 0}, {x: xForce, y: 0});

        const targetYVelocity = this.controllerVerticalMovement ? (this.controller.up ? -1 : 1) * this.moveForce : 0;
        const yForce          = -(this.collider.velocity.y - targetYVelocity) * .0008;

        Body.applyForce(this.collider, {x: 0, y: 0}, {x: xForce, y: yForce});
    }

    // get airborne() {
    //     return !this.groundCollisions.length;
    // }

    afterStep() {

        // Update "airborne" state
        // this.groundCollisions = Query.collides(this.sensor, this.terrainBodies);

        // Always detach from the ground constraint when we're not airborne
        // if (this.airborne) this.detachSupport();

        // Body.setPosition(this.sensor, {
        //     x: this.collider.position.x - this.collider.velocity.x * .4,
        //     y: this.collider.position.y + 18
        // });

        // if (!this.controllerHorizontalMovement && !this.airborne && this.landing) this.attachSupport();
    }
}

export default Player;