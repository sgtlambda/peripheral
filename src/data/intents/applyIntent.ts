import ItemIntent from './../../logic/ItemIntent';

// TODO all items should eventually handle their own intent / affect logic!
export const INTENT_APPLY = Symbol('INTENT_APPLY');

const createApplyIntent = (
  {
    apply,
    primary = true,
    keyBind = 'a',
    continuous = false,
  }: {
    apply: () => void;
    primary?: boolean;
    keyBind: string; // TODO better typing / indexed types
    continuous: boolean;
  }) => new ItemIntent({
  keyBind,
  primary,
  continuous,
  type:        INTENT_APPLY,
  description: `apply ${apply.name} [lmb] [${keyBind}]`,
  options:     {apply},
});

export default createApplyIntent;