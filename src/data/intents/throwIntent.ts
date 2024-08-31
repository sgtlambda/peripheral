import {ItemIntent} from "../../logic/ItemIntent";
import Throwable from "../../logic/Throwable";

export const INTENT_THROW = Symbol('INTENT_THROW');

export default (
  {
    throwable,
    primary = true,
    keyBind = 't', // TODO bind to src/interactionController.ts:14 more explicitly
    continuous = false,
  }: {
    throwable: Throwable;
    primary?: boolean;
    keyBind?: string;
    continuous?: boolean;
  }
): ItemIntent => ({
  keyBind,
  primary,
  continuous,
  type:        INTENT_THROW,
  description: `throw ${throwable.name} [lmb] [${keyBind}]`,
  options:     {throwable},
});