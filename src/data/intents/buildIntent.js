import ItemIntent from './../../logic/ItemIntent';

export default ({
    buildable,
    requires = 1,
    keyBind = 'b',
}) => new ItemIntent({
    keyBind,
    name:        'build',
    description: `[${keyBind}] build ${buildable.name}`,
    options:     {requires, buildable},
});