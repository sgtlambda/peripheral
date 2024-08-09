import {Engine, World} from "matter-js";
import {EngineStep} from "./engineStep";
import InteractionHandler from "./logic/InteractionHandler";

// TODO apply this type to all controllers
export type Controller<Objects extends object = {}> = {
  destroy?: () => void;
} & Objects;

export interface WorldPart {
  provision(world: World): this;
}

export type KeyMap = Record<string, string>;

export type KeysOn = Record<string, boolean>;

export interface HasStep {
  step(event: EngineStep, interactionHandler: InteractionHandler): void;
}

export interface EngineComponent {
  attach(engine: Engine): void;

  detach(engine: Engine): void;
}