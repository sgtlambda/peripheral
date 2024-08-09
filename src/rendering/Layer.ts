import {Events, Render} from 'matter-js';

import Camera from './Camera';

export type LayerRendererFn = (context: CanvasRenderingContext2D, renderer: Render, camera: Camera) => void;

export type RenderEvent = 'afterRender' | 'beforeRender';

/**
 * Render layer
 */
export default class Layer {

  _render: LayerRendererFn;
  _callback: (e: any) => void;
  hud: boolean;
  over: boolean;
  persistMatrix: boolean;

  /**
   * @param {boolean} hud Whether the render layer should stay in place (static)
   * @param {boolean} over Whether this render layer goes over (true) or under (false) the Matter renderer
   * @param {boolean} persistMatrix Whether to leave the context matrix in place after drawing the layer
   * @param {function} render The render function
   */
  constructor(
    {
      hud = false,
      over = true,
      persistMatrix = false,
      render,
    }: {
      hud?: boolean;
      over?: boolean;
      persistMatrix?: boolean;
      render: LayerRendererFn;
    }) {
    this.hud           = hud;
    this.over          = over;
    this.persistMatrix = persistMatrix;
    this._render       = render;
  }

  get event(): RenderEvent {
    return this.over ? 'afterRender' : 'beforeRender'
  }

  render(renderer: Render, camera: Camera) {
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

  attach(renderer: Render, camera: Camera) {
    this._callback = () => this.render(renderer, camera);
    Events.on(renderer, this.event, this._callback);
  }

  detach(renderer: Render) {
    Events.off(renderer, this.event, this._callback);
  }
}