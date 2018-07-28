import {Events, Render, Bounds} from 'matter-js';

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

        pad = .48,
        smooth = 8,

    }) {

        this.width  = width || boundsWidth(render.bounds);
        this.height = height || boundsHeight(render.bounds);
        this.y      = y || render.bounds.min.y;

        this.pad    = pad;
        this.smooth = smooth;

        this.engine    = engine;
        this.render    = render;
        this.trackBody = trackBody;

        this.attachEvents();
    }

    // get bounds() {
    //     return this.render.bounds;
    // }

    get paddingAbs() {
        return this.width * this.pad;
    }

    getBoundsTarget() {

        let currentX = this.render.bounds.min.x;
        // make sure the "track body" doesn't disappear towards the right
        // side of the screen
        currentX = Math.max(currentX, this.trackBody.position.x + this.paddingAbs - this.width);
        // make sure the "track body" doesn't disappear off the left side
        // of the screen either
        currentX = Math.min(currentX, this.trackBody.position.x - this.paddingAbs);
        // return Bounds.shift()
        // return Bounds.create({
        //     min: {x: currentX, y: this.y},
        //     max: {x: currentX + this.width, y: this.y + this.height},
        // });
        return currentX;
    }

    attachEvents() {

        this._eBeforeTick = this.beforeTick.bind(this);
        Events.on(this.engine, 'beforeTick', this._eBeforeTick);
    }

    beforeTick() {
        // console.log(this.render);

        // Bounds.translate(this.render.bounds, {x: 1, y: 0});
        const targetX = this.getBoundsTarget();
        const actualX = this.render.bounds.min.x;

        const shiftTo = (targetX + actualX * this.smooth) / (this.smooth + 1);

        Bounds.shift(this.render.bounds, {x: shiftTo, y: this.y});
    }
}

export default Camera;