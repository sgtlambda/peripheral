import {Events} from 'matter-js';

class InteractionHandler {

    constructor({engine, player, playerState}) {
        this.player      = player;
        this.playerState = playerState;
    }

    step() {

    }

    attach(engine) {
        this._callback = () => this.step();
        Events.on(engine, 'afterUpdate', this._callback);
        return this;
    }

    detach(engine) {
        if (this._callback) Events.off(engine, 'afterUpdate', this._callback);
        this._callback = null;
    }
}

export default InteractionHandler;