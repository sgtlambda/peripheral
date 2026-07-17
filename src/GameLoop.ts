import {Engine, Events} from 'matter-js';

import {asEngineCallback, EngineStep} from './engineStep';
import {ActionContext, EngineComponent, StepContext, System} from './types';

/**
 * The single update loop of the game.
 *
 * All game logic runs through here: each engine step, every system's `step`
 * is called before the physics update and `afterStep` after it, in the order
 * the systems are declared in `game.ts`. Nothing else should register engine
 * event listeners; declared order is the only ordering mechanism.
 */
export default class GameLoop implements EngineComponent {

  private _before: ((event: EngineStep) => void) | null = null;
  private _after: ((event: EngineStep) => void) | null  = null;

  constructor(
    private readonly systems: System[],
    private readonly context: ActionContext,
  ) {
  }

  attach(engine: Engine) {
    this._before = (event) => {
      const ctx: StepContext = {...this.context, event};
      for (const system of this.systems) system.step?.(ctx);
    };
    this._after  = (event) => {
      const ctx: StepContext = {...this.context, event};
      for (const system of this.systems) system.afterStep?.(ctx);
    };
    Events.on(engine, 'beforeUpdate', asEngineCallback(this._before));
    Events.on(engine, 'afterUpdate', asEngineCallback(this._after));
  }

  detach(engine: Engine) {
    if (this._before) Events.off(engine, 'beforeUpdate', asEngineCallback(this._before));
    if (this._after) Events.off(engine, 'afterUpdate', asEngineCallback(this._after));
    this._before = null;
    this._after  = null;
  }
}
