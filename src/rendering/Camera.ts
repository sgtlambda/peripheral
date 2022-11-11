import {Bounds, Events, Render} from 'matter-js';
import {boundsHeight, boundsWidth} from "../common/bounds";

class Camera {

    width: number;
    height: number;
    render: Render;
    smooth: number;
    player: any;
    _callback: (e: any) => void;

    constructor({render, smooth = 8}) {

        this.smooth = smooth;
        this.render = render;
        this.updateBounds();
        Bounds.shift(this.render.bounds, {x: -this.width / 2, y: -this.height / 2});
    }

    updateBounds() {
        this.width = boundsWidth(this.render.bounds);
        this.height = boundsHeight(this.render.bounds);
    }

    get trackBody() {
        return this.player ? this.player.body : null;
    }

    get bounds() {
        return this.render.bounds;
    }

    trackPlayer(player) {
        this.player = player;
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
        context.translate(-center.x, -center.y);
    }

    beforeTick() {
        if (!this.trackBody) return;

        const {x: targetX, y: targetY} = this.getBoundsTarget();
        const {x: actualX, y: actualY} = this.currentBounds;
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