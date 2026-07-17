import {Body, Bounds, Engine, Events, Render} from 'matter-js';
import {boundsHeight, boundsWidth} from "../common/bounds";

import {EngineComponent} from "../types";
import {asEngineCallback, EngineStep} from "../engineStep";
import {CameraShakeStack} from "../CameraShakeStack";
import Player from "../Player";

class Camera implements EngineComponent {

  width!: number;
  height!: number;
  render: Render;
  smooth: number;
  player: Player | null = null;
  trackOffset?: { x: number; y: number };
  shakeStack: CameraShakeStack;
  _callback: ((e: EngineStep) => void) | null = null;

  constructor({render, smooth = 8, trackOffset, shakeStack}: {
    render: Render;
    smooth?: number;
    trackOffset?: { x: number; y: number };
    shakeStack: CameraShakeStack;
  }) {

    this.smooth      = smooth;
    this.render      = render;
    this.trackOffset = trackOffset;
    this.shakeStack  = shakeStack;
    this.updateBounds();
    Bounds.shift(this.render.bounds, {
      x: -this.width / 2 + (trackOffset?.x || 0),
      y: -this.height / 2 + (trackOffset?.y || 0),
    });
  }

  updateBounds() {
    this.width  = boundsWidth(this.render.bounds);
    this.height = boundsHeight(this.render.bounds);
  }

  get trackBody(): Body | null {
    return this.player ? this.player.body : null;
  }

  get bounds() {
    return this.render.bounds;
  }

  trackPlayer(player: Player) {
    this.player        = player;
    const boundsTarget = this.getBoundsTarget();
    Bounds.shift(this.render.bounds, boundsTarget);
  }

  getBoundsTarget() {
    // Only called when a player is being tracked
    const trackBody = this.trackBody!;
    return {
      x: trackBody.position.x - this.width / 2 + (this.trackOffset?.x || 0),
      y: trackBody.position.y - this.height / 2 + (this.trackOffset?.y || 0),
    };
  }

  get currentBounds() {
    return this.render.bounds.min;
  }

  get onscreenCenter() {
    return {
      x: (this.render.options.width ?? 0) / 2,
      y: (this.render.options.height ?? 0) / 2,
    };
  }

  rotate(context: CanvasRenderingContext2D) {
    const center = this.onscreenCenter;
    context.translate(center.x, center.y);
    context.translate(-center.x, -center.y);
  }

  beforeTick(event: EngineStep) {

    if (!this.trackBody) return;

    const shakeOffset = this.shakeStack.compute(event);

    const {x: targetX, y: targetY} = this.getBoundsTarget();
    const {x: actualX, y: actualY} = this.currentBounds;

    const shiftToX = (targetX + actualX * this.smooth) / (this.smooth + 1) + shakeOffset.x;
    const shiftToY = (targetY + actualY * this.smooth) / (this.smooth + 1) + shakeOffset.y;

    Bounds.shift(this.render.bounds, {x: shiftToX, y: shiftToY});
  }

  attach(engine: Engine) {
    this._callback = this.beforeTick.bind(this);
    Events.on(engine, 'beforeUpdate', asEngineCallback(this._callback));
    return this;
  }

  detach(engine: Engine) {
    if (this._callback) Events.off(engine, 'beforeUpdate', asEngineCallback(this._callback));
    this._callback = null;
  }
}

export default Camera;