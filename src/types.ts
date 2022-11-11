// TODO apply this type to all controllers
import {World} from "matter-js";

export type Controller<Objects extends object = {}> = {
  destroy?: () => void;
} & Objects;

export interface WorldPart {
  provision(world: World): this;
}

export type PressedKeys = Record<string, boolean>; // TODO keymap-specific index (?)