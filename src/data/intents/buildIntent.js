import ItemIntent from './../../logic/ItemIntent';

export default ({
    buildable,
    requires = 1,
    keyBind = 'b',
}) => new ItemIntent({
    keyBind,
    name:        'build',
    description: `build ${buildable.name} [${keyBind}]`,
    options:     {requires, buildable},
});