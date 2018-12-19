import {Events} from 'matter-js';
import Renderer from '../types';

export default class Layer {

    _render: Function;
    _callback: (e: any) => void;
    hud: boolean;
    over: boolean;
    persistMatrix: boolean;
    _hook: string;

    /**
     * @param {boolean} hud Whether the render layer should stay in place (static)
     * @param {boolean} over Whether this render layer goes over (true) or under (false) the Matter renderer
     * @param {boolean} persistMatrix Whether to leave the context matrix in place after drawing the layer
     * @param {function} render The render function
     */
    constructor({
                    hud = false,
                    over = true,
                    persistMatrix = false,
                    render
                }) {
        this.hud = hud;
        this.over = over;
        this.persistMatrix = persistMatrix;
        this._render = render;
        this._hook = this.over ? 'afterRender' : 'beforeRender';
    }

    /**
     * @param {Renderer} renderer
     * @param {Camera} camera
     */
    render(renderer: Renderer, camera) {
        const context = renderer.context;
        if (!this.persistMatrix) context.save();
        if (!this.hud) {
            const translate = renderer.bounds.min;
            camera.rotate(context);
            context.translate(-translate.x, -translate.y);
        }

        this._render(context, renderer, camera);
        if (!this.persistMatrix) context.restore();
    }

    attach(renderer: Renderer, camera) {
        this._callback = () => this.render(renderer, camera);
        Events.on(renderer, this._hook, this._callback);
    }

    detach(renderer: Renderer) {
        Events.off(renderer, this._hook, this._callback);
    }
}