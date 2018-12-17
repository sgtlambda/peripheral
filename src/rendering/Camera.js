import {Events, Bounds, Vector} from 'matter-js';

const boundsWidth  = bounds => bounds.max.x - bounds.min.x;
const boundsHeight = bounds => bounds.max.y - bounds.min.y;

class Camera {

    constructor({
        render,

        width = null,
        height = null,
        y = null,

        smooth = 8,
    }) {

        this.width  = width || boundsWidth(render.bounds);
        this.height = height || boundsHeight(render.bounds);
        this.y      = y || render.bounds.min.y;

        this.smooth       = smooth;
        this.render       = render;
        this.currentAngle = 0;

        Bounds.shift(this.render.bounds, {x: -this.width / 2, y: -this.height / 2});
    }

    get trackBody() {
        return this.player ? this.player.body : null;
    }

    get bounds() {
        return this.render.bounds;
    }

    getTargetAngle() {
        return this.player.surfaceAngle + Math.PI / 2;
    }

    trackPlayer(player) {
        this.player        = player;
        const boundsTarget = this.getBoundsTarget();
        Bounds.shift(this.render.bounds, boundsTarget);
    }

    getBoundsTarget() {
        return {
            x: this.trackBody.position.x - this.width / 2,
            y: this.trackBody.position.y - this.height / 2,
        };
    }

    get currentBounds() {
        return this.render.bounds.min;
    }

    get onscreenCenter() {
        return {
            x: this.render.options.width / 2,
            y: this.render.options.height / 2,
        };
    }

    rotate(context) {
        const center = this.onscreenCenter;
        context.translate(center.x, center.y);
        context.rotate(-this.currentAngle);
        context.translate(-center.x, -center.y);
    }

    beforeTick() {
        if (!this.trackBody) return;

        const {x: targetX, y: targetY} = this.getBoundsTarget();
        const {x: actualX, y: actualY} = this.currentBounds;
        const shiftToX                 = (targetX + actualX * this.smooth) / (this.smooth + 1);
        const shiftToY                 = (targetY + actualY * this.smooth) / (this.smooth + 1);

        this.currentAngle = this.getTargetAngle();

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