import {Events, Bounds} from 'matter-js';

const boundsWidth  = bounds => bounds.max.x - bounds.min.x;
const boundsHeight = bounds => bounds.max.y - bounds.min.y;


class Camera {

    constructor({

        engine,
        render,
        trackBody,

        width = null,
        height = null,
        y = null,

        smooth = 8,

    }) {

        this.width  = width || boundsWidth(render.bounds);
        this.height = height || boundsHeight(render.bounds);
        this.y      = y || render.bounds.min.y;

        this.smooth = smooth;

        this.engine    = engine;
        this.render    = render;
        this.trackBody = trackBody;

        this.attachEvents();

        Bounds.shift(this.render.bounds, {x: -this.width / 2, y: -this.height / 2});
    }

    getBoundsTarget() {
        return {
            x: this.trackBody.position.x - this.width / 2,
            y: this.trackBody.position.y - this.height / 2,
        };
    }

    attachEvents() {

        this._eBeforeTick = this.beforeTick.bind(this);
        Events.on(this.engine, 'beforeTick', this._eBeforeTick);
    }

    beforeTick() {
        const {x: targetX, y: targetY} = this.getBoundsTarget();

        const {x: actualX, y: actualY} = this.render.bounds.min;

        const shiftToX = (targetX + actualX * this.smooth) / (this.smooth + 1);
        const shiftToY = (targetY + actualY * this.smooth) / (this.smooth + 1);

        Bounds.shift(this.render.bounds, {x: shiftToX, y: shiftToY});
    }
}

export default Camera;