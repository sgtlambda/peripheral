// TODO apply this type to all controllers
import {World} from "matter-js";
import {EngineStep} from "./engineStep";
import InteractionHandler from "./logic/InteractionHandler";

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