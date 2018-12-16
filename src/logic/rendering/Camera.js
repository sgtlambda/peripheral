import {Events, Bounds} from 'matter-js';

const boundsWidth  = bounds => bounds.max.x - bounds.min.x;
const boundsHeight = bounds => bounds.max.y - bounds.min.y;

class Camera {

    constructor({

        render,
        trackBody = null,

        width = null,
        height = null,
        y = null,

        smooth = 8,

    }) {

        this.width  = width || boundsWidth(render.bounds);
        this.height = height || boundsHeight(render.bounds);
        this.y      = y || render.bounds.min.y;

        this.smooth = smooth;

        this.render    = render;
        this.trackBody = trackBody;

        Bounds.shift(this.render.bounds, {x: -this.width / 2, y: -this.height / 2});
    }

    get bounds() {
        return this.render.bounds;
    }

    track(body) {
        this.trackBody     = body;
        const boundsTarget = this.getBoundsTarget();
        Bounds.shift(this.render.bounds, boundsTarget);
    }

    getBoundsTarget() {
        return {
            x: this.trackBody.position.x - this.width / 2,
            y: this.trackBody.position.y - this.height / 2,
        };
    }

    beforeTick() {
        if (!this.trackBody) return;

        const {x: targetX, y: targetY} = this.getBoundsTarget();

        const {x: actualX, y: actualY} = this.render.bounds.min;

        const shiftToX = (targetX + actualX * this.smooth) / (this.smooth + 1);
        const shiftToY = (targetY + actualY * this.smooth) / (this.smooth + 1);

        Bounds.shift(this.render.bounds, {x: shiftToX, y: shiftToY});
    }

    attach(engine) {
        this._callback = this.beforeTick.bind(this);
        Events.on(engine, 'beforeTick', this._callback);
        return this;
    }

    detach(engine) {
        if (this._callback) Events.off(engine, 'beforeTick', this._callback);
        this._callback = null;
    }
}

export default Camera;