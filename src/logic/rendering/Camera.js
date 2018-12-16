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
        if (!this.player) return this.currentAngle;
        if (!this.player.currentPlanet) return this.currentAngle;
        return Vector.angle(this.player.currentPlanet.position, this.player.position) - Math.PI / 2;
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

    rotate({context}) {
        context.rotate(this.currentAngle);
    }

    beforeTick() {
        if (!this.trackBody) return;

        const {x: targetX, y: targetY} = this.getBoundsTarget();
        const {x: actualX, y: actualY} = this.currentBounds;
        const shiftToX                 = (targetX + actualX * this.smooth) / (this.smooth + 1);
        const shiftToY                 = (targetY + actualY * this.smooth) / (this.smooth + 1);

        const targetAngle = this.getTargetAngle();

        // const actualAngle = this.currentAngle;
        // const newAngle    = (targetAngle + actualAngle * this.smooth) / (this.smooth + 1);

        this.currentAngle = targetAngle;

        // console.log(this.currentAngle);

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