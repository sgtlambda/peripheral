import ItemIntent from './../../logic/ItemIntent';
import Player from "../../Player";
import Stage from "../../logic/Stage";

// TODO all items should eventually handle their own intent / affect logic!
export const INTENT_APPLY = Symbol('INTENT_APPLY');

const createApplyIntent = (
  {
    apply,
    primary = true,
    continuous = false,
    applyActionLabel,
  }: {
    apply: (player: Player, stage: Stage) => void;
    primary?: boolean;
    continuous: boolean;
    applyActionLabel: string;
  }) => {
  const keyBind = 'c';  // TODO bind to src/interactionController.ts:14 more explicitly
  return new ItemIntent({
    keyBind,
    primary,
    continuous,
    type:        INTENT_APPLY,
    description: `${applyActionLabel} [lmb] [${keyBind}]`, // TODO [lmb] should depend on `primary`...
    options:     {apply},
  });
};

export default createApplyIntent;