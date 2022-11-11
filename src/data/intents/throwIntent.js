import ItemIntent from './../../logic/ItemIntent';

export const INTENT_THROW = Symbol('INTENT_THROW');

export default ({
    throwable,
    primary = true,
    keyBind = 't',
    continuous = false,
}) => new ItemIntent({
    keyBind,
    primary,
    continuous,
    type:        INTENT_THROW,
    description: `throw ${throwable.name} [lmb] [${keyBind}]`,
    options:     {throwable},
});