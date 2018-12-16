import {Events} from 'matter-js';

export default class Layer {

    /**
     * @param {boolean} hud Whether the render layer should stay in place (static)
     * @param {boolean} over Whether this render layer goes over (true) or under (false) the Matter renderer
     * @param {function} render The render function
     */
    constructor({hud = false, over = true, render}) {
        this.hud     = hud;
        this.over    = over;
        this._render = render;
        this._hook   = this.over ? 'afterRender' : 'beforeRender';
    }

    render(renderer) {
        const context = renderer.context;
        context.save();
        if (!this.hud) {
            const translate = renderer.bounds.min;
            context.translate(-translate.x, -translate.y);
        }
        this._render(context, renderer);
        context.restore();
    }

    attach(renderer) {
        this._callback = () => this.render(renderer);
        Events.on(renderer, this._hook, this._callback);
    }

    detach(renderer) {
        Events.off(renderer, this._hook, this._callback);
    }
}