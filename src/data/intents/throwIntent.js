import ItemIntent from './../../logic/ItemIntent';

export const INTENT_THROW = Symbol('INTENT_THROW');

export default ({
    throwable,
    primary = true,
    requires = 1,
    keyBind = 't',
}) => new ItemIntent({
    keyBind, primary,
    type:        INTENT_THROW,
    description: `throw ${throwable.name} [lmb] [${keyBind}]`,
    options:     {throwable},
});