import {Events, Bodies, World} from 'matter-js';

export default class BuildPlaceholderCollider {

    constructor({player, size = 24}) {
        this.player   = player;
        this.collider = Bodies.rectangle(-size / 2, -size / 2, size, size, {
            isSensor: true,
        });
    }

    updateColliderPosition() {
        // TODO

    }

    updateCollisionState() {
        // TODO
    }

    provision(world) {
        World.add(world, [this.collider]);
    }

    attach(engine) {
        this._beforeUpdate = () => this.updateColliderPosition();
        this._afterUpdate  = () => this.updateCollisionState();
        Events.on(engine, 'beforeUpdate', this._beforeUpdate);
        Events.on(engine, 'afterUpdate', this._afterUpdate);
    }

    detach(engine) {
        Events.off(engine, 'beforeUpdate', this._beforeUpdate);
        Events.off(engine, 'afterUpdate', this._afterUpdate);
    }
}