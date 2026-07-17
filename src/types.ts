import type {Engine, World} from "matter-js";
import type {EngineStep} from "./engineStep";
import type Stage from "./logic/Stage";
import type Player from "./Player";
import type PlayerState from "./logic/PlayerState";

export type Controller<Objects extends object = {}> = {
  destroy: () => void;
} & Objects;

export interface WorldPart {
  provision(world: World): this;
}

export type KeyMap = Record<string, string>;

export type KeysOn = Record<string, boolean>;

/**
 * Everything a player action or item intent needs to affect the game.
 */
export type ActionContext = {
  stage: Stage;
  player: Player;
  playerState: PlayerState;
};

/**
 * The context passed to every system and stepped entity, once per engine step.
 */
export type StepContext = ActionContext & {
  event: EngineStep;
};

export interface HasStep {
  step(ctx: StepContext): void;
}

/**
 * A stepped effect with an optional end-of-life; the stage removes effects
 * whose `isFinished` evaluates to true.
 */
export type StepEffect = HasStep & {
  readonly isFinished?: boolean;
};

/**
 * A unit of game logic driven by the `GameLoop`.
 * `step` runs before the physics update, `afterStep` after it —
 * both in the order the systems are declared in.
 */
export interface System {
  step?(ctx: StepContext): void;

  afterStep?(ctx: StepContext): void;
}

export interface EngineComponent {
  attach(engine: Engine): void;

  detach(engine: Engine): void;
}
