import {Bodies, Body, Constraint, Query, Vector, World, Events} from "matter-js";

class Player {

    constructor({

        x,
        y,
        controller,
        radius = 25,
        jumpForce = 14,
        jumpCooldown = 100,
        engine,
        terrainBodies,
        collisionCategory,
        collisionMask,

    }) {

        this.jumpForce    = jumpForce;
        this.jumpCooldown = jumpCooldown;

        this.engine        = engine;
        this.controller    = controller;
        this.terrainBodies = terrainBodies;

        this.supportLock = null;
        this.airborne    = false;
        this.landing     = true;

        this.prepareBodies({x, y, radius, collisionCategory, collisionMask});

        this.addBodies();

        this.attachLoop();
    }

    prepareBodies({x, y, radius, collisionCategory, collisionMask}) {

        const pp = {x, y};

        this.player = Bodies.circle(pp.x, pp.y, radius, {
            density:         .001,
            friction:        .001,
            inertia:         Infinity,
            render:          {
                fillStyle:   'none',
                strokeStyle: 'black',
                lineWidth:   2,
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

        console.log('attaching support');

        const collision = Query.collides(this.playerGroundSensor, this.terrainBodies)[0];

        const supportingBody = [collision.bodyB, collision.bodyA].find(({id}) => id !== collision.axisBody.id);

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

    beforeStep() {

        if (this.landing && this.controller.up && !this.airborne) {
            this.detachSupport();
            Body.setVelocity(this.player, {x: this.player.velocity.x, y: -this.jumpForce});
            this.landing = false;
            setTimeout(() => this.landing = true, this.jumpCooldown);
        }

        if (this.controllerHorizontalMovement) {
            this.detachSupport();
            const targetVelocity = this.controller.left ? -12 : 12;
            const force          = -(this.player.velocity.x - targetVelocity) * .0008 * (this.airborne ? .6 : 1);
            Body.applyForce(this.player, {x: 0, y: 0}, {x: force, y: 0});
        }
    }

    afterStep() {

        // Update "airborne" state
        this.airborne = !Query.collides(this.playerGroundSensor, this.terrainBodies).length;

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