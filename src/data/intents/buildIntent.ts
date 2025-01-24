import Buildable from "../../logic/Buildable";
import {ItemIntent} from "../../logic/ItemIntent";

export const INTENT_BUILD = Symbol('INTENT_BUILD');

export type BuildIntentOptions = { requires: number; buildable: Buildable };

export default (
  {
    buildable,
    primary = true,
    requires = 1,
    keyBind = 'b', // TODO bind to src/interactionController.ts:14 more explicitly
  }: {
    buildable: Buildable;
    primary?: boolean;
    requires?: number;
    keyBind?: string;
  },
): ItemIntent<BuildIntentOptions> => ({
  keyBind, primary,
  type:        INTENT_BUILD,
  description: `build ${buildable.name} using ${requires} [lmb] [${keyBind}]`,
  options:     {requires, buildable},
});