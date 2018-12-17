import ItemIntent from './../../logic/ItemIntent';

export const INTENT_BUILD = Symbol('INTENT_BUILD');

export default ({
    buildable,
    primary = true,
    requires = 1,
    keyBind = 'b',
}) => new ItemIntent({
    keyBind, primary,
    type:        INTENT_BUILD,
    description: `build ${buildable.name} using ${requires} [lmb] [${keyBind}]`,
    options:     {requires, buildable},
});