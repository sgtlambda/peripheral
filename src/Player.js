import {Bodies, Body, Constraint, Query, Vector, World, Events} from "matter-js";

class Player {

    constructor({

        x,
        y,
        controller,
        engine,
        terrainBodies,
        collisionCategory,
        collisionMask,

        radius = 25,
        moveForce = 10,
        jumpForce = 12,
        jumpBoost = .007,
        jumpPressDown = 10,
        jumpCooldown = 4,
        friction = .0015,
        density = .001,

    }) {

        // globals
        this.engine        = engine;
        this.controller    = controller;
        this.terrainBodies = terrainBodies;

        // configuration
        this.jumpForce     = jumpForce;
        this.jumpBoost     = jumpBoost;
        this.jumpPressDown = jumpPressDown;
        this.jumpCooldown  = jumpCooldown;
        this.moveForce     = moveForce;
        this.friction      = friction;
        this.density       = density;

        // state
        this.supportLock = null;
        this.sinceJump   = 0;

        this.prepareBodies({x, y, radius, collisionCategory, collisionMask});

        this.addBodies();

        this.attachLoop();
    }

    get landing() {
        return this.sinceJump > this.jumpCooldown;
    }


    prepareBodies({x, y, radius, collisionCategory, collisionMask}) {

        const pp = {x, y};

        this.player = Bodies.circle(pp.x, pp.y, radius, {
            density:         this.density,
            friction:        this.friction,
            inertia:         Infinity,
            render:          {
                fillStyle: 'none',
            },
            collisionFilter: {
                category: collisionCategory,
                mask:     collisionMask,
            },
        });

        this.playerGroundSensor = Bodies.circle(pp.x, pp.y + 18, 16, {
            isStatic: true,
            isSensor: true,
            render:   {
                fillStyle:   'transparent',
                strokeStyle: 'rgba(255,255,255,0.7)',
                lineWidth:   1,
            }
        });
    }

    addBodies() {
        World.add(this.engine.world, [
            this.player,
            this.playerGroundSensor,
        ]);
    }

    attachLoop() {
        this._eBeforeStep = this.beforeStep.bind(this);
        this._eAfterStep  = this.afterStep.bind(this);
        Events.on(this.engine, 'beforeUpdate', this._eBeforeStep);
        Events.on(this.engine, 'afterUpdate', this._eAfterStep);
    }

    attachSupport() {

        if (this.supportLock) return;

        const collision = this.groundCollisions[0];

        const supportingBody = [collision.bodyB, collision.bodyA].find(({id}) => id !== this.playerGroundSensor.id);

        const parentBody     = supportingBody.parent ? supportingBody.parent : supportingBody;
        const absoluteOrigin = {
            x: this.player.position.x - this.player.velocity.x * .3,
            y: this.player.position.y
        };
        const relativeOrigin = Vector.sub(absoluteOrigin, parentBody.position);

        this.supportLock = Constraint.create({
            length:    Math.abs(this.player.velocity.x * 4),
            bodyA:     this.player,
            pointA:    {x: 0, y: 0},
            bodyB:     parentBody,
            pointB:    relativeOrigin,
            stiffness: .005,
            damping:   .05,
            render:    {
                type: 'line',
                visible: false,
            },
        });

        World.add(this.engine.world, this.supportLock);
    }

    detachSupport() {
        if (!this.supportLock) return;
        World.remove(this.engine.world, this.supportLock);
        this.supportLock = null;
    }

    get controllerHorizontalMovement() {
        return (this.controller.right && !this.controller.left) ||
            (!this.controller.right && this.controller.left);
    }

    getJumpBoost() {
        return this.sinceJump < this.jumpPressDown ? this.jumpBoost : 0;
    }

    jump() {
        this.detachSupport();
        Body.setVelocity(this.player, {x: this.player.velocity.x, y: -this.jumpForce});
        this.sinceJump = 0;
    }

    beforeStep() {

        this.sinceJump++;

        if (this.controller.up) {
            const boost = this.getJumpBoost();
            if (boost) Body.applyForce(this.player, {x: 0, y: 0}, {x: 0, y: -boost})
        }

        if (this.landing && this.controller.up && !this.airborne) {
            this.jump();
        }

        if (this.controllerHorizontalMovement) {
            this.detachSupport();
            const targetVelocity = (this.controller.left ? -1 : 1) * this.moveForce;
            const force          = -(this.player.velocity.x - targetVelocity) * .0008 * (this.airborne ? .6 : 1);
            Body.applyForce(this.player, {x: 0, y: 0}, {x: force, y: 0});
        }
    }

    get airborne() {
        return !this.groundCollisions.length;
    }

    afterStep() {

        // Update "airborne" state
        this.groundCollisions = Query.collides(this.playerGroundSensor, this.terrainBodies);

        // Always detach from the ground constraint when we're not airborne
        if (this.airborne) this.detachSupport();

        Body.setPosition(this.playerGroundSensor, {
            x: this.player.position.x - this.player.velocity.x * .4,
            y: this.player.position.y + 18
        });

        if (!this.controllerHorizontalMovement && !this.airborne && this.landing) this.attachSupport();
    }
}

export default Player;