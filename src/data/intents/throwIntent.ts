import {ItemIntent} from "../../logic/ItemIntent";
import Throwable from "../../logic/Throwable";
import {Vector} from "matter-js";

export const INTENT_THROW = Symbol('INTENT_THROW');

export type ThrowIntentOptions = {
  name: string;
  make: ({x, y, velocity}: { x: number; y: number; velocity: Vector }) => Throwable;
  throwableSpawnOffset: number;
};

export default (
  {
    name,
    make,
    throwableSpawnOffset,
    primary = true,
    keyBind = 't', // TODO bind to src/interactionController.ts:14 more explicitly
    continuous = false,
  }: ThrowIntentOptions & {
    primary?: boolean;
    keyBind?: string;
    continuous?: boolean;
  },
): ItemIntent<ThrowIntentOptions> => ({
  keyBind,
  primary,
  continuous,
  type:        INTENT_THROW,
  description: `throw ${name} [lmb] [${keyBind}]`,
  options:     {name, make, throwableSpawnOffset},
});